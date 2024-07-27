export type MessageType = "error" | "warning";

export interface ErrorMessageProps {
  message: string;
  type?: MessageType;
  showIcon?: boolean;
  onDismiss?: () => void;
}
