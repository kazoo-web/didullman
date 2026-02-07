import { MapPin } from "lucide-react";

interface LocationTagProps {
  location: string;
}

const createGoogleMapsUrl = (location: string) => {
  const encoded = encodeURIComponent(location);
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
};

export const LocationTag = ({ location }: LocationTagProps) => {
  return (
    <a 
      href={createGoogleMapsUrl(location)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 bg-card/90 backdrop-blur-sm rounded-full border border-border shadow-lg hover:bg-card hover:shadow-xl transition-all"
    >
      <MapPin className="w-4 h-4 text-location" />
      <span className="text-sm font-medium text-foreground">{location}</span>
    </a>
  );
};
