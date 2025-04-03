"use client"
import Image from "next/image";
import { motion } from "framer-motion"; // For animations
import { useInView } from "react-intersection-observer"; // For tracking element visibility
import { useRouter } from "next/navigation";
import { CATEGORIES } from '@/src/data/categories';

// Props interface for individual category items
interface CategoryItemProps {
    imageSrc: string;    // Path to category image
    label: string;       // Category display name
    categoryId: string;  // Unique identifier for category
    index: number;      // Position in the grid for animation sequencing
}

// Main Categories component - Renders a grid of category items
const Categories = () => {
    return (
        // Grid layout with responsive columns (2 on mobile, 3 on desktop)
        <div className="categories grid grid-cols-2 md:grid-cols-3 gap-20 sm:gap-12 md:gap-28 p-8 sm:p-6 md:px-8">
            {/* Map through category data to create individual category items */}
            {CATEGORIES.map((category, index) => (
                <CategoryItem
                    key={category.id}
                    imageSrc={category.imageSrc}
                    label={category.name}
                    categoryId={category.id}
                    index={index}
                />
            ))}
        </div>
    );
};

// Individual category item component with animations
const CategoryItem: React.FC<CategoryItemProps> = ({ imageSrc, label, categoryId, index }) => {
    const router = useRouter();

    // Set up intersection observer to trigger animations when item becomes visible
    const { ref, inView } = useInView({
        triggerOnce: true,    // Animation plays only once
        threshold: 0.1,       // Trigger when 10% of item is visible
        rootMargin: "50px",   // Start animation slightly before item enters viewport
    });

    // Navigation handler for category clicks
    const handleCategoryClick = () => {
        router.push(`/shop?category=${categoryId}`);
    };

    // Check if viewing on mobile device
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Animation variants for mobile view - alternating left/right slide-in
    const mobileVariants = index % 2 === 0 ? {
        hidden: { opacity: 0, x: -50 },  // Even items slide in from left
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    } : {
        hidden: { opacity: 0, x: 50 },   // Odd items slide in from right
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    // Animation variants for desktop view - fade in from bottom
    const desktopVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut",
            },
        },
    };

    return (
        // Animated container for category item
        <motion.div
            ref={ref}
            onClick={handleCategoryClick}
            variants={isMobile ? mobileVariants : desktopVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center space-y-3 sm:space-y-4 cursor-pointer group"
        >
            {/* Animated image container with hover and tap effects */}
            <motion.div
                whileHover={{
                    scale: 1.1,
                    transition: {
                        type: "spring",
                        duration: 0.4,
                        bounce: 0.3
                    }
                }}
                whileTap={{ scale: 0.97 }}
                className="relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[150px] md:h-[150px] 
                          bg-[radial-gradient(circle,#E1E1E1,#C3C3C3)] rounded-full overflow-visible"
            >
                <Image
                    className="p-7 transition-transform duration-300 scale-100 group-hover:scale-105"
                    src={imageSrc}
                    alt={label}
                    fill
                    style={{ objectFit: 'contain' }}
                />
            </motion.div>
            {/* Category label */}
            <div className="text-center text-sm sm:text-base-sm mt-2">
                {label}
            </div>
        </motion.div>
    );
};

export default Categories;
