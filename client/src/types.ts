// Comic Grade enum (matches Prisma schema)
export enum ComicGrade {
  // Numeric Grades (CGC/CBCS compatible)
  GRADE_10_0 = "GRADE_10_0", // 10.0 - Gem Mint
  GRADE_9_9 = "GRADE_9_9", // 9.9 - Mint
  GRADE_9_8 = "GRADE_9_8", // 9.8 - Near Mint/Mint
  GRADE_9_6 = "GRADE_9_6", // 9.6 - Near Mint+
  GRADE_9_4 = "GRADE_9_4", // 9.4 - Near Mint
  GRADE_9_2 = "GRADE_9_2", // 9.2 - Near Mint-
  GRADE_9_0 = "GRADE_9_0", // 9.0 - Very Fine/Near Mint
  GRADE_8_5 = "GRADE_8_5", // 8.5 - Very Fine+
  GRADE_8_0 = "GRADE_8_0", // 8.0 - Very Fine
  GRADE_7_5 = "GRADE_7_5", // 7.5 - Very Fine-
  GRADE_7_0 = "GRADE_7_0", // 7.0 - Fine/Very Fine
  GRADE_6_5 = "GRADE_6_5", // 6.5 - Fine+
  GRADE_6_0 = "GRADE_6_0", // 6.0 - Fine
  GRADE_5_5 = "GRADE_5_5", // 5.5 - Fine-
  GRADE_5_0 = "GRADE_5_0", // 5.0 - Very Good/Fine
  GRADE_4_5 = "GRADE_4_5", // 4.5 - Very Good+
  GRADE_4_0 = "GRADE_4_0", // 4.0 - Very Good
  GRADE_3_5 = "GRADE_3_5", // 3.5 - Very Good-
  GRADE_3_0 = "GRADE_3_0", // 3.0 - Good/Very Good
  GRADE_2_5 = "GRADE_2_5", // 2.5 - Good+
  GRADE_2_0 = "GRADE_2_0", // 2.0 - Good
  GRADE_1_8 = "GRADE_1_8", // 1.8 - Good-
  GRADE_1_5 = "GRADE_1_5", // 1.5 - Fair/Good
  GRADE_1_0 = "GRADE_1_0", // 1.0 - Fair
  GRADE_0_5 = "GRADE_0_5", // 0.5 - Poor

  // String-based grades
  GMT = "GMT", // Gem Mint
  MT = "MT", // Mint
  NM_M = "NM_M", // Near Mint/Mint
  NM_PLUS = "NM_PLUS", // Near Mint+
  NM = "NM", // Near Mint
  NM_MINUS = "NM_MINUS", // Near Mint-
  VF_NM = "VF_NM", // Very Fine/Near Mint
  VF_PLUS = "VF_PLUS", // Very Fine+
  VF = "VF", // Very Fine
  VF_MINUS = "VF_MINUS", // Very Fine-
  F_VF = "F_VF", // Fine/Very Fine
  FN_PLUS = "FN_PLUS", // Fine+
  FN = "FN", // Fine
  FN_MINUS = "FN_MINUS", // Fine-
  VG_F = "VG_F", // Very Good/Fine
  VG_PLUS = "VG_PLUS", // Very Good+
  VG = "VG", // Very Good
  VG_MINUS = "VG_MINUS", // Very Good-
  GD_VG = "GD_VG", // Good/Very Good
  GD_PLUS = "GD_PLUS", // Good+
  GD = "GD", // Good
  GD_MINUS = "GD_MINUS", // Good-
  FR_GD = "FR_GD", // Fair/Good
  FR = "FR", // Fair
  PR = "PR", // Poor

  // Special conditions
  UNGRADED = "UNGRADED", // Not professionally graded
  RESTORED = "RESTORED", // Has restoration
  QUALIFIED = "QUALIFIED", // Qualified grade (defects noted)
}

export interface Comic {
  id: string;

  // Core identification (existing)
  publisher: string;
  series: string;
  volume?: string;
  years?: string;
  type?: string;
  issue: string; // Required - comics must have an issue number
  issueNumber?: number;

