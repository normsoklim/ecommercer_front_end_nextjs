'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ProductGalleryImage } from '@/app/types/product-gallery';
import { ZOOM_CONFIG } from '@/app/types/product-gallery';
import { deriveImageUrls, toGalleryImage } from '@/app/lib/image-urls';

/**
 * Dimensions of an image as rendered in the DOM.
 */
interface ImageSize {
  width: number;
  height: number;
}

/**
 * Position of the magnifier lens and the corresponding background position
 * for the separate zoom panel.
 */
interface ZoomState {
  lensX: number;
  lensY: number;
  panelBgX: number;
  panelBgY: number;
}

/**
 * Detects touch-capable devices so hover zoom can be disabled. On touch
 * devices the customer should see normal images (tap to view) rather than
 * a hover-only magnifier that never triggers.
 */
function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - IE/older Edge
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Hook powering the Amazon-style hover zoom with a separate zoom panel.
 *
 * Features:
 * - 2.75x magnification in a panel beside the main image
 * - Magnifier lens that follows the cursor, clamped to image boundaries
 * - Zoom calculations relative to the image container (not the window)
 * - requestAnimationFrame-throttled updates for smooth motion
 * - Preloads the high-resolution zoom image only when needed
 * - Disables hover zoom on touch devices
 * - Handles image loading failures gracefully
 */
export function useProductHoverZoom(
  images: ProductGalleryImage[],
  alt: string,
) {
  const [selectedImage, setSelectedImage] = useState<ProductGalleryImage | null>(
    images.length > 0 ? images[0] : null,
  );
  const [showZoom, setShowZoom] = useState(false);
  const [zoomImageLoaded, setZoomImageLoaded] = useState(false);
  const [zoomImageError, setZoomImageError] = useState(false);
  const [imageSize, setImageSize] = useState<ImageSize>({ width: 0, height: 0 });
  const [originalDims, setOriginalDims] = useState<ImageSize | null>(null);
  const [lensPosition, setLensPosition] = useState<ZoomState>({
    lensX: 0,
    lensY: 0,
    panelBgX: 0,
    panelBgY: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const frameRef = useRef<number>(0);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const isTouchRef = useRef(isTouchDevice());

  const config = ZOOM_CONFIG;

  // Preload the high-resolution original image when the selection changes.
  // This avoids loading every product's original-resolution images up front;
  // only the currently selected image's original is fetched.
  useEffect(() => {
    setZoomImageLoaded(false);
    setZoomImageError(false);

    if (!selectedImage?.originalUrl) return;

    const img = new Image();
    img.src = selectedImage.originalUrl;
    img.onload = () => {
      setOriginalDims({ width: img.naturalWidth, height: img.naturalHeight });
      setZoomImageLoaded(true);
      setZoomImageError(false);
    };
    img.onerror = () => {
      setZoomImageError(true);
      setZoomImageLoaded(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [selectedImage]);

  // Measure the rendered main image so all zoom math is relative to the
  // image container, not the browser window. Re-measure when the image
  // changes (e.g. a new thumbnail is selected).
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    setImageSize({ width: rect.width, height: rect.height });
  }, [selectedImage]);

  // Clean up the animation frame on unmount.
  useEffect(() => {
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  /**
   * Select a gallery image (triggered by thumbnail click / keyboard).
   * Resets zoom state and preloads the new zoom image.
   */
  const selectImage = useCallback(
    (image: ProductGalleryImage) => {
      setSelectedImage(image);
      setShowZoom(false);
      setZoomImageLoaded(false);
      setZoomImageError(false);
      setOriginalDims(null);
    },
    [],
  );

  /**
   * Handle mouse move over the main image. Computes the clamped lens
   * position and the zoom panel background position using requestAnimationFrame
   * to avoid excessive rendering.
   */
  const onImageMouseMove = useCallback(
    (event: React.MouseEvent<HTMLImageElement>) => {
      if (isTouchRef.current || !selectedImage || !imageSize.width) return;

      const rect = event.currentTarget.getBoundingClientRect();
      mousePosRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      setShowZoom(true);

      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const { x: lx, y: ly } = mousePosRef.current;
        if (!imageSize.width || !imageSize.height) return;

        // Clamp the lens so it never leaves the image boundaries.
        const halfLens = config.lensSize / 2;
        const lensX = Math.max(
          0,
          Math.min(lx - halfLens, imageSize.width - config.lensSize),
        );
        const lensY = Math.max(
          0,
          Math.min(ly - halfLens, imageSize.height - config.lensSize),
        );

        // The point under the centre of the lens, clamped to the image.
        const centerX = Math.min(
          Math.max(lensX + halfLens, halfLens),
          imageSize.width - halfLens,
        );
        const centerY = Math.min(
          Math.max(lensY + halfLens, halfLens),
          imageSize.height - halfLens,
        );

        // Map the container point to the original (high-res) image.
        const scaleX = originalDims ? originalDims.width / imageSize.width : 1;
        const scaleY = originalDims ? originalDims.height / imageSize.height : 1;
        const originalX = centerX * scaleX;
        const originalY = centerY * scaleY;

        // Position the zoom panel background so the cursor point sits at the
        // centre of the panel, magnified by zoomLevel.
        const halfPanel = config.panelSize / 2;
        const panelBgX = halfPanel - originalX * config.zoomLevel;
        const panelBgY = halfPanel - originalY * config.zoomLevel;

        setLensPosition({ lensX, lensY, panelBgX, panelBgY });
      });
    },
    [selectedImage, imageSize, originalDims, config],
  );

  const onImageMouseEnter = useCallback(() => {
    if (isTouchRef.current) return;
    setShowZoom(true);
  }, []);

  const onImageMouseLeave = useCallback(() => {
    setShowZoom(false);
  }, []);

  const onImageLoadError = useCallback(() => {
    setZoomImageError(true);
  }, []);

  return {
    // State
    selectedImage,
    showZoom,
    zoomImageLoaded,
    zoomImageError,
    imageSize,
    lensPosition,
    // Refs
    containerRef,
    imgRef,
    panelRef,
    // Config
    config,
    // Actions
    selectImage,
    onImageMouseMove,
    onImageMouseEnter,
    onImageMouseLeave,
    onImageLoadError,
    isTouchDevice: isTouchRef.current,
  };
}
