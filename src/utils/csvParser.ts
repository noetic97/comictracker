import Papa from "papaparse";
import { Comic } from "../types";
import { CSVComicRow, ParseResult } from "../types/csvTypes";

const isValidComic = (row: CSVComicRow): boolean => {
  return (
    !!row.Publisher &&
    !!row.Series &&
    !!row.Issue &&
    !isNaN(parseInt(row.Issue)) &&
    !isNaN(parseFloat(row["Current Value"]))
  );
};

export const parseComicsCSV = async (file: File): Promise<ParseResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVComicRow>(file, {
      header: true,
      complete: (results) => {
        const validComics: Comic[] = [];
        const invalidRows: CSVComicRow[] = [];

        results.data.forEach((row, index) => {
          if (isValidComic(row)) {
            validComics.push({
              id: `imported-${index}`,
              publisher: row.Publisher,
              series: row.Series,
              volume: row.Volume || "",
              years: row.Years || "",
              type: row.Type || "",
              issue: row.Issue,
              issueNumber: parseInt(row.Issue),
              currentValue: parseFloat(row["Current Value"]),
              collected: false,
            });
          } else {
            invalidRows.push(row);
          }
        });

        resolve({ validComics, invalidRows });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
