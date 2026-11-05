/**
 * Pure, server-safe helpers for deriving the three image resolutions used by
 * the product gallery. No React/hooks here, so these can be imported from
 * both Server Components and Client Components.
 *
 * Supports CDN-style URLs that carry a width query parameter (e.g.
 * `https://images.unsplash.com/photo-abc?w=800&q=80`). Falls back to the same
 * URL for all three resolutions when no size parameter is present.
 */
import type { ProductGalleryImage } from '@/app/types/product-gallery';

const THUMBNAIL_WIDTH = 150;
const MEDIUM_WIDTH = 800;
const ORIGINAL_WIDTH = 1600;

export interface ImageUrlSet {
  thumbnailUrl: string;
  mediumUrl: string;
  originalUrl: string;
}

export function deriveImageUrls(sourceUrl: string): ImageUrlSet {
  const setWidth = (url: string, width: number): string => {
    try {
      const u = new URL(url);
      u.searchParams.set('w', String(width));
      return u.toString();
    } catch {
      // Relative path or unparseable URL: append a width query param.
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}w=${width}`;
    }
  };

  return {
    thumbnailUrl: setWidth(sourceUrl, THUMBNAIL_WIDTH),
    mediumUrl: setWidth(sourceUrl, MEDIUM_WIDTH),
    originalUrl: setWidth(sourceUrl, ORIGINAL_WIDTH),
  };
}

/**
 * Converts a backend ProductImage (single `url`) into a ProductGalleryImage
 * with explicit thumbnail / medium / original URLs.
 *
 * When the image already carries derived URLs (e.g. it was already converted
 * by the backend or a previous `toGalleryImage` call — `ProductGalleryImage`
 * has no `url` field), those URLs are reused as-is instead of re-deriving
 * from a missing/empty `url`, which would otherwise produce broken relative
 * URLs like `?w=800`.
 */
export function toGalleryImage(
  image: {
    url?: string;
    id?: string;
    productId?: string;
    alt?: string | null;
    sortOrder?: number;
    isPrimary?: boolean;
    /** Pre-derived thumbnail URL (when already converted). */
    thumbnailUrl?: string;
    /** Pre-derived medium URL (when already converted). */
    mediumUrl?: string;
    /** Pre-derived original URL (when already converted). */
    originalUrl?: string;
  },
  alt: string,
): ProductGalleryImage {
  // Reuse pre-derived URLs when the image is already a gallery image
  // (no `url` field) to avoid re-deriving from an empty string.
  if (image.mediumUrl || image.thumbnailUrl || image.originalUrl) {
    return {
      id: image.id ?? '',
      productId: image.productId ?? '',
      thumbnailUrl: image.thumbnailUrl ?? '',
      mediumUrl: image.mediumUrl ?? '',
      originalUrl: image.originalUrl ?? '',
      alt: image.alt ?? alt,
      sortOrder: image.sortOrder ?? 0,
      isPrimary: Boolean(image.isPrimary),
    };
  }
  const { thumbnailUrl, mediumUrl, originalUrl } = deriveImageUrls(
    image.url ?? '',
  );
  return {
    id: image.id ?? '',
    productId: image.productId ?? '',
    thumbnailUrl,
    mediumUrl,
    originalUrl,
    alt: image.alt ?? alt,
    sortOrder: image.sortOrder ?? 0,
    isPrimary: Boolean(image.isPrimary),
  };
}
