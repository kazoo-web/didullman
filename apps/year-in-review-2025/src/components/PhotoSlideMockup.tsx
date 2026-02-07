import { Photo } from "../types/photo";
import { LocationTag } from "./LocationTag";
import { DateTag } from "./DateTag";
import { Commentary } from "./Commentary";
import { useState, useEffect, useRef } from "react";

interface PhotoSlideMockupProps {
  photo: Photo;
  isActive: boolean;
  variant?: "center" | "top" | "bottom"; // Different positioning options
}

export const PhotoSlideMockup = ({ photo, isActive, variant = "center" }: PhotoSlideMockupProps) => {
  const [dominantColor, setDominantColor] = useState("hsl(var(--background))");
  const imgRef = useRef<HTMLImageElement>(null);

  // Extract dominant color from image
  useEffect(() => {
    if (!photo.src) return;
    
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
  }, [photo.src]);

  const getPhotoPosition = () => {
    switch (variant) {
      case "top":
        return "items-start pt-4";
      case "bottom":
        return "items-end";
      case "center":
      default:
        return "items-center";
    }
  };

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
        style={{ 
          backgroundColor: dominantColor,
        }}
      >
        {/* Additional blur overlay for depth */}
        <div 
          className="absolute inset-0 backdrop-blur-3xl"
          style={{
            background: `linear-gradient(180deg, ${dominantColor}99 0%, ${dominantColor} 100%)`
          }}
        />
      </div>

      {/* Photo Container - positioned above metadata */}
      <div className={`absolute inset-x-0 top-0 bottom-[180px] md:bottom-[160px] flex justify-center ${getPhotoPosition()} p-4`}>
        <img 
          ref={imgRef}
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
};
