import photo1 from "@/assets/photo-1.jpg";
import photo2 from "@/assets/photo-2.jpg";
import photo3 from "@/assets/photo-3.jpg";
import photo4 from "@/assets/photo-4.jpg";
import { Photo } from "@/types/photo";

export const samplePhotos: Photo[] = [
  {
    id: "1",
    src: photo1,
    location: "Santorini, Greece",
    date: "Summer 2024",
    katherineComment: "This sunset made me cry happy tears. Best anniversary trip ever.",
    djComment: "I still can't believe we actually made it here. Worth every penny.",
  },
  {
    id: "2",
    src: photo2,
    location: "Prague, Czech Republic",
    date: "Fall 2023",
    katherineComment: "We got so lost trying to find this spot. Best accident ever!",
    djComment: "That coffee was the best I've ever had. We need to go back.",
  },
  {
    id: "3",
    src: photo3,
    location: "Swiss Alps, Switzerland",
    date: "Summer 2023",
    katherineComment: "The hike nearly broke me but this view healed my soul.",
    djComment: "She complained the whole way up but look at that smile at the top!",
  },
  {
    id: "4",
    src: photo4,
    location: "Kyoto, Japan",
    date: "Spring 2024",
    katherineComment: "The cherry blossoms were magical. I cried again, obviously.",
    djComment: "We spent three hours just watching the koi. Pure peace.",
  },
];
