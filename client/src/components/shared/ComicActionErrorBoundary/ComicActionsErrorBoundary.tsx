import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Bug } from "lucide-react";
import Button from "../Button";
import * as S from "./styles";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

class ComicActionsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error("🚨 Comic Actions Error Boundary caught an error:", error);
    console.error("Error Info:", errorInfo);

    // Log additional context
    console.error("Error Context:", {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId,
    });

    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Send error to monitoring service if available
    if (window.console && typeof window.console.error === "function") {
      window.console.error("Comic Actions Error:", {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  copyErrorDetails = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      error: this.state.error?.toString(),
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    const errorText = JSON.stringify(errorDetails, null, 2);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(errorText).then(() => {
        console.log("Error details copied to clipboard");
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = errorText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <S.ErrorBoundaryContainer>
          <S.ErrorIcon>
            <AlertTriangle size={48} />
          </S.ErrorIcon>

          <S.ErrorTitle>Comic Action Failed</S.ErrorTitle>

          <S.ErrorMessage>
            Something went wrong while updating the comic. This might be a
            temporary issue.
          </S.ErrorMessage>

          <S.ErrorDetails>
            <summary>Error Details (Click to expand)</summary>
            <S.ErrorInfo>
              <p>
                <strong>Error ID:</strong> {this.state.errorId}
              </p>
              <p>
                <strong>Error:</strong> {this.state.error?.message}
              </p>
              {this.state.error?.stack && (
                <S.ErrorStack>
                  <strong>Stack Trace:</strong>
                  <pre>{this.state.error.stack}</pre>
                </S.ErrorStack>
              )}
            </S.ErrorInfo>
          </S.ErrorDetails>

          <S.ErrorActions>
            <Button
              onClick={this.handleReset}
              icon={RefreshCw}
              variant="primary"
            >
              Try Again
            </Button>

            <Button
              onClick={this.handleReload}
              icon={RefreshCw}
              variant="secondary"
            >
              Reload Page
            </Button>

            <Button
              onClick={this.copyErrorDetails}
              icon={Bug}
              variant="tertiary"
              size="small"
            >
              Copy Error Details
            </Button>
          </S.ErrorActions>

          <S.ErrorHelpText>
            If this problem persists, please copy the error details and report
            the issue.
          </S.ErrorHelpText>
        </S.ErrorBoundaryContainer>
      );
    }

    return this.props.children;
  }
}

export default ComicActionsErrorBoundary;
