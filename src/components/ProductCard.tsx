"use client"
import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingScreen from "@/src/app/Components/LoadingScreen";
import SpinningLoader from "@/src/app/Components/SpinningLoader"; // Import the SpinningLoader component

// Match the Appwrite data structure
interface Product {
  $id: string;
  name: string;
  price: string;
  description: string;
  imageUrls: string[];
}

interface ProductCardProps {
  product: Product;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  },
  hover: {
    y: -5,
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.98 }
};

const likeColour = {
  on: "#ff3b5c",
  off: "#ffffff50"
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref);
  const router = useRouter();

  const handleProductClick = () => {
    try {
      // Show loading screen
      setIsLoading(true);

      // Save product data to localStorage
      const slug = product.name.toLowerCase().replace(/\s+/g, "-");
      const productData = {
        name: product.name,
        price: product.price,
        description: product.description,
        imageUrls: product.imageUrls
      };
      localStorage.setItem("selectedProduct", JSON.stringify(productData));

      // Navigate to product page after a delay to show loading screen
      // Using a longer delay on mobile for better visibility
      const isMobile = window.innerWidth < 768;
      setTimeout(() => {
        router.push(`/product/${slug}`);
      }, isMobile ? 1200 : 800);
    } catch (error) {
      console.error("Error saving product data:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Loading Screen with animation */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <SpinningLoader size="large" text={`Loading ${product.name}...`} />
          </div>
        </motion.div>
      )}

      <motion.div
        ref={ref}
        onClick={handleProductClick}
        className="latest-product-card w-[160px] h-[220px] sm:w-[220px] sm:h-[280px] flex flex-col items-center
        relative rounded-[15px] sm:rounded-[25px] cursor-pointer transition-colors duration-200 overflow-hidden"
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        whileHover="hover"
        whileTap="tap"
        variants={cardVariants}
        style={{
          backfaceVisibility: "hidden",
          WebkitFontSmoothing: "subpixel-antialiased"
        }}
      >
        {/* Product Image */}
        <div className="w-full h-full relative">
          {product.imageUrls && product.imageUrls.length > 0 ? (
            <Image
              className="object-cover"
              fill
              alt={product.name || "Product image"}
              src={product.imageUrls[0]}
              unoptimized={true}
              sizes="(max-width: 640px) 160px, 220px"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <p className="text-gray-400">No Image</p>
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </div>

        {/* Heart icon */}
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute right-2 sm:right-4 top-2 sm:top-4 z-10 p-1 sm:p-2 cursor-pointer hover:scale-110 transition-transform"
        >
          <Heart
            className="stroke-none"
            fill={isLiked ? likeColour.on : likeColour.off}
            size={24}
            strokeWidth={1}
          />
        </div>

        {/* Price Card */}
        <div className="price-card w-[90%] h-[70px] sm:h-[80px] rounded-[10px] sm:rounded-[15px]
      absolute bottom-3 bg-gradient-to-r from-black/80 to-black/40 backdrop-blur-[2px]
      flex flex-col justify-center gap-1 sm:gap-2">
          <div className="px-3 sm:px-4 text-white font-semibold text-xs sm:text-sm truncate">
            {product.name}
          </div>
          <div className="w-full h-[1px] bg-[#dddd]"></div>
          <div className="flex items-center justify-between px-3 sm:px-4">
            <p className="text-white font-medium text-xs sm:text-sm">₦{product.price}</p>
          </div>
        </div>
      </motion.div>
    </>
  );
};
