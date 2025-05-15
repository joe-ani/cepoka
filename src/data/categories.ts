export interface Category {
  id: string;
  name: string;
  icon: string;
  imageSrc: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "spa-salon-furniture",
    name: "Spa and salon furnitures",
    icon: "🪑",
    imageSrc: "/icons/spa-bed.png",
  },
  {
    id: "beauty-equipment",
    name: "Beauty equipment",
    icon: "⚙️",
    imageSrc: "/icons/hairdryer.png",
  },
  {
    id: "facial-waxing",
    name: "Facials and waxing",
    icon: "🧖‍♀️",
    imageSrc: "/icons/hot-stone.png",
  },
  {
    id: "skincare-accessories",
    name: "Skincare products & accessories",
    icon: "🧴",
    imageSrc: "/icons/slim.png",
  },
  {
    id: "pedicure-manicure",
    name: "Pedicure and manicure",
    icon: "💅",
    imageSrc: "/icons/nails.png",
  },
];
