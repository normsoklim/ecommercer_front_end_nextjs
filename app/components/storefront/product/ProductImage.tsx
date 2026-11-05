'use client';

import type { ProductGalleryImage } from '@/app/types/product-gallery';

interface ProductImageProps {
  /** The currently selected gallery image. */
  image: ProductGalleryImage | null;
  /** Alt text for the image. */
  alt: string;
  /** Fired when the mouse moves over the image. */
  onMouseMove: (event: React.MouseEvent<HTMLImageElement>) => void;
  /** Fired when the mouse enters the image. */
  onMouseEnter: () => void;
  /** Fired when the mouse leaves the image. */
  onMouseLeave: () => void;
  /** Fired when the main image fails to load. */
  onLoadError: () => void;
  /** Ref to the measured image element. */
  imgRef: React.RefObject<HTMLImageElement | null>;
  /** Rendered size of the image. */
  imageSize: { width: number; height: number };
}

export function ProductImage({
  image,
  alt,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  onLoadError,
  imgRef,
  imageSize,
}: ProductImageProps) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
      <img
        ref={imgRef}
        src={image?.mediumUrl ?? ''}
        alt={image?.alt ?? alt}
        className="h-full w-full object-cover cursor-crosshair transition-transform duration-300"
        loading="lazy"
        decoding="async"
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onError={onLoadError}
      />
    </div>
  );
}
