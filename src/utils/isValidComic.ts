import { Comic } from "../types";

export const isValidComic = (comic: any): comic is Comic => {
  return (
    typeof comic === "object" &&
    comic !== null &&
    typeof comic.id === "string" &&
    typeof comic.publisher === "string" &&
    typeof comic.series === "string" &&
    typeof comic.issue === "string" &&
    typeof comic.issueNumber === "number" &&
    typeof comic.currentValue === "number" &&
    typeof comic.collected === "boolean"
  );
};
