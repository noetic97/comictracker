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

  // Physical/ownership data (simplified)
  grade?: string; // SIMPLIFIED: Any string grade (9.8, NM, CGC 9.8 SS, etc.)
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
  Grade: string; // SIMPLIFIED: Any string grade
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

// Grade input type for normalization - now much simpler
export type GradeInput = string | null | undefined;

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
