"use client";

import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "./loading-spinner";

type LoadingStateProps<TData> = {
  /** Whether data is currently being loaded */
  isLoading: boolean;
  /** Error message if the request failed */
  error: Error | null;
  /** The loaded data (if any) */
  data: TData | null;
  /** Message to show while loading */
  loadingMessage?: string;
  /** Message to show when there is an error */
  errorMessage?: string;
  /** Message to show when there is no data */
  emptyMessage?: string;
  /** Optional retry callback */
  onRetry?: () => void;
  /** Label for the retry button */
  retryLabel?: string;
  /** CSS class name for the container */
  className?: string;
  /** Size of the loading spinner */
  spinnerSize?: number;
  /** Children to render when data is loaded */
  children?: React.ReactNode;
};

export function LoadingState<TData>({
  isLoading,
  error,
  data,
  loadingMessage = "Loading...",
  errorMessage = "Something went wrong.",
  emptyMessage = "No data available.",
  onRetry,
  retryLabel = "Try again",
  className,
  spinnerSize = 24,
  children,
}: LoadingStateProps<TData>) {
  // Show loading state
  if (isLoading && !data) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 text-slate-500 ${className ?? ""}`}
      >
        <LoadingSpinner size={spinnerSize} color="text-slate-500" />
        <p className="mt-3 text-sm">{loadingMessage}</p>
      </div>
    );
  }

  // Show error state
  if (error && !data) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 text-slate-500 ${className ?? ""}`}
      >
        <AlertCircle size={48} className="text-rose-500 mb-3" />
        <p className="text-sm">{errorMessage}</p>
        {onRetry && (
          <button
            key="retry"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <RefreshCw size={14} />
            {retryLabel}
          </button>
        )}
      </div>
    );
  }

  // Show empty state
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 text-slate-500 ${className ?? ""}`}
      >
        <AlertCircle size={32} className="text-slate-300 mb-3" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  // Data loaded successfully - return null so children render normally
  return null;
}
