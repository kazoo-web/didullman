import { useState, useEffect } from "react";
import { Photo } from "@/types/photo";
import { PhotoSlide } from "./PhotoSlide";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

interface PhotoGalleryProps {
  photos: Photo[];
  autoPlayInterval?: number;
}

export const PhotoGallery = ({ photos, autoPlayInterval = 6000 }: PhotoGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, photos.length, autoPlayInterval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="relative w-full h-screen-safe overflow-hidden bg-background">
      {/* Photos */}
      {photos.map((photo, index) => (
        <PhotoSlide 
          key={photo.id} 
          photo={photo} 
          isActive={index === currentIndex}
          useFullPhoto={true}
        />
      ))}

      {/* Navigation Controls */}
      <div className="absolute top-6 right-6 z-40 flex items-center gap-3">
        <button
          onClick={togglePlayPause}
          className="p-3 bg-card/80 backdrop-blur-sm rounded-full border border-border hover:bg-card transition-colors shadow-lg"
          aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-foreground" />
          ) : (
            <Play className="w-5 h-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Arrow Controls */}
      <div className="absolute inset-y-0 left-0 flex items-center z-20">
        <button
          onClick={goToPrevious}
          className="p-3 ml-4 bg-card/80 backdrop-blur-sm rounded-full border border-border hover:bg-card transition-colors shadow-lg"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center z-20">
        <button
          onClick={goToNext}
          className="p-3 mr-4 bg-card/80 backdrop-blur-sm rounded-full border border-border hover:bg-card transition-colors shadow-lg"
          aria-label="Next photo"
        >
          <ChevronRight className="w-6 h-6 text-foreground" />
        </button>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${index === currentIndex 
                ? 'w-8 bg-accent' 
                : 'bg-card/60 hover:bg-card/80'
              }
            `}
            aria-label={`Go to photo ${index + 1}`}
          />
        ))}
      </div>

      {/* Photo Counter */}
      <div className="absolute top-6 left-6 z-20">
        <div className="px-4 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-border shadow-lg">
          <span className="text-lg text-foreground">
            <span className="text-gold font-semibold">{currentIndex + 1}</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="text-muted-foreground">{photos.length}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
