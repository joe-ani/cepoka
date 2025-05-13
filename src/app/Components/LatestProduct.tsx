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
  const [loadingProduct, setLoadingProduct] = useState(false);
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

  return (
    <div className="latest-product-container flex flex-col items-center space-y-8 relative">
      {/* Loading overlay for product clicks */}
      {loadingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
            <SpinningLoader size="large" text="Loading product..." />
          </div>
        </div>
      )}

      <motion.div
        ref={containerRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full px-4 md:px-0"
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
              className="product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
              variants={cardVariants}
              whileHover={{ y: -5 }}
              whileTap={{ y: 0 }}
            >
              {/* Product Image Container */}
              <div className="relative w-full h-40 md:h-48">
                {product.imageUrls && product.imageUrls.length > 0 ? (
                  <Image
                    className="object-cover"
                    fill
                    alt={product.name}
                    src={product.imageUrls[0]}
                    priority
                    sizes="(max-width: 640px) 150px, 200px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <p className="text-gray-400">No Image</p>
                  </div>
                )}

                {/* Heart icon */}
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleLike(product.$id);
                  }}
                  className="absolute right-2 top-2 z-10 p-1 bg-white/30 backdrop-blur-sm rounded-full cursor-pointer hover:bg-white/50 transition-all"
                >
                  <Heart
                    className="stroke-none"
                    fill={likedProducts[product.$id] ? "#ff3b5c" : "#ffffff"}
                    size={20}
                    strokeWidth={1}
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 md:p-4">
                <h3 className="font-semibold text-sm md:text-base text-gray-800 truncate">
                  {product.name}
                </h3>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  ₦{product.price}
                </p>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Shop button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={containerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-4 md:mt-8"
      >
        <Link href={"/shop"} onClick={() => setActiveLink("Shop")}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="font-medium bg-gradient-to-tr from-[#1E90FF] to-[#FF69B4] text-white
                text-base sm:text-[20px] rounded-full p-2 px-8 flex items-center gap-2 shadow-lg"
          >
            Shop
            <ArrowRight size={20} />
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default LatestProduct;
