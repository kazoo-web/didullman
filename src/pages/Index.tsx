import { PhotoGallery } from "@/components/PhotoGallery";
import { samplePhotos } from "@/data/samplePhotos";

const Index = () => {
  return (
    <main className="h-screen-safe bg-background overflow-hidden">
      <PhotoGallery photos={samplePhotos} autoPlayInterval={6000} />
    </main>
  );
};

export default Index;
