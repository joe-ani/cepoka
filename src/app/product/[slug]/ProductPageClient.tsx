"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BackArrow from "../../Components/BackArrow";
import SpinningLoader from "../../Components/SpinningLoader";
import LoadingScreen from "../../Components/LoadingScreen";
// Skeleton is no longer used since we're using SpinningLoader
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { sendWhatsAppMessage } from '@/src/utils/client/whatsapp';
import { useClient } from '@/src/hooks/useClient';

interface ProductType {
    name: string;
    price: string;
    description: string;
    imageUrls: string[];
    category?: string; // Make category optional but include it
}

interface Props {
    params: { slug: string };
}

export default function ProductPageClient({ params }: Props) {
    console.log('Product slug:', params.slug);
    const isClient = useClient();
    const router = useRouter();
    const [product, setProduct] = useState<ProductType | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLocateLoading, setIsLocateLoading] = useState(false);

    useEffect(() => {
        try {
            const savedProduct = localStorage.getItem('selectedProduct');
            if (savedProduct) {
                const parsedProduct = JSON.parse(savedProduct);
                // Ensure imageUrls is always an array
                if (!parsedProduct.imageUrls) {
                    console.error('No images found in product data');
                    router.push('/shop');
                    return;
                }
                setProduct(parsedProduct);
            } else {
                console.error('No product data found');
                router.push('/shop');
            }
        } catch (error) {
            console.error('Error loading product:', error);
            router.push('/shop');
        }
    }, [router]); // Remove params?.slug from dependencies

    const handleOrder = () => {
        if (!isClient || !product) return;

        toast.loading('Opening WhatsApp...', {
            duration: 1500,
        });

        const success = sendWhatsAppMessage(product.name, product.imageUrls[currentImageIndex]);

        if (success) {
            toast.success('Redirecting to WhatsApp...', {
                duration: 2000,
                position: 'bottom-center',
            });
        } else {
            toast.error('Failed to open WhatsApp. Please try again.', {
                duration: 3000,
                position: 'bottom-center',
            });
        }
    };

    // Image carousel controls
    const nextImage = () => {
        if (!product?.imageUrls?.length) return;
        setCurrentImageIndex((prev) => (prev + 1) % product.imageUrls.length);
    };

    const prevImage = () => {
        if (!product?.imageUrls?.length) return;
        setCurrentImageIndex((prev) =>
            prev === 0 ? product.imageUrls.length - 1 : prev - 1
        );
    };    // Add error boundary
    if (!product?.imageUrls?.length) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen flex items-center justify-center bg-white"
            >
                <div className="bg-gray-50 p-8 rounded-xl shadow-lg">
                    <SpinningLoader size="large" text="Loading product details..." />
                    <p className="text-gray-500 text-sm mt-4 text-center">Please wait while we fetch the product information</p>
                </div>
            </motion.div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white text-[#333333] p-4 pt-32 sm:pt-44">
                <SpinningLoader size="large" text="Loading product details..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white text-[#333333] p-4 pt-20 sm:pt-28">
            {/* Loading Screen for Locate Us button */}
            {isLocateLoading && (
                <LoadingScreen
                    message="Loading location page..."
                />
            )}

            <div className="w-full max-w-6xl">
                {/* Header - Only Back Button */}
                <div className="flex items-center mb-6 mt-4 sm:mt-0">
                    <BackArrow className="text-gray-700" />
                </div>

                <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mt-6">
                    {/* Main Image and Thumbnail Section - using flex for desktop */}
                    <div className="relative w-full md:flex md:gap-4">
                        {/* Main Image Container */}
                        <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-[20px] sm:rounded-[30px]
                        flex items-center justify-center bg-gradient-to-t border-2 border-[#A4A4A4] from-[#A4A4A4] to-white
                        overflow-hidden md:flex-1">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentImageIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={product.imageUrls[currentImageIndex]}
                                        alt={`${product.name} ${currentImageIndex + 1}`}
                                        fill
                                        className="object-cover w-full h-full"
                                        loader={({ src }) => src}
                                        unoptimized={true}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Carousel Controls */}
                            {product.imageUrls.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full rotate-180"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                    </button>
                                </>
                            )}

                            {/* Image Counter - only show on mobile */}
                            {product.imageUrls.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm md:hidden">
                                    {currentImageIndex + 1} / {product.imageUrls.length}
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Gallery - vertical for desktop, horizontal for mobile */}
                        {product.imageUrls.length > 1 && (
                            <div className="mt-4 md:mt-0 md:w-20 flex md:flex-col gap-2 px-2 pb-2 md:p-0
                             md:max-h-[500px] justify-center md:justify-start">
                                {product.imageUrls.map((url, index) => (
                                    <motion.div
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`relative cursor-pointer rounded-lg overflow-hidden flex-shrink-0
                                            ${currentImageIndex === index
                                                ? 'ring-2 ring-[#1E90FF] ring-offset-2'
                                                : 'opacity-70 hover:opacity-100'
                                            }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <div className="w-16 h-16 sm:w-20 sm:h-20">
                                            <Image
                                                src={url}
                                                alt={`${product.name} thumbnail ${index + 1}`}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 64px, 80px"
                                                unoptimized
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details Section */}
                    <div className="flex flex-col justify-center px-2 sm:px-4">
                        <h2 className="text-2xl sm:text-3xl font-bold">{product.name}</h2>
                        <p className="text-lg sm:text-xl text-gray-600 mt-2">{product.description}</p>

                        <div className="flex gap-4 mt-4 sm:mt-6">
                            <div className="px-4 sm:px-6 py-2 sm:py-3 bg-[#333333] text-white rounded-full
                                flex items-center gap-2 text-base sm:text-lg">
                                ₦{product.price}
                            </div>
                        </div>

                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-400 to-transparent my-6" />

                        <div className="flex flex-col gap-3 sm:gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-[#333333] text-white py-3 px-6 rounded-md hover:opacity-90
                                transition-opacity text-base sm:text-lg"
                                onClick={handleOrder}
                            >
                                Order Now
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-[#333333] text-white py-3 px-6 rounded-md hover:opacity-90
                                transition-opacity text-base sm:text-lg"
                                onClick={() => {
                                    setIsLocateLoading(true);
                                    toast.loading('Loading location page...', {
                                        duration: 1500,
                                    });
                                    setTimeout(() => {
                                        router.push('/contact');
                                    }, 800);
                                }}
                            >
                                Locate Us
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
