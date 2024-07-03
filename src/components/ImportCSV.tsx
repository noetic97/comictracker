import React, { useRef } from "react";
import { Comic } from "../types";
import { UploadButton } from "../styles";
import { Upload } from "lucide-react";
import Papa from "papaparse";

interface Props {
  onImport: (comics: Comic[]) => void;
}

const ImportCSV: React.FC<Props> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <UploadButton onClick={handleButtonClick}>
        <Upload size={16} />
        Upload...
      </UploadButton>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default ImportCSV;
