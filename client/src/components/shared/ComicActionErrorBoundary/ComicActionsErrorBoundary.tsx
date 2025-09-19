import { ErrorInfo, ReactNode, useCallback, useState } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { AlertTriangle, RefreshCw, Bug } from "lucide-react";
import Button from "../Button";
import * as S from "./styles";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

const createInitialState = (): ErrorState => ({
  hasError: false,
  error: null,
  errorInfo: null,
  errorId: null,
});

const ComicActionsErrorBoundary = ({
  children,
  fallback,
  onError,
}: Props) => {
  const [errorState, setErrorState] = useState<ErrorState>(createInitialState);

  const handleBoundaryError = useCallback(
    (error: Error, errorInfo: ErrorInfo) => {
      const errorId = `error-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 11)}`;

      console.error("🚨 Comic Actions Error Boundary caught an error:", error);
      console.error("Error Info:", errorInfo);
      console.error("Error Context:", {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorId,
      });

      setErrorState({
        hasError: true,
        error,
        errorInfo,
        errorId,
      });

      onError?.(error, errorInfo);

      if (window.console && typeof window.console.error === "function") {
        window.console.error("Comic Actions Error:", {
          error: error.toString(),
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          errorId,
        });
      }
    },
    [onError]
  );

  const handleReset = useCallback(() => {
    setErrorState(createInitialState());
  }, []);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  const copyErrorDetails = useCallback(() => {
    const errorDetails = {
      errorId: errorState.errorId,
      timestamp: new Date().toISOString(),
      error: errorState.error?.toString(),
      stack: errorState.error?.stack,
      componentStack: errorState.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    const errorText = JSON.stringify(errorDetails, null, 2);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(errorText).then(() => {
        console.log("Error details copied to clipboard");
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = errorText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  }, [errorState]);

  const renderFallback = useCallback(
    ({ error, resetErrorBoundary }: FallbackProps) => {
      if (fallback) {
        return fallback;
      }

      const activeError = errorState.hasError ? errorState.error : error;
      const activeErrorId = errorState.hasError ? errorState.errorId : null;
      const activeStack = errorState.hasError
        ? errorState.error?.stack
        : error.stack;

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
                <strong>Error ID:</strong> {activeErrorId ?? "N/A"}
              </p>
              <p>
                <strong>Error:</strong> {activeError?.message ?? "Unknown error"}
              </p>
              {activeStack && (
                <S.ErrorStack>
                  <strong>Stack Trace:</strong>
                  <pre>{activeStack}</pre>
                </S.ErrorStack>
              )}
            </S.ErrorInfo>
          </S.ErrorDetails>

          <S.ErrorActions>
            <Button
              onClick={resetErrorBoundary}
              icon={RefreshCw}
              variant="primary"
            >
              Try Again
            </Button>

            <Button
              onClick={handleReload}
              icon={RefreshCw}
              variant="secondary"
            >
              Reload Page
            </Button>

            <Button
              onClick={copyErrorDetails}
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
    },
    [copyErrorDetails, errorState, fallback, handleReload]
  );

  return (
    <ErrorBoundary
      onError={handleBoundaryError}
      onReset={handleReset}
      fallbackRender={renderFallback}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ComicActionsErrorBoundary;
