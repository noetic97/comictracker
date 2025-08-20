import React from "react";
import FileUploadButton from "../../shared/FileUploadButton";
import * as S from "./styles";

interface FileUploadSectionProps {
  onFileSelect: (file: File) => void;
  isImporting: boolean;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  onFileSelect,
  isImporting,
}) => {
  if (isImporting) {
    return null; // Don't show upload section while importing
  }

  return (
    <S.UploadSection>
      <FileUploadButton onFileSelect={onFileSelect} accept=".csv">
        Upload CSV
      </FileUploadButton>
    </S.UploadSection>
  );
};

export default FileUploadSection;
