'use client';

import type { ProductGalleryImage } from '@/app/types/product-gallery';
import { ZOOM_CONFIG } from '@/app/types/product-gallery';

interface ProductZoomPanelProps {
  /** The currently selected gallery image. */
  image: ProductGalleryImage | null;
  /** Whether the zoom panel is visible (mouse over the main image). */
  show: boolean;
  /** Background position of the high-res image inside the panel. */
  bgPosition: { x: number; y: number };
  /** Whether the high-res zoom image failed to load. */
  error: boolean;
  /** Whether the high-res zoom image is still loading. */
  loading: boolean;
}

export function ProductZoomPanel({
  image,
  show,
  bgPosition,
  error,
  loading,
}: ProductZoomPanelProps) {
  const panelSize = ZOOM_CONFIG.panelSize;
  const visible = show && !!image && !error;

  const panelStyle: React.CSSProperties = {
    width: panelSize,
    height: panelSize,
    display: visible ? 'block' : 'none',
    backgroundImage: visible ? `url("${image!.originalUrl}")` : 'none',
    backgroundSize: `${ZOOM_CONFIG.zoomLevel * 100}% ${ZOOM_CONFIG.zoomLevel * 100}%`,
    backgroundPosition: `${bgPosition.x}px ${bgPosition.y}px`,
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div
      className="relative overflow-hidden border border-slate-200 rounded-xl bg-slate-50 shadow-lg ring-1 ring-slate-900/5"
      style={panelStyle}
    >
      {loading && !error && (
        <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 bg-slate-100/50">
          Loading zoom…
        </span>
      )}
      {error && (
        <span className="absolute inset-0 flex items-center justify-center p-2 text-xs text-slate-400 bg-slate-100/50 text-center">
          Zoom image unavailable
        </span>
      )}
      {/* Visually hidden label announcing the zoom panel to screen readers. */}
      <span className="sr-only">
        Magnified view of {image?.alt ?? 'product image'}
      </span>
    </div>
  );
}
