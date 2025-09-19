interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface ComicValidationOptions {
  requireNumericIssue?: boolean;
  allowEmptyVolume?: boolean;
  allowEmptyType?: boolean;
}

/**
 * Validates a single comic record from CSV data
 */
export const validateComic = (
  comic: any,
  index: number,
  options: ComicValidationOptions = {}
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const {
    requireNumericIssue = false,
    allowEmptyVolume = true,
    allowEmptyType = true,
  } = options;

  // Required fields validation
  if (!comic.publisher || comic.publisher.trim() === "") {
    errors.push(`Row ${index + 1}: Missing publisher`);
  }

  if (!comic.series || comic.series.trim() === "") {
    errors.push(`Row ${index + 1}: Missing series`);
  }

  if (!comic.issue || comic.issue.trim() === "") {
    errors.push(`Row ${index + 1}: Missing issue`);
  }

  // Optional field validation
  if (!allowEmptyVolume && (!comic.volume || comic.volume.trim() === "")) {
    warnings.push(`Row ${index + 1}: Missing volume`);
  }

  if (!allowEmptyType && (!comic.type || comic.type.trim() === "")) {
    warnings.push(`Row ${index + 1}: Missing type`);
  }

  // Issue number validation
  if (requireNumericIssue && comic.issue) {
    const issueNum = parseInt(comic.issue);
    if (isNaN(issueNum)) {
      warnings.push(
        `Row ${index + 1}: Non-numeric issue number "${comic.issue}"`
      );
    }
  }

  // Current value validation
  if (comic["Current Value"]) {
    const value = parseFloat(comic["Current Value"]);
    if (isNaN(value)) {
      warnings.push(
        `Row ${index + 1}: Invalid current value "${comic["Current Value"]}"`
      );
    } else if (value < 0) {
      warnings.push(`Row ${index + 1}: Negative current value "${value}"`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validates a batch of comics and returns summary
 */
export const validateComicBatch = (
  comics: any[],
  options?: ComicValidationOptions
) => {
  const results = comics.map((comic, index) =>
    validateComic(comic, index, options)
  );

  const validComics = comics.filter((_, index) => results[index].isValid);
  const invalidComics = comics
    .map((comic, index) => ({ comic, result: results[index], index }))
    .filter(({ result }) => !result.isValid);

  const allErrors = results.flatMap((r) => r.errors);
  const allWarnings = results.flatMap((r) => r.warnings);

  return {
    total: comics.length,
    valid: validComics.length,
    invalid: invalidComics.length,
    validComics,
    invalidComics: invalidComics.map(({ comic, result, index }) => ({
      index: index + 1,
      data: comic,
      errors: result.errors,
      warnings: result.warnings,
    })),
    errors: allErrors,
    warnings: allWarnings,
    hasErrors: allErrors.length > 0,
    hasWarnings: allWarnings.length > 0,
  };
};

/**
 * Normalizes comic data for consistent processing
 */
export const normalizeComic = (comic: any) => {
  const normalized: any = {
    publisher: (comic.publisher || "").trim(),
    series: (comic.series || "").trim(),
    volume: (comic.volume || "").trim(),
    years: (comic.years || "").trim(),
    type: (comic.type || "").trim(),
    issue: (comic.issue || "").trim(),
    issueNumber: parseIssueNumber(comic.issueNumber || comic.issue),
    currentValue: parseFloat(comic["Current Value"] || comic.currentValue) || 0,
    collected: Boolean(comic.collected),
    isGrail: Boolean(comic.isGrail),
  };

  // Generate unique ID if not provided
  if (!comic.id) {
    normalized.id = generateComicId(normalized);
  } else {
    normalized.id = comic.id;
  }

  return normalized;
};

/**
 * Intelligently parses issue numbers, handling special cases
 */
export const parseIssueNumber = (issue: string | number): number => {
  if (typeof issue === "number") {
    return issue;
  }

  if (!issue || typeof issue !== "string") {
    return 0;
  }

  // Try to extract number from string
  const match = issue.match(/(\d+)/);
  if (match) {
    return parseInt(match[1]);
  }

  // Special cases for non-numeric issues
  const specialIssues: Record<string, number> = {
    fcbd: -1,
    ashcan: -2,
    preview: -3,
    annual: 1000, // Sort annuals after regular issues
    special: 1001,
    "one-shot": 1002,
  };

  const lowerIssue = issue.toLowerCase();
  for (const [key, value] of Object.entries(specialIssues)) {
    if (lowerIssue.includes(key)) {
      return value;
    }
  }

  return 0; // Default for unrecognized formats
};

/**
 * Creates a unique key for comic identification
 */
export const createComicKey = (
  comic: any,
  includeType: boolean = true
): string => {
  const parts = [
    comic.publisher || "",
    comic.series || "",
    comic.volume || "",
    comic.issue || "",
  ];

  if (includeType) {
    parts.push(comic.type || "");
  }

  return parts.join("|").toLowerCase();
};

/**
 * Generates a unique ID for comics
 */
export const generateComicId = (comic: any): string => {
  return `${comic.publisher}-${comic.series}-${comic.volume}-${
    comic.issue || ""
  }`.toLowerCase();
};

/**
 * Generates a unique ID for favorite series
 */
export const generateFavoriteSeriesId = (
  publisher: string,
  series: string,
  volume: string
): string => {
  return `${publisher}-${series}-${volume}`;
};
