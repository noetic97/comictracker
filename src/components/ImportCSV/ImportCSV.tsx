import React, { useState } from "react";
import FileUploadButton from "../shared/FileUploadButton";
import ErrorMessage from "../shared/ErrorMessage";
import { parseComicsCSV } from "../../utils/csvParser";
import { Comic } from "../../types";

interface Props {
  onImport: (comics: Comic[]) => void;
}

const ImportCSV: React.FC<Props> = ({ onImport }) => {
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    try {
      const { validComics, invalidRows } = await parseComicsCSV(file);
      if (validComics.length === 0) {
        setError(
          "No valid comic data found in the CSV file. Please check the file format and try again."
        );
        return;
      }

      onImport(validComics);
      setError(null);

      if (invalidRows.length > 0) {
        setWarning(
          `Imported ${validComics.length} comics. ${invalidRows.length} rows were skipped due to invalid data.`
        );
      } else {
        setWarning(null);
      }
    } catch (error) {
      console.error("Error parsing CSV:", error);
      setError(
        "Failed to parse CSV file. Please check the file format and try again."
      );
    }
  };

  return (
    <>
      <FileUploadButton onFileSelect={handleFileSelect} accept=".csv">
        Upload CSV
      </FileUploadButton>
      {error && (
        <ErrorMessage
          message={error}
          type="error"
          onDismiss={() => setError(null)}
        />
      )}
      {warning && (
        <ErrorMessage
          message={warning}
          type="warning"
          onDismiss={() => setWarning(null)}
        />
      )}
    </>
  );
};

export default ImportCSV;
