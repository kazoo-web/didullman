import { PhotoGallery } from "@/components/PhotoGallery";
import { samplePhotos } from "@/data/samplePhotos";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <PhotoGallery photos={samplePhotos} autoPlayInterval={6000} />
    </main>
  );
};

export default Index;
