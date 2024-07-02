import React from "react";
import { Comic } from "../types";
import Papa from "papaparse";

interface Props {
  onImport: (comics: Comic[]) => void;
}

const ImportCSV: React.FC<Props> = ({ onImport }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const comics: Comic[] = results.data.map((row: any, index) => ({
            id: `imported-${index}`,
            publisher: row.Publisher,
            series: row.Series,
            volume: row.Volume || "",
            years: row.Years,
            type: row.Type,
            issue: row.Issue,
            currentValue: parseFloat(row["Current Value"]),
            collected: false,
          }));
          onImport(comics);
        },
        header: true,
      });
    }
  };

  return (
    <div className="mb-4">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="p-2 border rounded"
      />
    </div>
  );
};

export default ImportCSV;
