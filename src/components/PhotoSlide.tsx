import { Photo } from "@/types/photo";
import { LocationTag } from "./LocationTag";
import { DateTag } from "./DateTag";
import { Commentary } from "./Commentary";

interface PhotoSlideProps {
  photo: Photo;
  isActive: boolean;
  /** When true, shows full uncropped photo above metadata with blurred background */
  useFullPhoto?: boolean;
}

export const PhotoSlide = ({ photo, isActive, useFullPhoto = false }: PhotoSlideProps) => {
  if (useFullPhoto) {
    // New layout: Full uncropped photo above metadata with a true blurred-photo background
    return (
      <div 
        className={`
          absolute inset-0 transition-opacity duration-1000 ease-in-out
          ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}
        `}
      >
        {/* Blurred Background Photo (no heavy processing) */}
        <div className="absolute inset-0">
          <img
            src={photo.src}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover transform-gpu scale-110 blur-3xl"
          />
          {/* Soft wash + vignette for legibility */}
          <div className="absolute inset-0 bg-background/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
        </div>

        {/* Photo Container - positioned above metadata */}
        <div className="absolute inset-x-0 top-0 bottom-[220px] md:bottom-[200px] flex justify-center items-center p-4">
          <img 
            src={photo.src} 
            alt={photo.location}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Content Overlay - fixed at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-[220px] md:h-[200px] flex flex-col justify-center items-center p-4 md:p-6 pointer-events-none">
          {/* Subtle gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent" />
          
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
