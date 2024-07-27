import { Comic } from "../types";
import { CSVComicRow } from "../types/csvTypes";

export const isValidComic = (comic: unknown): comic is Comic => {
  if (typeof comic !== "object" || comic === null) {
    return false;
  }

  const c = comic as Partial<Comic>;

  return (
    typeof c.id === "string" &&
    typeof c.publisher === "string" &&
    typeof c.series === "string" &&
    typeof c.issue === "string" &&
    typeof c.issueNumber === "number" &&
    typeof c.currentValue === "number" &&
    typeof c.collected === "boolean" &&
    c.volume !== undefined &&
    c.years !== undefined &&
    c.type !== undefined
  );
};

export const isValidComicCSVRow = (row: unknown): row is CSVComicRow => {
  if (typeof row !== "object" || row === null) {
    return false;
  }

  const r = row as Partial<CSVComicRow>;

  return (
    typeof r.Publisher === "string" &&
    r.Publisher.trim() !== "" &&
    typeof r.Series === "string" &&
    r.Series.trim() !== "" &&
    typeof r.Issue === "string" &&
    r.Issue.trim() !== "" &&
    !isNaN(parseInt(r.Issue)) &&
    typeof r["Current Value"] === "string" &&
    !isNaN(parseFloat(r["Current Value"]))
  );
};

export const canConvertToComic = (row: CSVComicRow): boolean => {
  return isValidComicCSVRow(row);
};
