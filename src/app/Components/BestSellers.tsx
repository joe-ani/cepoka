"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const BestSellers = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');

    // Main container background animation
    const mainBgVariants = {
        hidden: {
            x: '100%',
            opacity: 0,
        },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                duration: 1,
                ease: [0.25, 0.4, 0.3, 1.1],
                // This ensures the main background animates first
                delay: 0.2
            }
        }
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

    // Container animation variant
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    // Image animation variant
    const imageVariants = {
        hidden: { 
            opacity: 0,
            x: isMobile ? 0 : -100,
            y: isMobile ? 50 : 0,
            scale: 0.8
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: [0.25, 0.4, 0.3, 1.1]
            }
        }
    };

    // Text animation variants
    const textVariants = {
        hidden: { 
            opacity: 0,
            x: isMobile ? 0 : 50,
            y: isMobile ? 30 : 0
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

    // Text line animation
    const lineVariants = {
        hidden: { 
            width: "0%",
            opacity: 0
        },
        visible: {
            width: "100%",
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: [0.25, 0.4, 0.3, 1.1],
                delay: 0.2
            }
        }
    };

    return (
        <div className="relative w-full overflow-hidden">
            {/* Main sliding background */}
            <motion.div
                variants={mainBgVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="absolute inset-0 bg-white -z-20"
            />

            <motion.div
                className="relative w-full overflow-hidden"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
            >
                {/* Gradient overlay background */}
                <motion.div 
                    variants={backgroundVariants}
                    className="absolute h-[120%] inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent via-[#EDEDED]/30 to-[#EDEDED] -z-10" 
                />

                <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-12 md:py-20">
                    <div className="flex flex-col md:flex-row md:space-x-12 lg:space-x-24 space-y-8 md:space-y-0 items-center justify-center">
                        {/* Image container with animation */}
                        <motion.div
                            variants={imageVariants}
                            className="flex items-center justify-center rounded-[16px] md:rounded-[20px]
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
                                    src="/images/chair.png"
                                    alt="Best Seller"
                                    fill
                                    className="object-contain p-3"
                                    sizes="(max-width: 640px) 220px, (max-width: 768px) 260px, 300px"
                                />
                            </div>
                        </motion.div>

                        {/* Content section with text animations */}
                        <motion.div
                            variants={textVariants}
                            className="flex flex-col justify-center space-y-4 w-full md:w-auto px-10 md:px-2 gap-4"
                        >
                            <div className="flex items-start flex-col space-y-2.5">
                                <motion.div 
                                    variants={textVariants}
                                    className="text-2xl sm:text-2xl md:text-3xl font-semibold tracking-tight"
                                >
                                    Spa Chair
                                </motion.div>
                                <motion.div 
                                    variants={lineVariants}
                                    className="w-28 sm:w-30 md:w-[150px] h-[1px] bg-gradient-to-r from-[#9d9d9d] to-transparent" 
                                />
                                <motion.div 
                                    variants={textVariants}
                                    className="w-full max-w-[280px] sm:w-80 md:w-70 text-sm sm:text-sm md:text-base text-gray-600/90 leading-relaxed"
                                >
                                    This is a description text for the Spa Chair. It highlights the key features and benefits of this luxurious and comfortable seating option.
                                </motion.div>
                            </div>

                            <motion.button
                                variants={textVariants}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                className="font-medium bg-gradient-to-tr from-[#FF69B4] to-[#1E90FF] text-[#fff] 
                                         text-sm tracking-wide rounded-full py-2.5 px-5 
                                         flex items-center w-44 sm:w-40 md:w-44 gap-2"
                            >
                                Discover More
                                <ArrowRight size={16} strokeWidth={2.5} className="text-white" />
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default BestSellers;
