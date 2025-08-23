import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

export type LoadingPhase =
  | "data-loading" // Initial data fetch
  | "components-loading" // Lazy components loading
  | "ready" // All content ready
  | "background-refresh"; // Background updates

export interface LoadingState {
  phase: LoadingPhase;
  message: string;
  subMessage: string;
  progress?: number; // 0-100 for progress indication
}

interface LoadingManagerContextType {
  loadingState: LoadingState;
  setLoadingPhase: (
    phase: LoadingPhase,
    message?: string,
    subMessage?: string
  ) => void;
  registerComponentLoading: (componentId: string) => void;
  unregisterComponentLoading: (componentId: string) => void;
  isComponentsReady: boolean;
}

const LoadingManagerContext = createContext<
  LoadingManagerContextType | undefined
>(undefined);

export const useLoadingManager = () => {
  const context = useContext(LoadingManagerContext);
  if (!context) {
    throw new Error(
      "useLoadingManager must be used within LoadingManagerProvider"
    );
  }
  return context;
};

const getPhaseConfig = (phase: LoadingPhase): Omit<LoadingState, "phase"> => {
  switch (phase) {
    case "data-loading":
      return {
        message: "POW! Loading Comics!",
        subMessage: "Fetching your collection from the database...",
        progress: undefined,
      };
    case "components-loading":
      return {
        message: "ZAP! Preparing Interface!",
        subMessage: "Setting up your comic collection view...",
        progress: undefined,
      };
    case "background-refresh":
      return {
        message: "BOOM! Updating Comics!",
        subMessage: "Getting the latest changes...",
        progress: undefined,
      };
    case "ready":
      return {
        message: "Ready!",
        subMessage: "Your comics are loaded and ready!",
        progress: 100,
      };
  }
};

export const LoadingManagerProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    phase: "ready",
    message: "",
    subMessage: "",
  });

  const [loadingComponents, setLoadingComponents] = useState<Set<string>>(
    new Set()
  );

  const setLoadingPhase = useCallback(
    (
      phase: LoadingPhase,
      customMessage?: string,
      customSubMessage?: string
    ) => {
      const config = getPhaseConfig(phase);
      setLoadingState({
        phase,
        message: customMessage || config.message,
        subMessage: customSubMessage || config.subMessage,
        progress: config.progress,
      });
    },
    []
  );

  const registerComponentLoading = useCallback((componentId: string) => {
    setLoadingComponents((prev) => new Set([...prev, componentId]));
  }, []);

  const unregisterComponentLoading = useCallback((componentId: string) => {
    setLoadingComponents((prev) => {
      const next = new Set(prev);
      next.delete(componentId);
      return next;
    });
  }, []);

  // Auto-transition from components-loading to ready when all components are loaded
  const isComponentsReady = loadingComponents.size === 0;

  useEffect(() => {
    if (loadingState.phase === "components-loading" && isComponentsReady) {
      // Small delay to prevent flash, then transition to ready
      const timer = setTimeout(() => {
        setLoadingPhase("ready");
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [loadingState.phase, isComponentsReady, setLoadingPhase]);

  return (
    <LoadingManagerContext.Provider
      value={{
        loadingState,
        setLoadingPhase,
        registerComponentLoading,
        unregisterComponentLoading,
        isComponentsReady,
      }}
    >
      {children}
    </LoadingManagerContext.Provider>
  );
};
