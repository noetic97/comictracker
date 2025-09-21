export type CSVFormat = "owned" | "wantlist" | "unknown";

interface FormatDetectionResult {
  format: CSVFormat;
  fieldMapping: Record<string, string>;
}

// Essential header aliases - keep only the most common variations
const CORE_ALIASES: Record<string, string[]> = {
  // Core required fields
  Publisher: ["publisher", "pub"],
  Series: ["series", "title", "comic"],
  Issue: ["issue", "#", "number"],
  "Current Value": ["current value", "value", "price", "worth"],

  // Ownership indicators
  "Price Paid": ["price paid", "paid", "cost"],
  Grade: ["grade", "condition"],

  // Common optional fields
  Volume: ["volume", "vol"],
  Years: ["years", "year"],
  Type: ["type", "format"],
  Notes: ["notes", "comments"],
  Signed: ["signed", "autograph"],

  // Storage fields (map to storageLocation)
  "Storage Location": ["pile", "box", "location", "storage", "where"],

  // Date fields
  "Date Added": ["date added", "added"],
  "Issue Date": ["issue date", "pub date"],
};

// Ownership indicators - if any of these are found, it's likely an owned collection
const OWNERSHIP_INDICATORS = [
  "price paid",
  "paid",
  "cost",
  "grade",
  "condition",
  "pile",
  "box",
  "storage",
  "signed",
  "cert",
];

/**
 * Simplified format detection - focus on owned vs wantlist
 */
export const detectCSVFormat = (headers: string[]): FormatDetectionResult => {
  const lowerHeaders = headers.map((h) => h.trim().toLowerCase());

  // Simple detection: look for ownership indicators
  const hasOwnershipFields = OWNERSHIP_INDICATORS.some((indicator) =>
    lowerHeaders.some((header) => header.includes(indicator))
  );

  const format: CSVFormat = hasOwnershipFields ? "owned" : "wantlist";
  const fieldMapping = createFieldMapping(headers);

  console.log(
    `🔍 CSV Format: ${format} (${
      hasOwnershipFields
        ? "found ownership fields"
        : "no ownership fields detected"
    })`
  );

  return { format, fieldMapping };
};

/**
 * Create field mapping from CSV headers to normalized field names
 */
export const createFieldMapping = (
  headers: string[]
): Record<string, string> => {
  const mapping: Record<string, string> = {};

  headers.forEach((header) => {
    const cleanHeader = header.trim();
    const lowerHeader = cleanHeader.toLowerCase();

    // Try exact match first
    if (CORE_ALIASES[cleanHeader]) {
      mapping[cleanHeader] = cleanHeader;
      return;
    }

    // Try case-insensitive exact match
    const exactMatch = Object.keys(CORE_ALIASES).find(
      (key) => key.toLowerCase() === lowerHeader
    );
    if (exactMatch) {
      mapping[cleanHeader] = exactMatch;
      return;
    }

    // Try alias matching
    for (const [standardField, aliases] of Object.entries(CORE_ALIASES)) {
      const aliasMatch = aliases.some(
        (alias) => lowerHeader === alias || lowerHeader.includes(alias)
      );

      if (aliasMatch) {
        mapping[cleanHeader] = standardField;
        return;
      }
    }

    // No match found - mark as unmapped
    mapping[cleanHeader] = `UNMAPPED_${cleanHeader}`;
  });

  return mapping;
};

/**
 * Normalize a CSV row using field mapping
 */
export const normalizeCSVRow = (
  row: any,
  fieldMapping: Record<string, string>
): any => {
  const normalized: any = {};

  Object.entries(row).forEach(([originalField, value]) => {
    const mappedField = fieldMapping[originalField];

    if (mappedField && !mappedField.startsWith("UNMAPPED_")) {
      // Handle special field mappings
      if (mappedField === "Storage Location") {
        normalized["storageLocation"] = value;
      } else {
        normalized[mappedField] = value;
      }
    }
    // Silently ignore unmapped fields
  });

  return normalized;
};

/**
 * Simple validation - check for minimum required fields
 */
export const validateCSVHeaders = (
  headers: string[]
): {
  isValid: boolean;
  missingFields: string[];
} => {
  const lowerHeaders = headers.map((h) => h.trim().toLowerCase());
  const requiredFields = ["publisher", "series", "issue"];

  const missingFields = requiredFields.filter(
    (required) =>
      !lowerHeaders.some(
        (header) =>
          header === required ||
          header.includes(required) ||
          CORE_ALIASES[
            required.charAt(0).toUpperCase() + required.slice(1)
          ]?.some((alias) => header === alias || header.includes(alias))
      )
  );

  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields.map(
      (field) => field.charAt(0).toUpperCase() + field.slice(1)
    ),
  };
};

/**
 * Quick format check without full parsing
 */
export const quickFormatCheck = (
  headers: string[]
): {
  format: CSVFormat;
  hasRequiredFields: boolean;
  suggestion?: string;
} => {
  const detection = detectCSVFormat(headers);
  const validation = validateCSVHeaders(headers);

  let suggestion: string | undefined;

  if (!validation.isValid) {
    suggestion = `Missing required fields: ${validation.missingFields.join(
      ", "
    )}`;
  } else if (detection.format === "wantlist") {
    suggestion =
      "Want list format detected - comics will be marked as uncollected";
  } else if (detection.format === "owned") {
    suggestion =
      "Owned collection format detected - comics will be marked as collected";
  }

  return {
    format: detection.format,
    hasRequiredFields: validation.isValid,
    suggestion,
  };
};
