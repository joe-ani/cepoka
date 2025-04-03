"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { useActiveLink } from "../context/ActiveLinkContext";
import { Heart, ArrowRight } from "lucide-react";
import { databases, appwriteConfig } from '@/src/lib/appwrite';
import { Query } from 'appwrite';

interface Product {
  $id: string;
  name: string;
  price: string;
  description: string;
  imageUrls: string[];
  $createdAt: string;
}

const LatestProduct: React.FC = () => {
  const { setActiveLink } = useActiveLink();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState<{ [key: string]: boolean }>({});

  const { ref: containerRef, inView: containerInView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
  
      console.log(products.map((product) => product.imageUrls));
 
  }, [products])

  // Fetch latest products from Appwrite
  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        setLoading(true);
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.productsCollectionId,
          [
            Query.orderDesc('$createdAt'), // Order by creation date, newest first
            Query.limit(4) // Get only 4 products
          ]
        );
        setProducts(response.documents.map(doc => ({
          $id: doc.$id,
          name: doc.name,
          price: doc.price,
          description: doc.description,
          imageUrls: doc.imageUrls,
          $createdAt: doc.$createdAt
        })));
      } catch (error) {
        console.error('Error fetching latest products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProducts();
  }, []);

  const toggleLike = (productId: string) => {
    setLikedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.4
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20
      },
      boxShadow: "0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)"
    },
    tap: {
      scale: 0.98,
      boxShadow: "0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15
      }
    }
  };

  if (loading) {
    return (
      <div className="latest-product-container flex flex-col items-center space-y-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-[150px] h-[200px] sm:w-[200px] sm:h-[250px] bg-gray-200 rounded-[15px] sm:rounded-[25px] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="latest-product-container flex flex-col items-center space-y-12">
      <div ref={containerRef} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            href={`/product/${product.name.toLowerCase().replace(/\s+/g, '-')}`}
            key={product.$id}
            onClick={() => {
              localStorage.setItem("selectedProduct", JSON.stringify({
                name: product.name,
                price: product.price,
                description: product.description,
                imageUrls: product.imageUrls
              }));
            }}
          >
            <motion.div
              className="latest-product-card w-[150px] h-[200px] sm:w-[200px] sm:h-[250px] flex flex-col items-center 
              relative rounded-[15px] sm:rounded-[25px] cursor-pointer transition-colors duration-200 overflow-hidden"
              initial="hidden"
              animate={containerInView ? "visible" : "hidden"}
              whileHover="hover"
              whileTap="tap"
              variants={cardVariants}
              style={{
                backfaceVisibility: "hidden",
                WebkitFontSmoothing: "subpixel-antialiased"
              }}
            >
              {/* Heart icon */}
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleLike(product.$id);
                }}
                className="absolute right-2 sm:right-4 top-2 sm:top-4 z-10 p-1 sm:p-2 cursor-pointer hover:scale-110 transition-transform"
              >
                <Heart
                  className="stroke-none"
                  fill={likedProducts[product.$id] ? "#ff3b5c" : "#ffffff50"}
                  size={24}
                  strokeWidth={1}
                />
              </div>

              {/* Product Image */}
              <div className="w-full h-full relative">
                {product.imageUrls && product.imageUrls.length > 0 ? (
                  <Image
                    className="object-cover"
                    fill
                    alt={product.name}
                    src={product.imageUrls[0]}
                    priority
                    unoptimized
                    sizes="(max-width: 640px) 150px, 200px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <p className="text-gray-400">No Image</p>
                  </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              </div>

              {/* Price Card */}
              <div className="price-card w-[90%] h-[70px] sm:h-[80px] rounded-[10px] sm:rounded-[15px] 
              absolute bottom-3 bg-gradient-to-r from-black/80 to-black/40 backdrop-blur-[2px] 
              flex flex-col justify-center gap-1 sm:gap-2">
                <div className="px-2 sm:px-3 text-white font-semibold text-xs sm:text-sm truncate">
                  {product.name}
                </div>
                <div className="w-full h-[1px] bg-[#dddd]"></div>
                <div className="flex items-center justify-between px-2 sm:px-3">
                  <p className="text-white font-medium text-xs">₦{product.price}</p>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Shop button */}
      <Link href={"/shop"} onClick={() => setActiveLink("Shop")}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="font-medium bg-gradient-to-tr from-[#1E90FF] to-[#FF69B4] text-white 
          text-base sm:text-[20px] rounded-full p-2 px-8 flex items-center gap-2"
        >
          Shop
          <ArrowRight size={20} />
        </motion.button>
      </Link>
    </div>
  );
};

export default LatestProduct;
