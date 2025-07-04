import { Comic } from "../types";

export interface CSVComicRow {
  Publisher: string;
  Series: string;
  Volume?: string;
  Years?: string;
  Type?: string;
  Issue: string;
  "Current Value": string;
  [key: string]: string | undefined; // For any additional fields
}

export interface ParseResult {
  validComics: Comic[];
  invalidRows: CSVComicRow[];
}
