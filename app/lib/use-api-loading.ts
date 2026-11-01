"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { apiFetch, type ApiError } from "./api";

/**
 * State returned by useApiLoading.
 */
export interface ApiLoadingState<TData> {
  /** The loaded data, or null if not yet loaded */
  data: TData | null;
  /** Whether a request is currently in flight */
  isLoading: boolean;
  /** Error from the last failed request, if any */
  error: Error | null;
  /** Error message string for display, or null */
  errorMessage: string | null;
}

/**
 * Options for useApiLoading.
 */
export interface UseApiLoadingOptions<TData> {
  /** Initial data value */
  initialData?: TData | null;
  /** Whether to start loading immediately on mount */
  immediate?: boolean;
  /** Callback when data is successfully loaded */
  onSuccess?: (data: TData) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * Custom hook that wraps API fetch calls with loading/error state management.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, errorMessage, load, reset } = useApiLoading<Product[]>(
 *   { immediate: true }
 * );
 *
 * useEffect(() => {
 *   load("/products");
 * }, []);
 * ```
 */
export function useApiLoading<TData = unknown>(
  options: UseApiLoadingOptions<TData> = {},
): ApiLoadingState<TData> & {
  /** Trigger a fetch for the given endpoint */
  load: (endpoint: string, init?: RequestInit) => Promise<TData | null>;
  /** Reset loading state */
  reset: () => void;
  /** Set data manually */
  setData: (data: TData | null) => void;
} {
  const {
    initialData = null,
    immediate = false,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<TData | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mountedRef = useRef(true);

  // Cleanup on unmount to prevent state updates after unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(
    async <TResult = TData>(
      endpoint: string,
      init?: RequestInit,
    ): Promise<TResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiFetch<TResult>(endpoint, init);

        if (mountedRef.current) {
          setData(result as unknown as TData);
          setIsLoading(false);
          onSuccess?.(result as unknown as TData);
        }

        return result;
      } catch (err) {
        if (!mountedRef.current) {
          return null;
        }

        const apiError =
          err instanceof Error
            ? err
            : new Error("An unknown error occurred.");

        setError(apiError);
        setIsLoading(false);
        onError?.(apiError);

        return null;
      }
    },
    [onSuccess, onError],
  );

  const reset = useCallback(() => {
    setData(initialData);
    setIsLoading(false);
    setError(null);
  }, [initialData]);

  const setDataValue = useCallback((nextData: TData | null) => {
    setData(nextData);
    if (nextData) {
      setError(null);
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    errorMessage: error?.message ?? null,
    load,
    reset,
    setData: setDataValue,
  };
}
