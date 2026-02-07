import { useState } from "react";
import { PhotoSlideMockup } from "../components/PhotoSlideMockup";
import { samplePhotos } from "../data/samplePhotos";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@shared/ui/button";

const MockupPreview = () => {
  // Use photos 37-40 for the mockup (the problematic ones)
  const previewPhotos = samplePhotos.slice(36, 40);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [variant, setVariant] = useState<"center" | "top" | "bottom">("center");

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? previewPhotos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === previewPhotos.length - 1 ? 0 : prev + 1));
  };

  return (
    <main className="min-h-screen bg-background relative">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
        <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
          Mockup Preview - Photo {37 + currentIndex}
        </div>
        
        {/* Variant Selector */}
        <div className="flex gap-2">
          <Button 
            variant={variant === "top" ? "default" : "outline"}
            size="sm"
            onClick={() => setVariant("top")}
            className="text-xs"
          >
            Top
          </Button>
          <Button 
            variant={variant === "center" ? "default" : "outline"}
            size="sm"
            onClick={() => setVariant("center")}
            className="text-xs"
          >
            Center
          </Button>
          <Button 
            variant={variant === "bottom" ? "default" : "outline"}
            size="sm"
            onClick={() => setVariant("bottom")}
            className="text-xs"
          >
            Bottom
          </Button>
        </div>
      </div>

      {/* Gallery */}
      <div className="relative w-full h-screen overflow-hidden">
        {previewPhotos.map((photo, index) => (
          <PhotoSlideMockup 
            key={photo.id} 
            photo={photo} 
            isActive={index === currentIndex}
            variant={variant}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="absolute bottom-4 left-4 right-4 z-50 flex justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevious}
          className="rounded-full bg-black/30 backdrop-blur-sm border-white/20 hover:bg-black/50"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={goToNext}
          className="rounded-full bg-black/30 backdrop-blur-sm border-white/20 hover:bg-black/50"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </Button>
      </div>
    </main>
  );
};

export default MockupPreview;
