'use client';

import type { ProductGalleryImage } from '@/app/types/product-gallery';

interface ProductThumbnailsProps {
  /** All gallery images. */
  images: ProductGalleryImage[];
  /** The currently selected image. */
  selectedImage: ProductGalleryImage | null;
  /** Alt text used for aria labels. */
  alt: string;
  /** Fired when a thumbnail is selected (click or keyboard). */
  onSelect: (image: ProductGalleryImage) => void;
}

export function ProductThumbnails({
  images,
  selectedImage,
  alt,
  onSelect,
}: ProductThumbnailsProps) {
  if (images.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {images.map((image) => {
        const isSelected = selectedImage?.id === image.id;
        return (
          <button
            key={image.id}
            type="button"
            onClick={() => onSelect(image)}
            // Space/Enter activate a button natively, so thumbnails are
            // keyboard-accessible without extra handlers.
            aria-label={image.alt ?? alt}
            aria-pressed={isSelected}
            aria-current={isSelected ? 'true' : undefined}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border overflow-hidden ${
              isSelected
                ? 'border-indigo-600 ring-2 ring-indigo-600'
                : 'border-slate-200 text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500'
            }`}
          >
            <img
              src={image.thumbnailUrl}
              alt={image.alt ?? alt}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </button>
        );
      })}
    </div>
  );
}
