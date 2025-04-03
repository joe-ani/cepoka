"use client";
import Image from "next/image";
import reviewData from "../CustomerReviewData";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Review = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [windowWidth, setWindowWidth] = useState(0); // Initialize to 0

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            setWindowWidth(window.innerWidth);
        }
    }, []);

    useEffect(() => {
        if (!isMounted || typeof window === 'undefined') return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMounted]);

    const getInitialX = (index: number, isMobile: boolean) => {
        if (!isMobile) return index % 2 === 0 ? -30 : 30;

        // For mobile: indexes 0,2 come from right, 1,3 come from left
        return index % 2 === 0 ? 100 : -100;
    };

    return (
        <div className="review grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-32 md:justify-items-end">
            {reviewData.map((review, index) => (
                <motion.div
                    key={index}
                    className={`flex items-center relative ${index % 2 === 0 ? 'pl-8 md:pr-0' : 'pr-8 md:pr-0'}`}
                    initial={{
                        opacity: 0,
                        x: getInitialX(index, windowWidth < 768),
                        y: windowWidth >= 768 ? 50 : 0
                    }}
                    whileInView={{
                        opacity: 1,
                        x: 0,
                        y: 0
                    }}
                    transition={{
                        duration: 0.8,
                        type: "spring",
                        damping: 25,
                        stiffness: 120,
                        delay: windowWidth < 768 ? index * 0.15 : index * 0.2
                    }}
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {/* Masked Image and Text Container */}
                    <div className={`flex items-center relative bg-[#b6b6b6] md:rounded-[30px] overflow-hidden w-full md:w-[430px] h-[150px] md:h-[230px] 
            ${index % 2 === 1 ? 'flex-row-reverse md:!flex-row' : ''} 
            ${index % 2 === 0 ? 'rounded-r-none rounded-l-[20px] md:rounded-[30px]' : 'rounded-l-none rounded-r-[20px] md:rounded-[30px]'}`}>
                        {/* Image Mask */}
                        <div className={`w-[40px] h-full from-[#b6b6b6] to-transparent z-10 absolute
              ${index % 2 === 0
                                ? 'bg-gradient-to-l left-[35%] md:left-[37%]'
                                : 'bg-gradient-to-r right-[35%] md:left-[37%] md:bg-gradient-to-l'
                            }`}>
                        </div>
                        <div className="relative w-[45%] h-full">
                            <Image
                                src={review.img}
                                alt="customer pic"
                                width={200}
                                height={200}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        {/* Text Section */}
                        <div className={`flex flex-col justify-center py-4 px-5 md:p-6 w-[55%] text-white 
              ${index % 2 === 1 ? 'text-right md:!text-left' : 'text-left'}`}>
                            <p className="text-[13px] leading-tight md:text-base font-normal">{review.quote}</p>
                            <p className={`mt-3 md:mt-4 text-xs md:text-base ${index % 2 === 0 ? 'text-right' : 'text-right md:!text-right'}`}>~ {review.name}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default Review;
