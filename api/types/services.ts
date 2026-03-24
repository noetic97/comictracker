/**
 * Admin Service
 */

export interface DatabaseCounts {
  comics: number;
  favorites: number;
  alerts: number;
  hiddenPublishers: number;
  total: number;
}

export interface ClearDatabaseResult {
  message: string;
  deleted: DatabaseCounts;
  warning: string;
}

/**
 * Bulk Service
 */

export interface BulkImportResult {
  processed: number;
  created: number;
  updated: number;
  errors: number;
  message: string;
  processingTime: number;
  rate: number;
  validationErrors?: string[];
  duplicatesSkipped?: number;
}

export interface BulkImportOptions {
  validateComics?: boolean;
  skipDuplicates?: boolean;
  reportDetails?: boolean;
}

/**
 * Comics Service
 */

export interface ComicQueryOptions {
  publisher?: string;
  series?: string;
  volume?: string;
  collected?: string;
  isGrail?: string;
  signed?: string;
  grade?: string;
  type?: string;
  minValue?: string;
  maxValue?: string;
  storageLocation?: string;
  search?: string;
  exact?: string;
  page?: string;
  limit?: string;
  offset?: string;
  order?: string;
  favoriteSeriesOnly?: string;
}

export interface ComicQueryResult {
  comics: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Validation Service
 */

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
  warnings?: string[];
  data?: any;
}

export interface BulkValidationResult {
  validComics: any[];
  invalidComics?: any[];
  validationErrors: string[];
  warnings?: string[];
  totalProcessed: number;
  summary?: {
    total: number;
    valid: number;
    invalid: number;
    warningCount: number;
    errorCount: number;
  };
}

// Client-side validation options
export interface ComicValidationOptions {
  requireNumericIssue?: boolean;
  allowEmptyVolume?: boolean;
  allowEmptyType?: boolean;
  transformData?: boolean;
  isCSVData?: boolean; // Flag for CSV-specific processing
}

// CSV validation result
export interface ComicValidationResult {
  isValid: boolean;
  comic?: any;
  errors: string[];
  warnings: string[];
  skippedFields: string[];
}

/**
 * Favorites Service
 */

export interface FavoriteSeriesData {
  publisher: string;
  series: string;
  volume: string;
}

export interface FavoriteSeries extends FavoriteSeriesData {
  id: string;
  dateAdded: string; // Database returns ISO string
  user_id: string;
}

export interface FavoriteCheckResult {
  isFavorite: boolean;
  favorite?: FavoriteSeries;
}

export interface ComicStats {
  total: number;
  collected: number;
  grails: number;
  totalValue: number;
  collectedValue: number;
}

export interface PublisherSummary {
  publisher: string;
  seriesCount: number;
  totalComics: number;
  collectedComics: number;
  grailComics: number;
  totalValue: number;
}

export interface SeriesSummary {
  publisher: string;
  series: string;
  volume: string;
  issueCount: number;
  collectedCount: number;
  grailCount: number;
  totalValue: number;
  collectedValue: number;
  isFavorite?: boolean;
}
