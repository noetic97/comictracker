import { Handler } from "@netlify/functions";
import { withPrisma } from "./utils/prisma";
import { handleCors, createResponse, createErrorResponse } from "./utils/cors";

interface AlertRequest {
  message: string;
  severity: "warning" | "error" | "critical";
  source: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

interface AlertLog {
  id: string;
  message: string;
  severity: string;
  source: string;
  sentAt: Date;
  telegramSent: boolean;
  emailSent: boolean;
  error?: string;
}

// Rate limiting - store in memory (could be moved to DB for persistence)
const alertHistory = new Map<string, number>();
const RATE_LIMIT_MINUTES = 60; // Only send alerts once per hour per type

export const handler: Handler = async (event) => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  const { httpMethod } = event;

  if (httpMethod !== "POST") {
    return createErrorResponse(405, "Only POST method allowed for alerts");
  }

  try {
    let alertData: AlertRequest;
    try {
      alertData = JSON.parse(event.body || "{}");
    } catch {
      return createErrorResponse(400, "Invalid JSON body");
    }

    // Validate required fields
    if (!alertData.message || !alertData.severity || !alertData.source) {
      return createErrorResponse(
        400,
        "Missing required fields: message, severity, source"
      );
    }

    // Rate limiting check
    const alertKey = `${alertData.source}-${alertData.severity}`;
    const lastAlertTime = alertHistory.get(alertKey) || 0;
    const now = Date.now();
    const timeSinceLastAlert = now - lastAlertTime;

    if (timeSinceLastAlert < RATE_LIMIT_MINUTES * 60 * 1000) {
      const remainingMinutes = Math.ceil(
        (RATE_LIMIT_MINUTES * 60 * 1000 - timeSinceLastAlert) / (60 * 1000)
      );
      return createResponse(429, {
        message: "Rate limited",
        remainingMinutes,
        lastAlert: new Date(lastAlertTime).toISOString(),
      });
    }

    // Prepare alert message
    const timestamp = alertData.timestamp || new Date().toISOString();
    const fullMessage = `🚨 Comic Tracker Alert

Severity: ${alertData.severity.toUpperCase()}
Source: ${alertData.source}
Time: ${timestamp}

Message: ${alertData.message}

${
  alertData.metadata
    ? `Details: ${JSON.stringify(alertData.metadata, null, 2)}`
    : ""
}`;

    let telegramSent = false;
    let emailSent = false;
    let alertError: string | undefined;

    // Send Telegram alert
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      try {
        await sendTelegramAlert(fullMessage);
        telegramSent = true;
        console.log("✅ Telegram alert sent successfully");
      } catch (error: any) {
        console.error("❌ Telegram alert failed:", error.message);
        alertError = `Telegram: ${error.message}`;
      }
    } else {
      console.log("⚠️ Telegram not configured - skipping");
      alertError = "Telegram: not configured";
    }

    // Send Email alert
    if (process.env.SENDGRID_API_KEY && process.env.ALERT_EMAIL_TO) {
      try {
        await sendEmailAlert(
          alertData.message,
          fullMessage,
          alertData.severity
        );
        emailSent = true;
        console.log("✅ Email alert sent successfully");
      } catch (error: any) {
        console.error("❌ Email alert failed:", error.message);
        alertError = alertError
          ? `${alertError}; Email: ${error.message}`
          : `Email: ${error.message}`;
      }
    } else {
      console.log("⚠️ Email not configured - skipping");
      alertError = alertError
        ? `${alertError}; Email: not configured`
        : "Email: not configured";
    }

    console.log("📝 Alert processed:", {
      message: alertData.message,
      severity: alertData.severity,
      source: alertData.source,
      telegramSent,
      emailSent,
      error: alertError,
      timestamp,
    });

    // Update rate limiting
    if (telegramSent || emailSent) {
      alertHistory.set(alertKey, now);
    }

    return createResponse(200, {
      message: "Alert processed",
      telegramSent,
      emailSent,
      rateLimited: false,
      error: alertError,
    });
  } catch (error: any) {
    console.error("Alert system error:", error);
    return createErrorResponse(500, `Alert system failed: ${error.message}`);
  }
};

async function sendTelegramAlert(message: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error: ${response.status} - ${error}`);
  }
}

async function sendEmailAlert(
  subject: string,
  body: string,
  severity: string
): Promise<void> {
  const sgMail = {
    to: process.env.ALERT_EMAIL_TO!,
    from: process.env.ALERT_EMAIL_FROM || "alerts@your-domain.com",
    subject: `[${severity.toUpperCase()}] Comic Tracker: ${subject}`,
    text: body,
    html: body.replace(/\n/g, "<br>"),
  };

  // Using SendGrid (you could also use Netlify Forms or other services)
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: sgMail.to }],
          subject: sgMail.subject,
        },
      ],
      from: { email: sgMail.from },
      content: [
        { type: "text/plain", value: sgMail.text },
        { type: "text/html", value: sgMail.html },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid API error: ${response.status} - ${error}`);
  }
}
