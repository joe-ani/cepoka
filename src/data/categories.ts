export interface Category {
  id: string;
  name: string;
  icon: string;
  imageSrc: string;
}

export const CATEGORIES: Category[] = [
  { id: "Spa Equipment", name: "Spa Equipment", icon: "🌟", imageSrc: "/icons/spa-bed.png" },
  { id: "Salon Chairs", name: "Salon Chairs", icon: "🌊", imageSrc: "/icons/barber-chair.png" },
  { id: "Massage & Wellness", name: "Massage & Wellness", icon: "💫", imageSrc: "/icons/hot-stone.png" },
  { id: "Nail Care", name: "Nail Care", icon: "✨", imageSrc: "/icons/nails.png" },
  { id: "Hair Tools", name: "Hair Tools", icon: "👑", imageSrc: "/icons/hairdryer.png" },
  { id: "Body Sliming", name: "Body Sliming", icon: "💁‍♀️", imageSrc: "/icons/slim.png" }
];
