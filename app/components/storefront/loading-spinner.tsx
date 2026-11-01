"use client";

import { Loader2 } from "lucide-react";

type LoadingSpinnerProps = {
  /** Size of the spinner in pixels (default: 24) */
  size?: number;
  /** CSS class name for additional styling */
  className?: string;
  /** Whether the spinner should spin */
  spinning?: boolean;
  /** Color of the spinner (uses Tailwind text color classes) */
  color?: string;
  /** Accessibility label */
  ariaLabel?: string;
};

export function LoadingSpinner({
  size = 24,
  className,
  spinning = true,
  color = "text-slate-500",
  ariaLabel = "Loading",
}: LoadingSpinnerProps) {
  return (
    <Loader2
      size={size}
      className={`${
        spinning ? "animate-spin" : ""
      } ${color} ${className ?? ""}`}
      aria-label={ariaLabel}
    />
  );
}
