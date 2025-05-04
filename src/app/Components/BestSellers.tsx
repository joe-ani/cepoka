"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface BestSellerProduct {
    id: number;
    name: string;
    description: string;
    image: string;
    price: string;
}

const bestSellers: BestSellerProduct[] = [
    {
        id: 1,
        name: "Spa Chair",
        description: "This luxurious spa chair offers ultimate comfort with adjustable positioning and premium materials.",
        image: "/images/chair.png",
        price: "$599"
    },
    {
        id: 2,
        name: "Premium Straight Hair 24\"",
        description: "Our premium straight hair bundle offers silky smooth texture and long-lasting durability.",
        image: "/images/chair2.png",
        price: "$399"
    },
    {
        id: 3,
        name: "Deluxe Massage Table",
        description: "Professional-grade massage table with memory foam padding and adjustable height settings.",
        image: "/hero-graphis/facemask.png",
        price: "$799"
    }
];

const BestSellers = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-advance carousel every second
    useEffect(() => {
        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Only set interval if not paused
        if (!isPaused) {
            intervalRef.current = setInterval(() => {
                paginate(1); // Move to next slide
            }, 3000); // Change every 3 seconds for better user experience
        }

        // Cleanup on component unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [currentIndex, isPaused]);

    // Enhanced animation variants with smoother transitions
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95,
            filter: 'blur(4px)',
            position: 'absolute' as const
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            position: 'relative' as const
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95,
            filter: 'blur(4px)',
            position: 'absolute' as const
        })
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        setCurrentIndex((prevIndex) => (prevIndex + newDirection + bestSellers.length) % bestSellers.length);
    };

    // Pause auto-rotation when user interacts with carousel
    const pauseAutoRotation = () => {
        setIsPaused(true);

        // Resume auto-rotation after 5 seconds of inactivity
        setTimeout(() => {
            setIsPaused(false);
        }, 5000);
    };

    // Background animation variant
    const backgroundVariants = {
        hidden: {
            opacity: 0,
            x: isMobile ? 0 : 100,
            y: isMobile ? 100 : 0
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.25, 0.4, 0.3, 1.1]
            }
        }
    };

    return (
        <div className="relative w-full overflow-hidden">
            {/* Gradient overlay background */}
            <motion.div
                variants={backgroundVariants}
                initial="hidden"
                animate="visible"
                className="absolute h-[120%] inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent via-[#EDEDED]/30 to-[#EDEDED] -z-10"
            />

            <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-12 md:py-20">
                <div className="relative">
                    {/* Navigation Buttons */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between z-10 px-4">
                        <motion.button
                            onClick={() => {
                                pauseAutoRotation();
                                paginate(-1);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </motion.button>
                        <motion.button
                            onClick={() => {
                                pauseAutoRotation();
                                paginate(1);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </motion.button>
                    </div>

                    {/* Carousel Content */}
                    <div className="relative min-h-[400px] md:min-h-[500px]">
                        <AnimatePresence
                            initial={false}
                            custom={direction}
                            mode="wait"
                        >
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.5 },
                                    scale: { duration: 0.5 },
                                    filter: { duration: 0.5 },
                                    position: { duration: 0 }
                                }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={1}
                                onDragStart={() => pauseAutoRotation()}
                                onDragEnd={(_, { offset, velocity }) => {
                                    const swipe = swipePower(offset.x, velocity.x);
                                    if (swipe < -swipeConfidenceThreshold) {
                                        paginate(1);
                                    } else if (swipe > swipeConfidenceThreshold) {
                                        paginate(-1);
                                    }
                                }}
                                className="flex flex-col md:flex-row md:space-x-12 lg:space-x-24 space-y-8 md:space-y-0 items-center justify-center w-full"
                                style={{
                                    willChange: "transform, opacity"
                                }}
                            >
                                {/* Image container with animation */}
                                <div className="flex-shrink-0 flex items-center justify-center rounded-[16px] md:rounded-[20px]
                                      relative before:absolute before:inset-0 before:p-[1.5px]
                                      before:rounded-[16px] md:before:rounded-[20px] before:bg-gradient-to-tr
                                      before:from-[#FF69B4] before:via-[#87CEFA] before:to-[#FF69B4]
                                      after:absolute after:inset-[1.5px] after:rounded-[15px] md:after:rounded-[18px]
                                      after:bg-gradient-to-br after:from-white after:to-[#fafafa]
                                      w-[220px] sm:w-[260px] md:w-[300px] aspect-square
                                      p-2 sm:p-4 md:p-8"
                                >
                                    <div className="relative w-full h-full z-10">
                                        <Image
                                            src={bestSellers[currentIndex].image}
                                            alt={bestSellers[currentIndex].name}
                                            fill
                                            className="object-contain p-3"
                                            sizes="(max-width: 640px) 220px, (max-width: 768px) 260px, 300px"
                                            priority
                                        />
                                    </div>
                                </div>

                                {/* Content section */}
                                <div className="flex flex-col justify-center space-y-4 w-full md:w-auto px-10 md:px-2 gap-4">
                                    <div className="flex items-start flex-col space-y-2.5">
                                        <motion.div
                                            className="text-2xl sm:text-2xl md:text-3xl font-semibold tracking-tight"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {bestSellers[currentIndex].name}
                                        </motion.div>
                                        <motion.div
                                            className="w-28 sm:w-30 md:w-[150px] h-[1px] bg-gradient-to-r from-[#9d9d9d] to-transparent"
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ duration: 0.3, delay: 0.1 }}
                                        />
                                        <motion.div
                                            className="w-full max-w-[280px] sm:w-80 md:w-70 text-sm sm:text-sm md:text-base text-gray-600/90 leading-relaxed"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.2 }}
                                        >
                                            {bestSellers[currentIndex].description}
                                        </motion.div>
                                        <motion.div
                                            className="text-xl font-semibold text-[#FF69B4]"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: 0.3 }}
                                        >
                                            {bestSellers[currentIndex].price}
                                        </motion.div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.95 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.4 }}
                                        className="font-medium bg-gradient-to-tr from-[#FF69B4] to-[#1E90FF] text-[#fff]
                                             text-sm tracking-wide rounded-full py-2.5 px-5
                                             flex items-center w-44 sm:w-40 md:w-44 gap-2"
                                    >
                                        Discover More
                                        <ArrowRight size={16} strokeWidth={2.5} className="text-white" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Dots indicator with progress */}
                    <div className="flex flex-col items-center gap-2 mt-6">
                        <div className="flex justify-center gap-2">
                            {bestSellers.map((_, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => {
                                        pauseAutoRotation();
                                        setDirection(index > currentIndex ? 1 : -1);
                                        setCurrentIndex(index);
                                    }}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-[#FF69B4] w-4' : 'bg-gray-300'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Progress indicator */}
                        {!isPaused && (
                            <motion.div
                                className="w-16 h-0.5 bg-gray-200 mt-2 overflow-hidden"
                                initial={{ opacity: 0.6 }}
                                animate={{ opacity: 1 }}
                            >
                                <motion.div
                                    className="h-full bg-[#FF69B4]"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{
                                        duration: 3,
                                        ease: "linear",
                                        repeat: Infinity,
                                        repeatType: "loop"
                                    }}
                                />
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BestSellers;
