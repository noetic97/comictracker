// CSV Format types
export type CSVFormat = "wantlist" | "owned" | "mixed" | "unknown";

// Header detection configurations
const WANTLIST_HEADERS = {
  required: ["Publisher", "Series", "Issue", "Current Value"],
  optional: ["Volume", "Years", "Type"],
  signature: [] as string[], // No unique fields for want list
};

const OWNED_HEADERS = {
  required: ["Publisher", "Series", "Issue", "Current Value", "Price Paid"],
  optional: [
    "Volume",
    "Years",
    "Type",
    "Grade",
    "Pile",
    "Notes",
    "CERT",
    "Signed",
    "Date Added",
    "Issue Date",
  ],
  signature: ["Price Paid", "Grade", "Pile"], // Fields that indicate owned format
};

// Common header variations and aliases
const HEADER_ALIASES: Record<string, string[]> = {
  Publisher: ["publisher", "pub", "company"],
  Series: ["series", "title", "comic", "book"],
  Volume: ["volume", "vol", "v"],
  Years: ["years", "year", "publication year", "pub year"],
  Type: ["type", "format", "variant"],
  Issue: ["issue", "#", "number", "iss"],
  "Current Value": ["current value", "value", "market value", "worth", "price"],
  "Price Paid": ["price paid", "paid", "cost", "purchase price", "bought for"],
  Grade: ["grade", "condition", "rating"],
  Pile: ["pile", "box", "location", "storage", "where"],
  Notes: ["notes", "comments", "description", "memo"],
  CERT: ["cert", "certificate", "certification", "cgc", "cbcs"],
  Signed: ["signed", "autograph", "signature", "auto"],
  "Date Added": ["date added", "added", "date acquired", "acquired"],
  "Issue Date": ["issue date", "publication date", "pub date", "release date"],
};

export interface FormatDetectionResult {
  format: CSVFormat;
  confidence: number;
  reasoning: string[];
  fieldMapping: Record<string, string>;
  missingRequiredFields: string[];
  suggestions: string[];
}

/**
 * Detect CSV format based on headers
 */
export const detectCSVFormat = (headers: string[]): FormatDetectionResult => {
  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());
  const reasoning: string[] = [];
  const missingRequiredFields: string[] = [];
  const suggestions: string[] = [];

  // Check for owned format signature fields
  const ownedSignatureCount = OWNED_HEADERS.signature.filter((field) => {
    const variations = [field.toLowerCase(), ...(HEADER_ALIASES[field] || [])];
    const found = variations.some((variation) =>
      normalizedHeaders.some((header) => header.includes(variation))
    );
    if (found) {
      reasoning.push(`Found owned format indicator: "${field}"`);
    }
    return found;
  }).length;

  // Check required field coverage
  const ownedRequiredCount = OWNED_HEADERS.required.filter((field) => {
    const variations = [field.toLowerCase(), ...(HEADER_ALIASES[field] || [])];
    const found = variations.some((variation) =>
      normalizedHeaders.some((header) => header.includes(variation))
    );
    if (!found) {
      missingRequiredFields.push(field);
    }
    return found;
  }).length;

  const wantlistRequiredCount = WANTLIST_HEADERS.required.filter((field) => {
    const variations = [field.toLowerCase(), ...(HEADER_ALIASES[field] || [])];
    return variations.some((variation) =>
      normalizedHeaders.some((header) => header.includes(variation))
    );
  }).length;

  reasoning.push(
    `Found ${ownedSignatureCount}/${OWNED_HEADERS.signature.length} owned signature fields`
  );
  reasoning.push(
    `Found ${ownedRequiredCount}/${OWNED_HEADERS.required.length} owned required fields`
  );
  reasoning.push(
    `Found ${wantlistRequiredCount}/${WANTLIST_HEADERS.required.length} wantlist required fields`
  );

  // Create field mapping
  const fieldMapping = createFieldMapping(headers);

  // Decision logic with confidence scoring
  let format: CSVFormat;
  let confidence: number;

  if (ownedSignatureCount >= 2 && ownedRequiredCount >= 4) {
    format = "owned";
    confidence = 0.9;
    reasoning.push(
      "High confidence: Strong indicators of owned format detected"
    );
  } else if (ownedSignatureCount >= 1 && ownedRequiredCount >= 3) {
    format = "owned";
    confidence = 0.7;
    reasoning.push(
      "Medium confidence: Moderate indicators of owned format detected"
    );
  } else if (wantlistRequiredCount >= 3 && ownedSignatureCount === 0) {
    format = "wantlist";
    confidence = 0.8;
    reasoning.push(
      "High confidence: Appears to be want list format (no owned-specific fields)"
    );
  } else if (ownedRequiredCount >= 2 && wantlistRequiredCount >= 3) {
    format = "mixed";
    confidence = 0.6;
    reasoning.push("Medium confidence: Contains fields from both formats");
  } else {
    format = "unknown";
    confidence = 0.3;
    reasoning.push("Low confidence: Could not confidently determine format");
  }

  // Generate suggestions for missing fields
  if (missingRequiredFields.length > 0) {
    suggestions.push("Missing required fields for owned format:");
    missingRequiredFields.forEach((field) => {
      const aliases = HEADER_ALIASES[field] || [];
      suggestions.push(`  - "${field}" (alternatives: ${aliases.join(", ")})`);
    });
  }

  return {
    format,
    confidence,
    reasoning,
    fieldMapping,
    missingRequiredFields,
    suggestions,
  };
};

/**
 * Create field mapping from CSV headers to normalized field names
 */
