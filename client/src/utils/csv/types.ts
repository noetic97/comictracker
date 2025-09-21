// CSV Types for both formats
interface WantListCSVRow {
  Publisher: string;
  Series: string;
  Volume?: string;
  Years?: string;
  Type?: string;
  Issue: string;
  "Current Value": string;
  [key: string]: string | undefined; // For any additional fields
}

interface OwnedListCSVRow {
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
