import { Photo } from "@/types/photo";
import carterNotchHut from "@/assets/photos/carter-notch-hut.jpg";
import holiFestival from "@/assets/photos/holi-festival-16x9.jpg";
import img7953 from "@/assets/photos/img-7953-16x9.jpg";
import img8425 from "@/assets/photos/img-8425-16x9.jpg";
import img8473 from "@/assets/photos/img-8473-16x9.jpg";
import lobsterPool from "@/assets/photos/lobster-pool-16x9.jpg";
import mistyLake from "@/assets/photos/misty-lake-16x9.jpg";
import mosquitos from "@/assets/photos/mosquitos-16x9.jpg";
import mountainHike from "@/assets/photos/mountain-hike-16x9.jpg";
import photoShoot from "@/assets/photos/photo-shoot-16x9.jpg";
import sunsetBeach from "@/assets/photos/sunset-beach-16x9.jpg";
import beachSunset from "@/assets/photos/beach-sunset-16x9.jpg";
import formalEvent from "@/assets/photos/formal-event-16x9.jpg";
import summerGarden from "@/assets/photos/summer-garden-16x9.jpg";
import eveningPortrait from "@/assets/photos/evening-portrait-16x9.jpg";
import outdoorActivity from "@/assets/photos/outdoor-activity-16x9.jpg";
import daytimeAdventure from "@/assets/photos/daytime-adventure-16x9.jpg";
import eveningScene from "@/assets/photos/evening-scene-16x9.jpg";
import julyMoment from "@/assets/photos/july-moment-16x9.jpg";
import summerNight from "@/assets/photos/summer-night-16x9.jpg";
import fourthJuly from "@/assets/photos/fourth-july-16x9.jpg";

export const samplePhotos: Photo[] = [
  {
    id: "1",
    src: carterNotchHut,
    location: "Carter Notch Hut, New Hampshire",
    date: "August 2025",
    katherineComment: "Made it to the hut!",
    djComment: "The crew at Carter Notch.",
  },
  {
    id: "2",
    src: holiFestival,
    location: "Somerville, Massachusetts",
    date: "May 2025",
    katherineComment: "Holi was an explosion of joy!",
    djComment: "That blue took three showers to wash off.",
  },
  {
    id: "3",
    src: img7953,
    location: "Cherry Blossoms, DC",
    date: "April 2025",
    katherineComment: "Peak bloom perfection!",
    djComment: "Worth the crowds.",
  },
  {
    id: "4",
    src: img8425,
    location: "Shenandoah, Virginia",
    date: "May 2025",
    katherineComment: "Family hike day!",
    djComment: "That view was incredible.",
  },
  {
    id: "5",
    src: img8473,
    location: "Historic Inn, Vermont",
    date: "June 2025",
    katherineComment: "Matching tie-dye vibes!",
    djComment: "The cutest doorway in New England.",
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
    src: mistyLake,
    location: "Lake Winnipesaukee, New Hampshire",
    date: "April 2025",
    katherineComment: "The fog rolling in was magical.",
    djComment: "Peaceful mornings like this are everything.",
  },
  {
    id: "8",
    src: mosquitos,
    location: "Culebra, Puerto Rico",
    date: "February 2025",
    katherineComment: "The sign was ironic - we got eaten alive!",
    djComment: "Golf cart island life was pretty great though.",
  },
  {
    id: "9",
    src: mountainHike,
    location: "Adirondacks, New York",
    date: "November 2024",
    katherineComment: "Cold but so worth it for this view!",
    djComment: "She only complained for the first 2 miles.",
  },
  {
    id: "10",
    src: photoShoot,
    location: "Golden Gate Park, San Francisco",
    date: "October 2024",
    katherineComment: "Behind the scenes of our engagement shoot!",
    djComment: "She insisted on being my personal lighting assistant.",
  },
  {
    id: "11",
    src: sunsetBeach,
    location: "Malibu, California",
    date: "January 2025",
    katherineComment: "The golden hour was absolutely perfect.",
    djComment: "Best sunset we've ever caught together.",
  },
  {
    id: "12",
    src: beachSunset,
    location: "Add Location",
    date: "May 2025",
    katherineComment: "Add Katherine's comment",
    djComment: "Add DJ's comment",
  },
  {
    id: "13",
    src: formalEvent,
    location: "Add Location",
    date: "June 2025",
    katherineComment: "Add Katherine's comment",
    djComment: "Add DJ's comment",
  },
  {
    id: "14",
    src: summerGarden,
    location: "Add Location",
    date: "June 2025",
    katherineComment: "Add Katherine's comment",
    djComment: "Add DJ's comment",
  },
  {
    id: "15",
    src: eveningPortrait,
    location: "Add Location",
    date: "June 2025",
    katherineComment: "Add Katherine's comment",
    djComment: "Add DJ's comment",
  },
  {
    id: "16",
    src: outdoorActivity,
    location: "Add Location",
    date: "June 2025",
    katherineComment: "Add Katherine's comment",
    djComment: "Add DJ's comment",
  },
  {
    id: "17",
    src: daytimeAdventure,
    location: "Add Location",
    date: "June 2025",
    katherineComment: "Add Katherine's comment",
    djComment: "Add DJ's comment",
  },
  {
    id: "18",
    src: eveningScene,
    location: "Add Location",
    date: "June 2025",
    katherineComment: "Add Katherine's comment",
    djComment: "Add DJ's comment",
  },
  {
    id: "19",
    src: julyMoment,
    location: "Add Location",
    date: "July 2025",
    katherineComment: "Add Katherine's comment",
    djComment: "Add DJ's comment",
  },
  {
    id: "20",
    src: summerNight,
    location: "Add Location",
    date: "July 2025",
    katherineComment: "Add Katherine's comment",
    djComment: "Add DJ's comment",
  },
  {
    id: "21",
    src: fourthJuly,
    location: "Add Location",
    date: "July 2025",
    katherineComment: "Add Katherine's comment",
    djComment: "Add DJ's comment",
  },
  ...Array.from({ length: 24 }, (_, i) => ({
    id: String(i + 22),
    src: "",
    location: `Photo ${i + 22} - Add Location`,
    date: "Add Date",
    katherineComment: "Add Katherine's comment",
    djComment: "Add DJ's comment",
  })),
];
