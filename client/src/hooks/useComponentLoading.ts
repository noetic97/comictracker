import { useEffect, useRef } from "react";
import { useLoadingManager } from "../components/shared/LoadingManager/LoadingManagerContext";

/**
 * Hook for components to register their loading state with the global loading manager
 * @param isLoading - Whether this component is currently loading
 * @param componentId - Unique identifier for this component instance
 */
export const useComponentLoading = (
  isLoading: boolean,
  componentId: string
) => {
  const { registerComponentLoading, unregisterComponentLoading } =
    useLoadingManager();
  const isRegistered = useRef(false);

  useEffect(() => {
    if (isLoading && !isRegistered.current) {
      registerComponentLoading(componentId);
      isRegistered.current = true;
    } else if (!isLoading && isRegistered.current) {
      unregisterComponentLoading(componentId);
      isRegistered.current = false;
    }

    // Cleanup on unmount
    return () => {
      if (isRegistered.current) {
        unregisterComponentLoading(componentId);
        isRegistered.current = false;
      }
    };
  }, [
    isLoading,
    componentId,
    registerComponentLoading,
    unregisterComponentLoading,
  ]);
};
