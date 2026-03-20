import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCarouselProps {
  images: string[];
  onImagesChange?: (images: string[]) => void;
  autoRotateInterval?: number; // in milliseconds, default 3000
  editable?: boolean;
  onRemoveImage?: (index: number) => void;
}

export default function ImageCarousel({
  images,
  onImagesChange,
  autoRotateInterval = 3000,
  editable = false,
  onRemoveImage,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  useEffect(() => {
    if (!isAutoRotating || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [isAutoRotating, images.length, autoRotateInterval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoRotating(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoRotating(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoRotating(false);
  };

  const handleRemoveImage = (index: number) => {
    if (onRemoveImage) {
      onRemoveImage(index);
    } else if (onImagesChange) {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
      if (currentIndex >= newImages.length && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full bg-secondary/50 rounded-lg flex items-center justify-center h-96 text-muted-foreground">
        No images available
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main Image Display */}
      <div className="relative bg-black rounded-lg overflow-hidden group">
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="w-full h-96 object-cover"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Remove Button (if editable) */}
        {editable && (
          <button
            onClick={() => handleRemoveImage(currentIndex)}
            className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors z-10"
            aria-label="Remove image"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === index
                  ? "border-primary ring-2 ring-primary/50"
                  : "border-border hover:border-primary/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Auto-rotate Toggle (if editable) */}
      {editable && images.length > 1 && (
        <div className="mt-4 flex items-center gap-2">
          <Button
            size="sm"
            variant={isAutoRotating ? "default" : "outline"}
            onClick={() => setIsAutoRotating(!isAutoRotating)}
          >
            {isAutoRotating ? "Auto-rotating (ON)" : "Auto-rotate (OFF)"}
          </Button>
          <span className="text-xs text-muted-foreground">
            Rotates every {autoRotateInterval / 1000} seconds
          </span>
        </div>
      )}
    </div>
  );
}
