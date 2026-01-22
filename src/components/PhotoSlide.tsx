import { Photo } from "@/types/photo";
import { LocationTag } from "./LocationTag";
import { DateTag } from "./DateTag";
import { Commentary } from "./Commentary";
import { useState, useEffect } from "react";

interface PhotoSlideProps {
  photo: Photo;
  isActive: boolean;
  /** When true, shows full uncropped photo above metadata with blurred background */
  useFullPhoto?: boolean;
}

export const PhotoSlide = ({ photo, isActive, useFullPhoto = false }: PhotoSlideProps) => {
  const [dominantColor, setDominantColor] = useState("hsl(var(--background))");

  // Extract dominant color from image for the new layout
  useEffect(() => {
    if (!useFullPhoto || !photo.src) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = photo.src;
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      // Sample from edges for background color
      canvas.width = 10;
      canvas.height = 10;
      ctx.drawImage(img, 0, 0, 10, 10);
      
      const imageData = ctx.getImageData(0, 0, 10, 10).data;
      let r = 0, g = 0, b = 0, count = 0;
      
      for (let i = 0; i < imageData.length; i += 4) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count++;
      }
      
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      
      setDominantColor(`rgb(${r}, ${g}, ${b})`);
    };
  }, [photo.src, useFullPhoto]);

  if (useFullPhoto) {
    // New layout: Full uncropped photo above metadata with blurred background
    return (
      <div 
        className={`
          absolute inset-0 transition-opacity duration-1000 ease-in-out
          ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}
        `}
      >
        {/* Blurred Background Color */}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: dominantColor }}
        >
          <div 
            className="absolute inset-0 backdrop-blur-3xl"
            style={{
              background: `linear-gradient(180deg, ${dominantColor}99 0%, ${dominantColor} 100%)`
            }}
          />
        </div>

        {/* Photo Container - positioned above metadata */}
        <div className="absolute inset-x-0 top-0 bottom-[180px] md:bottom-[160px] flex justify-center items-center p-4">
          <img 
            src={photo.src} 
            alt={photo.location}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Content Overlay - fixed at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-[180px] md:h-[160px] flex flex-col justify-center items-center p-4 md:p-6 pointer-events-none">
          {/* Subtle gradient for text legibility */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${dominantColor} 0%, ${dominantColor}cc 50%, transparent 100%)`
            }}
          />
          
          <div className={`relative space-y-3 flex flex-col items-center pointer-events-auto ${isActive ? 'animate-slide-up' : ''}`}>
            {/* Location and Date Tags */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <LocationTag location={photo.location} />
              {photo.date && <DateTag date={photo.date} />}
            </div>

            {/* Commentary */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
              {photo.katherineComment && (
                <Commentary author="katherine" comment={photo.katherineComment} />
              )}
              {photo.djComment && (
                <Commentary author="dj" comment={photo.djComment} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original layout: object-cover with gradient overlay
  return (
    <div 
      className={`
        absolute inset-0 transition-opacity duration-1000 ease-in-out
        ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}
      `}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={photo.src} 
          alt={photo.location}
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end items-center p-6 md:p-12 lg:p-16 pointer-events-none">
        <div className={`space-y-4 flex flex-col items-center pointer-events-auto ${isActive ? 'animate-slide-up' : ''}`}>
          {/* Location and Date Tags */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LocationTag location={photo.location} />
            {photo.date && <DateTag date={photo.date} />}
          </div>

          {/* Commentary */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center">
            {photo.katherineComment && (
              <Commentary author="katherine" comment={photo.katherineComment} />
            )}
            {photo.djComment && (
              <Commentary author="dj" comment={photo.djComment} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
