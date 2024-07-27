export interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  children?: React.ReactNode;
  multiple?: boolean;
}
