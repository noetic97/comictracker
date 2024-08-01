import React, { useRef, ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { HiddenInput } from "./styles";
import { FileUploadButtonProps } from "./types";
import Button from "../Button";

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFileSelect,
  accept = "*",
  children,
  multiple = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      if (multiple) {
        Array.from(files).forEach(onFileSelect);
      } else if (files[0]) {
        onFileSelect(files[0]);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Button onClick={handleButtonClick} icon={Upload}>
        {children || "Upload File"}
      </Button>
      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileUpload}
        multiple={multiple}
      />
    </>
  );
};

export default FileUploadButton;
