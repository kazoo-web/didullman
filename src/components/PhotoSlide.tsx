import { Photo } from "@/types/photo";
import { LocationTag } from "./LocationTag";
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
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:p-16">
        <div className={`space-y-6 ${isActive ? 'animate-slide-up' : ''}`}>
          {/* Location */}
          <LocationTag location={photo.location} />

          {/* Date if available */}
          {photo.date && (
            <p className="font-sans text-sm text-muted-foreground tracking-wide">
              {photo.date}
            </p>
          )}

          {/* Commentary */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
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
