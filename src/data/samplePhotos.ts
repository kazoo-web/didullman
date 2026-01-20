import photoShoot from "@/assets/photos/photo-shoot.jpg";
import sunsetBeach from "@/assets/photos/sunset-beach.jpg";
import mosquitos from "@/assets/photos/mosquitos.jpg";
import mountainHike from "@/assets/photos/mountain-hike.jpg";
import mistyLake from "@/assets/photos/misty-lake.jpg";
import lobsterPool from "@/assets/photos/lobster-pool.jpg";
import holiFestival from "@/assets/photos/holi-festival.jpg";
import { Photo } from "@/types/photo";

export const samplePhotos: Photo[] = [
  {
    id: "1",
    src: photoShoot,
    location: "Golden Gate Park, San Francisco",
    date: "October 2024",
    katherineComment: "Behind the scenes of our engagement shoot!",
    djComment: "She insisted on being my personal lighting assistant.",
  },
  {
    id: "2",
    src: sunsetBeach,
    location: "Malibu, California",
    date: "January 2025",
    katherineComment: "The golden hour was absolutely perfect.",
    djComment: "Best sunset we've ever caught together.",
  },
  {
    id: "3",
    src: mosquitos,
    location: "Culebra, Puerto Rico",
    date: "February 2025",
    katherineComment: "The sign was ironic - we got eaten alive!",
    djComment: "Golf cart island life was pretty great though.",
  },
  {
    id: "4",
    src: mountainHike,
    location: "Adirondacks, New York",
    date: "April 2025",
    katherineComment: "Cold but so worth it for this view!",
    djComment: "She only complained for the first 2 miles.",
  },
  {
    id: "5",
    src: mistyLake,
    location: "Lake Winnipesaukee, New Hampshire",
    date: "April 2025",
    katherineComment: "The fog rolling in was magical.",
    djComment: "Peaceful mornings like this are everything.",
  },
  {
    id: "6",
    src: lobsterPool,
    location: "Rockport, Massachusetts",
    date: "May 2025",
    katherineComment: "I make a very convincing lobster!",
    djComment: "Best clam shack on the North Shore.",
  },
  {
    id: "7",
    src: holiFestival,
    location: "Somerville, Massachusetts",
    date: "May 2025",
    katherineComment: "Holi was an explosion of joy!",
    djComment: "That blue took three showers to wash off.",
  },
];
