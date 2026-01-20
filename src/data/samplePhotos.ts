import { Photo } from "@/types/photo";
import carterNotchHut from "@/assets/photos/carter-notch-hut.jpg";

export const samplePhotos: Photo[] = [
  {
    id: "1",
    src: carterNotchHut,
    location: "Carter Notch Hut, New Hampshire",
    date: "August 2025",
    katherineComment: "Made it to the hut!",
    djComment: "The crew at Carter Notch.",
  },
  ...Array.from({ length: 44 }, (_, i) => ({
    id: String(i + 2),
    src: "",
    location: `Photo ${i + 2} - Add Location`,
    date: "Add Date",
    katherineComment: "Add Katherine's comment",
    djComment: "Add DJ's comment",
  })),
];
