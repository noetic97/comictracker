/**
 * Local Express server: serves API and static SPA.
 * Replaces Netlify for local and self-hosted deployment.
 */

// Load .env from project root (where package.json lives)
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

try {
  require("dotenv").config({ path: path.join(projectRoot, ".env") });
} catch {
  // dotenv not installed; use env or default below
}

// Default SQLite DB if no DATABASE_URL (so Prisma can connect without .env)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./prisma/dev.db";
}
// Resolve relative file: URLs to absolute path so DB opens regardless of cwd
const dbUrl = process.env.DATABASE_URL;
if (dbUrl?.startsWith("file:./") || dbUrl?.startsWith("file:.")) {
  const relativePath = dbUrl.replace(/^file:\.?\/?/, "");
  const absolutePath = path.join(projectRoot, relativePath);
  process.env.DATABASE_URL = `file:${absolutePath}`;
}
import express from "express";
import { createRequestHandler } from "./adapter";
import { healthHandler } from "./routes/health";
import { comicsHandler } from "./routes/comics";
import { favoritesHandler } from "./routes/favorites";
import { adminHandler } from "./routes/admin";
import { alertsHandler } from "./routes/alerts";

const app = express();
const PORT_WANTED = Number(process.env.PORT) || 3001;

app.use(express.json({ limit: "10mb" }));

// CORS for API
app.use("/api", (req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// API routes (mirror Netlify redirects: /api/* -> handlers)
app.all("/api/health", createRequestHandler(healthHandler));
app.all("/api/comics*", createRequestHandler(comicsHandler));
app.all("/api/favorites*", createRequestHandler(favoritesHandler));
app.all("/api/admin", createRequestHandler(adminHandler));
app.all("/api/alerts", createRequestHandler(alertsHandler));

// Static SPA (production)
const distPath = path.join(__dirname, "../client/dist");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

function tryListen(port: number, maxTries = 5): void {
  const server = app.listen(port, () => {
    console.log(`Comic Tracker server running at http://localhost:${port}`);
    console.log(`  API: http://localhost:${port}/api`);
    console.log(`  Static: http://localhost:${port}/`);
    if (port !== PORT_WANTED) {
      console.log(`  (Port ${PORT_WANTED} was in use. Update client/vite.config.ts proxy target to http://localhost:${port} or free the port.)`);
    }
  });
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE" && port - PORT_WANTED < maxTries) {
      tryListen(port + 1, maxTries - 1);
    } else {
      console.error(`Could not start server: ${err.message}`);
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${port} is in use. Kill the process (e.g. \`lsof -ti:${port} | xargs kill\`) or set PORT in .env to another port.`);
      }
      process.exit(1);
    }
  });
}
tryListen(PORT_WANTED);
