"use client";
import React, { useState, useEffect } from "react";
import SpinningLoader from "./SpinningLoader";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { useActiveLink } from "../context/ActiveLinkContext";
import { Heart, ArrowRight } from "lucide-react";
import { databases, appwriteConfig } from '@/src/lib/appwrite';
import { Query } from 'appwrite';
import LoadingScreen from "./LoadingScreen";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loadingShop, setLoadingShop] = useState(false);
  const [likedProducts, setLikedProducts] = useState<{ [key: string]: boolean }>({});

  const { ref: containerRef, inView: containerInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px" // Trigger animation before element is fully in view
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

  // Container animation variants
  const containerVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 20,
        staggerChildren: 0.1, // Stagger the animation of children
        delayChildren: 0.2,   // Delay before starting children animations
        when: "beforeChildren"
      }
    }
  };

  // Card animation variants
  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
      rotateX: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.5,
        delay: 0.1
      }
    },
    hover: {
      y: -12,
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20
      },
      boxShadow: "0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)"
    },
    tap: {
      scale: 0.98,
      y: -5,
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
        <SpinningLoader size="large" text="Loading products..." />
      </div>
    );
  }

  const handleShopClick = () => {
    setLoadingShop(true);
    setActiveLink("Shop");
    // Small delay to show loading state
    setTimeout(() => {
      router.push('/shop');
    }, 500);
  };

  return (
    <div className="latest-product-container flex flex-col items-center space-y-8 relative">
      {/* Loading screen for shop navigation */}
      {loadingShop && (
        <LoadingScreen message="Loading Shop..." isFullScreen={true} />
      )}

      {/* Loading overlay for product clicks */}
      {loadingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
            <SpinningLoader size="large" text="Loading product..." />
          </div>
        </div>
      )}

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full flex justify-center items-center py-16"
        >
          <div className="relative">
            <SpinningLoader size="large" text="Loading latest products..." />
          </div>
        </motion.div>
      ) : (
        <motion.div
          ref={containerRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full px-4 md:px-8 mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={containerInView ? "visible" : "hidden"}
        >
          {products.map((product) => (
            <Link
              href={`/product/${product.name.toLowerCase().replace(/\s+/g, '-')}`}
              key={product.$id}
              onClick={() => {
                // Show loading screen
                setLoadingProduct(true);
                // Prevent scrolling
                document.body.style.overflow = 'hidden';

                localStorage.setItem("selectedProduct", JSON.stringify({
                  name: product.name,
                  price: product.price,
                  description: product.description,
                  imageUrls: product.imageUrls
                }));
              }}
            >
              <motion.div
                className="latest-product-card w-[160px] sm:w-[220px] h-[220px] sm:h-[280px] flex flex-col items-center mx-auto
                relative rounded-[15px] sm:rounded-[25px] cursor-pointer transition-colors duration-200 overflow-hidden"
                variants={cardVariants}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
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
            </Link>
          ))}
        </motion.div>
      )}

      {/* Shop button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={containerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-4 md:mt-8"
      >
        <motion.button
          onClick={handleShopClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="font-medium bg-gradient-to-tr from-[#1E90FF] to-[#FF69B4] text-white
              text-base sm:text-[20px] rounded-full p-2 px-8 flex items-center gap-2 shadow-lg"
        >
          Shop
          <ArrowRight size={20} />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LatestProduct;
