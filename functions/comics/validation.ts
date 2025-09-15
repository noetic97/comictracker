export interface ExtendedComicInput {
  // Core fields (required)
  publisher: string;
  series: string;
  issue: string;

  // Core optional fields
  issueNumber?: string | number;
  currentValue?: string | number;
  volume?: string;
  years?: string;
  type?: string;

  // Extended fields
  pricePaid?: string | number;
  grade?: string;
  gradeDetails?: string;
  storageLocation?: string;
  notes?: string;
  cert?: string;
  signed?: boolean | string;
  variantDetails?: string;
  dateAdded?: string | Date;
  issueDate?: string;
  datePurchased?: string | Date;
  storyTitle?: string;
  description?: string;
  writer?: string;
  artist?: string;
  coverArtist?: string;
  letterer?: string;
  firstAppearance?: string;
  coverImageUrl?: string;
  certificationCompany?: string;
  collected?: boolean;
  isGrail?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: any;
}

export interface BulkValidationResult {
  validComics: any[];
  validationErrors: string[];
  totalProcessed: number;
}

const isNonEmptyString = (v: any): boolean =>
  typeof v === "string" && v.trim().length > 0;

const parseNumericField = (value: any): number | null => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;

  const parsed = parseFloat(String(value).replace(/[\$,\s]/g, ""));
  return isNaN(parsed) ? null : parsed;
};

const parseBooleanField = (value: any): boolean => {
  if (typeof value === "boolean") return value;
  if (!value) return false;

  const str = String(value).trim().toLowerCase();
  return ["true", "yes", "y", "1", "on", "signed", "checked"].includes(str);
};

const parseDateField = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;

  const parsed = new Date(String(value));
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Validate a single comic input
 */
export const validateComic = (data: any, index?: number): ValidationResult => {
  const errors: string[] = [];
  const prefix = index !== undefined ? `Index ${index}: ` : "";

  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      errors: [`${prefix}Body must be a JSON object`],
    };
  }

  // Required fields validation
  if (!isNonEmptyString(data.publisher)) {
    errors.push(
      `${prefix}'publisher' is required and must be a non-empty string`
    );
  }
  if (!isNonEmptyString(data.series)) {
    errors.push(`${prefix}'series' is required and must be a non-empty string`);
  }
  if (!isNonEmptyString(data.issue)) {
    errors.push(`${prefix}'issue' is required and must be a non-empty string`);
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Transform and validate the data
  const transformedData = transformComicInput(data);

  return {
    isValid: true,
    errors: [],
    data: transformedData,
  };
};

/**
 * Validate an array of comics for bulk operations
 */
export const validateComicBatch = (comics: any[]): BulkValidationResult => {
  if (!Array.isArray(comics)) {
    return {
      validComics: [],
      validationErrors: ["Expected 'comics' array for bulk operation"],
      totalProcessed: 0,
    };
  }

  const validComics: any[] = [];
  const validationErrors: string[] = [];

  for (let i = 0; i < comics.length; i++) {
    const result = validateComic(comics[i], i);

    if (result.isValid && result.data) {
      validComics.push(result.data);
    } else {
      validationErrors.push(...result.errors);
    }
  }

  return {
    validComics,
    validationErrors,
    totalProcessed: comics.length,
  };
};

/**
 * Transform frontend comic input to database format
 */
export const transformComicInput = (comic: ExtendedComicInput): any => {
  return {
    // Core fields
    publisher: comic.publisher.trim(),
    series: comic.series.trim(),
    volume: (comic.volume || "").trim(),
    years: (comic.years || "").trim(),
    type: (comic.type || "").trim(),
    issue: comic.issue.trim(),
    issueNumber: parseNumericField(comic.issueNumber || comic.issue) || 1,

    // Financial fields
    currentValue: parseNumericField(comic.currentValue) || 0,
    pricePaid: parseNumericField(comic.pricePaid),

    // Physical/ownership fields
    grade: comic.grade?.trim() || null,
    gradeDetails: comic.gradeDetails?.trim() || null,
    storageLocation: comic.storageLocation?.trim() || null,
    notes: comic.notes?.trim() || null,
    cert: comic.cert?.trim() || null,
    signed: parseBooleanField(comic.signed),
    variantDetails: comic.variantDetails?.trim() || null,

    // Date fields
    dateAdded: parseDateField(comic.dateAdded),
    issueDate: comic.issueDate?.trim() || null,
    datePurchased: parseDateField(comic.datePurchased),

    // Creative team fields
    storyTitle: comic.storyTitle?.trim() || null,
    description: comic.description?.trim() || null,
    writer: comic.writer?.trim() || null,
    artist: comic.artist?.trim() || null,
    coverArtist: comic.coverArtist?.trim() || null,
    letterer: comic.letterer?.trim() || null,
    firstAppearance: comic.firstAppearance?.trim() || null,
    coverImage_url: comic.coverImageUrl?.trim() || null,
    certificationCompany: comic.certificationCompany?.trim() || null,

    // User state - auto-determine collected based on pricePaid
    collected:
      comic.collected ??
      (parseNumericField(comic.pricePaid) !== null &&
        parseNumericField(comic.pricePaid)! >= 0),
    is_grail: Boolean(comic.isGrail),
  };
};

/**
 * Transform database comic to frontend format
 * IMPORTANT: Database uses camelCase, frontend expects camelCase too
 */
export const transformComicOutput = (comic: any): any => {
  // Most fields are already in the correct format since DB uses camelCase
  // Only need to transform the user_id field
  return {
    ...comic,
    userId: comic.user_id, // Transform snake_case user_id to camelCase userId
    // All other fields are already camelCase in the database
  };
};
