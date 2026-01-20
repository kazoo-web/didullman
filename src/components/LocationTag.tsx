import { MapPin } from "lucide-react";

interface LocationTagProps {
  location: string;
}

export const LocationTag = ({ location }: LocationTagProps) => {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/90 backdrop-blur-sm rounded-full border border-border shadow-sm">
      <MapPin className="w-4 h-4 text-location" />
      <span className="text-sm font-sans font-medium text-foreground">{location}</span>
    </div>
  );
};
