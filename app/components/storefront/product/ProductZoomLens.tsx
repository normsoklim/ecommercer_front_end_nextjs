'use client';

import type { ProductGalleryImage } from '@/app/types/product-gallery';
import { ZOOM_CONFIG } from '@/app/types/product-gallery';

interface ProductZoomLensProps {
  /** The currently selected gallery image (used for the lens background). */
  image: ProductGalleryImage | null;
  /** Whether the lens is visible. */
  show: boolean;
  /** Clamped lens position within the image container. */
  position: { x: number; y: number };
  /** Rendered size of the main image (for background-position %). */
  imageSize: { width: number; height: number };
}

export function ProductZoomLens({
  image,
  show,
  position,
  imageSize,
}: ProductZoomLensProps) {
  const lensSize = ZOOM_CONFIG.lensSize;
  const visible = show && !!image && imageSize.width > 0;

  // The cursor point sits at the centre of the lens, so the background
  // position is expressed as a percentage of the main image.
  const xPercent = imageSize.width ? (position.x / imageSize.width) * 100 : 0;
  const yPercent = imageSize.height ? (position.y / imageSize.height) * 100 : 0;

  const lensStyle: React.CSSProperties = {
    width: lensSize,
    height: lensSize,
    left: position.x - lensSize / 2,
    top: position.y - lensSize / 2,
    display: visible ? 'block' : 'none',
    pointerEvents: 'none',
    backgroundImage: visible ? `url("${image!.mediumUrl}")` : 'none',
    backgroundSize: `${ZOOM_CONFIG.lensZoom * 100}% ${ZOOM_CONFIG.lensZoom * 100}%`,
    backgroundPosition: `${xPercent}% ${yPercent}%`,
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div
      className="absolute rounded-full border-2 border-indigo-500 bg-white shadow-lg"
      style={lensStyle}
      aria-hidden="true"
    />
  );
}
