import { Photo } from "@/types/photo";
import { LocationTag } from "./LocationTag";
import { DateTag } from "./DateTag";
import { Commentary } from "./Commentary";

interface PhotoSlideProps {
  photo: Photo;
  isActive: boolean;
}

export const PhotoSlide = ({ photo, isActive }: PhotoSlideProps) => {
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
      <div className="absolute inset-0 flex flex-col justify-end items-center p-6 md:p-12 lg:p-16">
        <div className={`space-y-4 flex flex-col items-center ${isActive ? 'animate-slide-up' : ''}`}>
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
