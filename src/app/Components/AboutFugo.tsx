"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const AboutFugo = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Images for the carousel
    const carouselImages = [
        "/images/mrmonday.png",
        "/images/sho1.jpg",
        "/images/sho2.jpg",
        "/images/sho3.jpg"
    ];

    // Set up image carousel rotation
    useEffect(() => {
        const imageInterval = setInterval(() => {
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % carouselImages.length);
        }, 4000);

        return () => clearInterval(imageInterval);
    }, [carouselImages.length]);

    // IDEA: For better visibility of the showroom and shop images and videos make the image fill on its on and the text should stand apart with its own Bg blending in with the img/vid displaying.

    return (
        <div className="p-0 sm:p-10 w-full h-auto sm:h-[650px] flex justify-center items-center">
            <motion.div
                className="relative w-full sm:w-[80%] h-[500px] sm:h-[80%] overflow-hidden sm:rounded-[30px]"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
            >
                {/* Image Carousel */}
                <div className="relative w-full h-full overflow-hidden">
                    {carouselImages.map((image, index) => (
                        <motion.div
                            key={image}
                            className="absolute inset-0"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: index === currentImageIndex ? 1 : 0,
                                scale: index === currentImageIndex ? [1, 1.05] : 1,
                                y: index === currentImageIndex ? ['0%', '-5%'] : '0%'
                            }}
                            transition={{
                                opacity: { duration: 1 },
                                scale: { duration: 8, ease: "easeInOut" },
                                y: { duration: 8, ease: "easeInOut" }
                            }}
                        >
                            <Image
                                className="w-full h-full object-cover"
                                fill
                                sizes="100vw"
                                src={image}
                                alt={`Cepoka image ${index + 1}`}
                                priority={index === 0}
                            />
                        </motion.div>
                    ))}

                    {/* Dim fade overlay for transition */}
                    <motion.div
                        className="absolute inset-0 bg-black z-10"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0, 0.3, 0]
                        }}
                        transition={{
                            duration: 4,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatDelay: 4
                        }}
                    />

                    {/* Navigation dots */}
                    <div className="absolute bottom-4 right-4 flex space-x-2 z-30">
                        {carouselImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentImageIndex
                                    ? 'bg-white scale-110'
                                    : 'bg-white/50 hover:bg-white/70'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
                <div className="absolute w-full h-full bg-gradient-to-b from-black top-0 z-20"></div>
                <motion.div
                    className="flex flex-col z-30 absolute top-0 text-white p-8 sm:p-16 space-y-6 sm:space-y-5"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                >
                    <h1 className="text-2xl sm:text-4xl font-medium tracking-wide">Ugochickwu.</h1>
                    <div className="relative">
                        <div
                            className={`relative overflow-hidden transition-all duration-500 ease-in-out
                                ${!isExpanded ? 'max-h-[85px]' : 'max-h-[500px]'} sm:max-h-none`}
                        >
                            <p className="text-sm sm:text-base font-normal leading-[1.8] sm:leading-[2] max-w-[95%] sm:max-w-full">
                                Founded in 2005 by Ali Ugochicku (aka Fugo), D&apos;Fugo Hair has established itself as a premier
                                destination for luxury wigs in Nigeria and beyond.
                                With over two decades of expertise, we&apos;ve built our reputation on providing premium quality
                                wigs and exceptional service to our clients worldwide.

                                From our base in Nigeria, we&apos;ve grown into an international brand, bringing sophisticated,
                                high-end hair solutions to discerning customers across the globe. Our commitment to excellence
                                and attention to detail has made us a trusted name in the luxury wig industry.
                            </p>
                        </div>
                        {!isExpanded && (
                            <div className="absolute bottom-0 w-full h-16 sm:hidden pointer-events-none" />
                        )}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="sm:hidden mt-2 text-sm font-medium text-white/80 hover:text-white flex items-center gap-1"
                        >
                            {isExpanded ? 'Show Less' : 'Read More...'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
            {/* Changed the background div to be hidden on mobile and visible only on sm breakpoint and up */}
            <div className="hidden sm:block w-full bg-gradient-to-r from-transparent via-[#ededed] to-transparent z-[-10] absolute h-[85%]"></div>
        </div>
    );
};


export default AboutFugo;