  // Financial data (extended)
  currentValue?: number; // Market value
  pricePaid?: number; // What user paid (null/undefined = want list item)

  // Physical/ownership data (new)
  grade?: ComicGrade; // Comic condition grade
  gradeDetails?: string; // Special designations (Signature Series, etc.)
  storageLocation?: string; // Where comic is physically stored
  notes?: string; // User notes
  cert?: string; // Certificate number (CGC/CBCS)
  signed?: boolean; // Is it signed?
  variantDetails?: string; // Variant information

  // Dates (new)
  dateAdded?: string | Date; // When added to collection
  issueDate?: string; // Publication date (often just month/year)
  datePurchased?: string | Date; // When purchased

  // Creative team (new)
  storyTitle?: string; // Story title
  description?: string; // Story description
  writer?: string; // Writer(s)
  artist?: string; // Artist(s)
  coverArtist?: string; // Cover artist
  letterer?: string; // Letterer
  firstAppearance?: string; // Notable first appearances
  coverImageUrl?: string; // URL to cover image

  // Certification details (new)
  certificationCompany?: string; // CGC, CBCS, PGX, etc.

  // User state (existing)
  collected: boolean;
  isGrail?: boolean;
}

export interface FavoriteSeries {
  id: string;
  publisher: string;
  series: string;
  volume: string;
  dateAdded: number;
}

export type SortOption =
  | "series"
  | "publisher"
  | "currentValue"
  | "pricePaid" // New sort option
  | "grade" // New sort option
  | "dateAdded" // New sort option
  | "issue"
  | "issueNumber"
  | "collected";

export type FilterOption =
  | "all"
  | "favoriteSeriesOnly"
  | "grailComicsOnly"
  | "collected"
  | "uncollected"
  | "signed" // New filter option
  | "graded" // New filter option
  | "ungraded"; // New filter option

interface GroupedComics {
  [key: string]: Comic[];
}

export interface PublisherGroupedComics {
  [publisher: string]: GroupedComics;
}

// Route types for navigation (existing)
export type ViewMode = "grid" | "series-detail";

export interface SeriesDetailParams {
  publisher: string;
  series: string;
  volume?: string;
}

// CSV Types for both formats
export interface WantListCSVRow {
  Publisher: string;
  Series: string;
  Volume?: string;
  Years?: string;
  Type?: string;
  Issue: string;
  "Current Value": string;
  [key: string]: string | undefined; // For any additional fields
}

export interface OwnedListCSVRow {
  Publisher: string;
  Series: string;
  Volume?: string;
  Years?: string;
  Type?: string;
  Issue: string;
  "Current Value": string;
  "Price Paid": string; // New: What was paid
  Grade: string; // New: Condition grade
  Pile: string; // New: Storage location (will map to storageLocation)
  Notes: string; // New: User notes
  CERT: string; // New: Certificate number
  Signed: string; // New: Signed status (will parse to boolean)
  "Date Added": string; // New: When added to collection
  "Issue Date": string; // New: Publication date
  [key: string]: string | undefined; // For any additional fields
}

// Union type for auto-detection
export type CSVComicRow = WantListCSVRow | OwnedListCSVRow;

// Helper type for parsing results
export interface ParseResult {
  validComics: Comic[];
  invalidRows: any[];
  skippedRows: any[]; // New: Rows that failed validation
  detectedFormat: "wantlist" | "owned" | "mixed";
  warnings: string[]; // New: Non-fatal parsing warnings
}

// Grade input type for normalization
export type GradeInput = string | number | null | undefined;

// Date input type for flexible parsing
export type DateInput = string | Date | null | undefined;

// Helper interface for CSV field mapping
export interface CSVFieldMapping {
  required: string[]; // Fields that must be present
  optional: string[]; // Fields that are nice to have
  aliases: Record<string, string[]>; // Alternative field names
}

// Validation result types
export interface FieldValidationResult {
  isValid: boolean;
  normalizedValue: any;
  warnings: string[];
  errors: string[];
}

export interface ComicValidationResult {
  isValid: boolean;
  comic?: Comic;
  errors: string[];
  warnings: string[];
  skippedFields: string[]; // Fields that couldn't be parsed but didn't fail validation
}
