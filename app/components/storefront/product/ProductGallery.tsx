'use client';

import { useCallback, useMemo } from 'react';
import type { ProductGalleryImage } from '@/app/types/product-gallery';
import { useProductHoverZoom } from '@/app/hooks/useProductHoverZoom';
import { toGalleryImage } from '@/app/lib/image-urls';
import { ProductImage } from './ProductImage';
import { ProductZoomLens } from './ProductZoomLens';
import { ProductZoomPanel } from './ProductZoomPanel';
import { ProductThumbnails } from './ProductThumbnails';

interface ProductGalleryProps {
  /** Images as returned by the backend (single `url` per image). */
  images: ProductGalleryImage[];
  /** Fallback alt text. */
  alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  // Normalise backend images into gallery images with explicit thumbnail /
  // medium / original URLs. Keeps the gallery working whether the API returns
  // the three URLs or just a single `url`.
  const galleryImages = useMemo(
    () => images.map((img) => toGalleryImage(img, alt)),
    [images, alt],
  );

  const {
    selectedImage,
    showZoom,
    zoomImageLoaded,
    zoomImageError,
    imageSize,
    lensPosition,
    selectImage,
    onImageMouseMove,
    onImageMouseEnter,
    onImageMouseLeave,
    onImageLoadError,
    imgRef,
    isTouchDevice,
  } = useProductHoverZoom(galleryImages, alt);

  const hasMultiple = galleryImages.length > 1;

  const handleSelect = useCallback(
    (image: ProductGalleryImage) => {
      selectImage(image);
    },
    [selectImage],
  );

  if (!selectedImage) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image + magnifier lens + separate zoom panel. */}
      <div className="flex items-start gap-4">
        <div className="relative">
          <ProductImage
            image={selectedImage}
            alt={alt}
            onMouseMove={onImageMouseMove}
            onMouseEnter={onImageMouseEnter}
            onMouseLeave={onImageMouseLeave}
            onLoadError={onImageLoadError}
            imgRef={imgRef}
            imageSize={imageSize}
          />
          <ProductZoomLens
            image={selectedImage}
            show={showZoom && !isTouchDevice}
            position={{ x: lensPosition.lensX, y: lensPosition.lensY }}
            imageSize={imageSize}
          />
        </div>

        <ProductZoomPanel
          image={selectedImage}
          show={showZoom && !isTouchDevice && zoomImageLoaded}
          bgPosition={{ x: lensPosition.panelBgX, y: lensPosition.panelBgY }}
          error={zoomImageError}
          loading={!zoomImageLoaded && !zoomImageError}
        />
      </div>

      {/* Thumbnail strip: updates both the main image and the zoom panel. */}
      {hasMultiple && (
        <ProductThumbnails
          images={galleryImages}
          selectedImage={selectedImage}
          alt={alt}
          onSelect={handleSelect}
        />
      )}

      {!isTouchDevice && showZoom && !zoomImageLoaded && !zoomImageError && (
        <p className="text-xs text-slate-400">
          Preparing high-resolution zoom…
        </p>
      )}
    </div>
  );
}
