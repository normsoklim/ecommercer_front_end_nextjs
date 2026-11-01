'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { ProductImage } from '@/app/lib/api-types';

interface ProductImageZoomProps {
  images: ProductImage[];
  alt: string;
}

/**
 * Product image gallery with an inline hover magnifier (zoom in) and a
 * lightbox modal that supports zoom in / zoom out, pan (drag), and image
 * navigation.
 */
export default function ProductImageZoom({
  images,
  alt,
}: ProductImageZoomProps) {
  const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const primaryImage = sortedImages.find((img) => img.isPrimary) ?? sortedImages[0];

  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(
    primaryImage ?? null,
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Inline hover magnifier state
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [showLens, setShowLens] = useState(false);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const MAX_SCALE = 4;
  const MIN_SCALE = 1;
  const SCALE_STEP = 0.5;
  const LENS_SIZE = 140; // diameter of the magnifier lens
  const LENS_ZOOM = 3; // magnification factor inside the lens

  // Reset transform when image or scale changes
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
  }, [selectedImage, scale]);

  // Measure the rendered image so the magnifier lens can track the cursor
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    setImgSize({ w: rect.width, h: rect.height });
  }, [selectedImage]);

  const openLightbox = () => {
    if (!selectedImage) return;
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    document.body.style.overflow = '';
  }, []);

  const previousImage = () => {
    if (!selectedImage) return;
    const currentIndex = sortedImages.findIndex(
      (img) => img.id === selectedImage.id,
    );
    const prevIndex = (currentIndex - 1 + sortedImages.length) % sortedImages.length;
    setSelectedImage(sortedImages[prevIndex]);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const nextImage = () => {
    if (!selectedImage) return;
    const currentIndex = sortedImages.findIndex(
      (img) => img.id === selectedImage.id,
    );
    const nextIndex = (currentIndex + 1) % sortedImages.length;
    setSelectedImage(sortedImages[nextIndex]);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') previousImage();
      if (event.key === 'ArrowRight') nextImage();
    },
    [isLightboxOpen, closeLightbox, previousImage, nextImage],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + SCALE_STEP, MAX_SCALE));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - SCALE_STEP, MIN_SCALE));
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse drag panning (lightbox)
  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (scale <= MIN_SCALE) return;
      setIsDragging(true);
      setDragStart({
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      });
    },
    [scale, position],
  );

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart],
  );

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [isDragging, onMouseMove, onMouseUp]);

  const onWheel = useCallback(
    (event: React.WheelEvent) => {
      if (scale <= MIN_SCALE) return;
      event.preventDefault();
      const delta = -event.deltaY;
      const direction = delta > 0 ? 1 : -1;
      const newScale = Math.min(
        Math.max(scale + direction * SCALE_STEP, MIN_SCALE),
        MAX_SCALE,
      );
      if (newScale === scale) return;
      setScale(newScale);
    },
    [scale],
  );

  // Inline hover magnifier
  const onImageMouseMove = useCallback(
    (event: React.MouseEvent<HTMLImageElement>) => {
      if (!selectedImage) return;
      const rect = event.currentTarget.getBoundingClientRect();
      setLensPos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
      setShowLens(true);
    },
    [selectedImage],
  );

  const onImageMouseLeave = useCallback(() => {
    setShowLens(false);
  }, []);

  const selectImage = (image: ProductImage) => {
    setSelectedImage(image);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  if (!selectedImage) {
    return null;
  }

  // Position the magnifier lens so the cursor point sits at its center,
  // magnified by LENS_ZOOM.
  const xPercent = imgSize.w ? (lensPos.x / imgSize.w) * 100 : 0;
  const yPercent = imgSize.h ? (lensPos.y / imgSize.h) * 100 : 0;
  const lensStyle: React.CSSProperties = {
    left: lensPos.x - LENS_SIZE / 2,
    top: lensPos.y - LENS_SIZE / 2,
    width: LENS_SIZE,
    height: LENS_SIZE,
    backgroundImage: `url("${selectedImage.url}")`,
    backgroundSize: `${LENS_ZOOM * 100}% ${LENS_ZOOM * 100}%`,
    backgroundPosition: `${xPercent}% ${yPercent}%`,
    display: showLens ? 'block' : 'none',
    pointerEvents: 'none',
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main image with inline hover magnifier (zoom in) */}
      <div
        className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100"
      >
        <img
          ref={imgRef}
          src={selectedImage.url}
          alt={selectedImage.altText ?? alt}
          className="h-full w-full object-cover cursor-crosshair transition-transform duration-200 hover:scale-105"
          onClick={openLightbox}
          onMouseMove={onImageMouseMove}
          onMouseLeave={onImageMouseLeave}
          loading="lazy"
          decoding="async"
        />
        <div
          className="absolute rounded-full border-2 border-indigo-500 bg-white shadow-lg"
          style={lensStyle}
        />
        <button
          type="button"
          onClick={openLightbox}
          aria-label="Open image zoom"
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 px-2 text-slate-700 shadow-sm hover:bg-white transition-colors"
        >
          <Maximize size={16} />
        </button>
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2">
          {sortedImages.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => selectImage(image)}
              aria-label={image.altText ?? alt}
              aria-pressed={selectedImage.id === image.id}
              className={`flex h-12 w-12 items-center justify-center rounded-xl border overflow-hidden ${
                selectedImage.id === image.id
                  ? 'border-indigo-600 ring-2 ring-indigo-600'
                  : 'border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
            >
              <img
                src={image.url}
                alt={image.altText ?? alt}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox modal */}
      {isLightboxOpen && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 sm:p-6"
          onClick={closeLightbox}
          onMouseDown={onMouseDown}
          onMouseMove={(event) => onMouseMove(event.nativeEvent)}
          onMouseUp={onMouseUp}
          onWheel={onWheel}
        >
          <div
            className="relative flex items-center justify-center w-full max-w-[90vh] max-h-[90vh]"
            ref={containerRef}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close image zoom"
              className="absolute -top-12 right-0 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Zoom controls */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
              <button
                type="button"
                onClick={zoomOut}
                disabled={scale <= MIN_SCALE}
                aria-label="Zoom out"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
              >
                <ZoomOut size={18} />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                aria-label="Reset zoom"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <Minimize size={18} />
              </button>
              <button
                type="button"
                onClick={zoomIn}
                disabled={scale >= MAX_SCALE}
                aria-label="Zoom in"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
              >
                <ZoomIn size={18} />
              </button>
            </div>

            {/* Image navigation */}
            {sortedImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={previousImage}
                  aria-label="Previous image"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  aria-label="Next image"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Zoomable image */}
            <div
              className="relative inline-block"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center center',
                cursor: scale > MIN_SCALE ? 'grab' : 'default',
              }}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.altText ?? alt}
                className="max-w-full max-h-full object-contain block"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Scale indicator */}
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-2 py-1 rounded-full bg-white/10 text-xs text-white">
              {Math.round(scale * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
