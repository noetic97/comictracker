export interface Comic {
  id: string;

  // Core identification (existing)
  publisher: string;
  series: string;
  volume?: string;
  years?: string;
  type?: string;
  issue: string; // Required - comics must have an issue number
  issueNumber?: number; // converted value from issue cast to number

  // Financial data (extended)
  currentValue?: number; // Market value
  pricePaid?: number; // What user paid (null/undefined = want list item)

  // Physical/ownership data
  grade?: string; // Any string grade (9.8, NM, CGC 9.8 SS, etc.)
  gradeDetails?: string; // Special designations (Signature Series, etc.)
  storageLocation?: string; // Where comic is physically stored
  notes?: string; // User notes
  cert?: string; // Certificate number (CGC/CBCS)
  signed?: boolean; // Is it signed?
  variantDetails?: string; // Variant information

  // Dates
  dateAdded?: string | Date; // When added to collection
  issueDate?: string; // Publication date (often just month/year)
  datePurchased?: string | Date; // When purchased

  // Creative team
  storyTitle?: string; // Story title
  description?: string; // Story description
  writer?: string; // Writer(s)
  artist?: string; // Artist(s)
  coverArtist?: string; // Cover artist
  letterer?: string; // Letterer
  firstAppearance?: string; // Notable first appearances
  coverImageUrl?: string; // URL to cover image

  // Certification details
  certificationCompany?: string; // CGC, CBCS, PGX, etc.

  // User state (existing)
  collected: boolean;
  isGrail?: boolean;
  grailReason?: string; // Why this is a key (first appearance, printing error, etc.)
}

export interface FavoriteSeries {
  id: string;
  publisher: string;
  series: string;
  volume: string;
  dateAdded: number;
}

export interface PullListSeries {
  publisher: string;
  series: string;
  volume: string;
}

export interface PullListSummary {
  id: string;
  name: string;
  seriesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PullListDetail extends PullListSummary {
  series: PullListSeries[];
}

interface GroupedComics {
  [key: string]: Comic[];
}

export interface PublisherGroupedComics {
  [publisher: string]: GroupedComics;
}
