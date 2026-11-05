/**
 * Product gallery image with the three resolutions required for the
 * Amazon-style hover zoom experience:
 *
 * - thumbnailUrl: ~150x150, used in the thumbnail strip
 * - mediumUrl:    ~800x800, used as the main displayed image
 * - originalUrl:  ~1600x1600+, used in the separate zoom panel
 *
 * The backend (NestJS + PostgreSQL) stores and returns these URLs. When a
 * single source URL is available, the frontend can derive the variants from
 * it (see lib/products.ts / the image-url helper) so existing records keep
 * working without a schema change.
 */
export interface ProductGalleryImage {
  id: string;
  productId: string;
  thumbnailUrl: string;
  mediumUrl: string;
  originalUrl: string;
  alt: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductGalleryProps {
  images: ProductGalleryImage[];
  alt: string;
}

/**
 * Zoom configuration constants. Kept in one place so the lens, panel and
 * hook all agree on the magnification factor and sizes.
 */
export const ZOOM_CONFIG = {
  /** Magnification applied in the separate zoom panel (2.5x - 3x). */
  zoomLevel: 2.75,
  /** Magnification applied inside the lens overlay on the main image. */
  lensZoom: 2.75,
  /** Diameter of the magnifier lens in pixels. */
  lensSize: 130,
  /** Size of the separate zoom panel in pixels. */
  panelSize: 320,
  /** Gap between the main image and the zoom panel. */
  panelGap: 16,
} as const;