export const createFieldMapping = (
  headers: string[]
): Record<string, string> => {
  const mapping: Record<string, string> = {};

  headers.forEach((header) => {
    const normalizedHeader = header.trim();

    // Try exact match first (case sensitive)
    if (HEADER_ALIASES[normalizedHeader]) {
      mapping[normalizedHeader] = normalizedHeader;
      return;
    }

    // Try case-insensitive exact match
    const exactMatch = Object.keys(HEADER_ALIASES).find(
      (key) => key.toLowerCase() === normalizedHeader.toLowerCase()
    );
    if (exactMatch) {
      mapping[normalizedHeader] = exactMatch;
      return;
    }

    // Try alias matching
    for (const [standardField, aliases] of Object.entries(HEADER_ALIASES)) {
      const headerLower = normalizedHeader.toLowerCase();
      const aliasMatch = aliases.some(
        (alias) => headerLower === alias || headerLower.includes(alias)
      );

      if (aliasMatch) {
        mapping[normalizedHeader] = standardField;
        return;
      }
    }

    // No match found - will be ignored but tracked
    mapping[normalizedHeader] = `UNMAPPED_${normalizedHeader}`;
  });

  return mapping;
};

/**
 * Normalize a single CSV row using field mapping
 */
export const normalizeCSVRow = (
  row: any,
  fieldMapping: Record<string, string>
): any => {
  const normalized: any = {};

  Object.entries(row).forEach(([originalField, value]) => {
    const mappedField = fieldMapping[originalField];
    if (mappedField && !mappedField.startsWith("UNMAPPED_")) {
      normalized[mappedField] = value;
    } else if (mappedField?.startsWith("UNMAPPED_")) {
      // Keep unmapped fields for debugging but prefix them
      normalized[mappedField] = value;
    }
  });

  // Handle special field mappings that need renaming
  if (normalized["Pile"]) {
    normalized["storageLocation"] = normalized["Pile"];
    delete normalized["Pile"];
  }

  return normalized;
};

/**
 * Validate that CSV has minimum required fields for processing
 */
export const validateCSVHeaders = (
  headers: string[]
): {
  isValid: boolean;
  missingFields: string[];
  suggestions: string[];
  confidence: number;
} => {
  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());
  const missingFields: string[] = [];
  const suggestions: string[] = [];

  // Check for absolute minimum fields (any format needs these)
  const minimumRequired = ["Publisher", "Series", "Issue"];

  let foundCount = 0;
  for (const required of minimumRequired) {
    const variations = [
      required.toLowerCase(),
      ...(HEADER_ALIASES[required] || []),
    ];
    const found = variations.some((variation) =>
      normalizedHeaders.some((header) => header.includes(variation))
    );

    if (found) {
      foundCount++;
    } else {
      missingFields.push(required);
      suggestions.push(
        `Missing "${required}" field. Try: ${
          HEADER_ALIASES[required]?.join(", ") || required
        }`
      );
    }
  }

  const confidence = foundCount / minimumRequired.length;

  return {
    isValid: missingFields.length === 0,
    missingFields,
    suggestions,
    confidence,
  };
};

/**
 * Get format-specific field requirements and recommendations
 */
export const getFormatRequirements = (
  format: CSVFormat
): {
  required: string[];
  recommended: string[];
  description: string;
} => {
  switch (format) {
    case "wantlist":
      return {
        required: WANTLIST_HEADERS.required,
        recommended: WANTLIST_HEADERS.optional,
        description: "Want List format - comics you want to collect",
      };

    case "owned":
      return {
        required: OWNED_HEADERS.required,
        recommended: OWNED_HEADERS.optional,
        description: "Owned Collection format - comics you currently own",
      };

    case "mixed":
      return {
        required: [...WANTLIST_HEADERS.required, "Price Paid"],
        recommended: [...WANTLIST_HEADERS.optional, ...OWNED_HEADERS.optional],
        description: "Mixed format - contains both want list and owned comics",
      };

    case "unknown":
    default:
      return {
        required: ["Publisher", "Series", "Issue"],
        recommended: ["Current Value", "Volume", "Years", "Type"],
        description: "Unknown format - will attempt best-effort parsing",
      };
  }
};

/**
 * Generate a field mapping report for debugging
 */
export const generateFieldMappingReport = (
  fieldMapping: Record<string, string>,
  detectedFormat: CSVFormat
): string => {
  const lines = [
    `FIELD MAPPING REPORT`,
    `===================`,
    ``,
    `Detected Format: ${detectedFormat}`,
    ``,
    `MAPPED FIELDS:`,
  ];

  const mapped = Object.entries(fieldMapping).filter(
    ([_, mapped]) => !mapped.startsWith("UNMAPPED_")
  );
  const unmapped = Object.entries(fieldMapping).filter(([_, mapped]) =>
    mapped.startsWith("UNMAPPED_")
  );

  mapped.forEach(([original, mapped]) => {
    lines.push(`  "${original}" → ${mapped}`);
  });

  if (unmapped.length > 0) {
    lines.push(``, `UNMAPPED FIELDS (will be ignored):`);
    unmapped.forEach(([original]) => {
      lines.push(`  "${original}" → IGNORED`);
    });
  }

  const requirements = getFormatRequirements(detectedFormat);
  lines.push(``, `FORMAT REQUIREMENTS:`);
  lines.push(`  Required: ${requirements.required.join(", ")}`);
  lines.push(`  Recommended: ${requirements.recommended.join(", ")}`);
  lines.push(`  Description: ${requirements.description}`);

  return lines.join("\n");
};
