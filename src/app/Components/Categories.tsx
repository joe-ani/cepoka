"use client"
import Image from "next/image";
import { motion } from "framer-motion"; // For animations
import { useInView } from "react-intersection-observer"; // For tracking element visibility
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchCategories } from '@/src/services/categoryService';
import { Category } from '@/src/services/categoryService';
import SpinningLoader from "./SpinningLoader";

// Props interface for individual category items
interface CategoryItemProps {
    imageSrc: string;    // Path to category image
    label: string;       // Category display name
    categoryId: string;  // Unique identifier for category
    index: number;      // Position in the grid for animation sequencing
    isCenter?: boolean; // Whether this is the center item (for special styling)
}

// Main Categories component - Renders a grid of category items
const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                const fetchedCategories = await fetchCategories();
                setCategories(fetchedCategories);
            } catch (error) {
                console.error('Error loading categories:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <SpinningLoader size="medium" text="Loading categories..." />
            </div>
        );
    }

    return (
        // Custom layout for 5 categories with Beauty Equipment centered
        <div className="categories p-8 sm:p-6 md:px-8">
            {categories.length === 5 ? (
                <div className="flex flex-col items-center">
                    {/* Top row - 2 categories */}
                    <div className="grid grid-cols-2 gap-16 sm:gap-20 md:gap-28 w-full">
                        {/* Left: Spa and Salon Furniture */}
                        <div className="flex justify-center">
                            <CategoryItem
                                key={categories.find(c => c.id === "spa-salon-furniture")?.id || categories[0].id}
                                imageSrc={categories.find(c => c.id === "spa-salon-furniture")?.imageSrc || categories[0].imageSrc}
                                label={categories.find(c => c.id === "spa-salon-furniture")?.name || categories[0].name}
                                categoryId={categories.find(c => c.id === "spa-salon-furniture")?.id || categories[0].id}
                                index={0}
                                isCenter={false}
                            />
                        </div>

                        {/* Right: Skincare Products */}
                        <div className="flex justify-center">
                            <CategoryItem
                                key={categories.find(c => c.id === "skincare-accessories")?.id || categories[3].id}
                                imageSrc={categories.find(c => c.id === "skincare-accessories")?.imageSrc || categories[3].imageSrc}
                                label={categories.find(c => c.id === "skincare-accessories")?.name || categories[3].name}
                                categoryId={categories.find(c => c.id === "skincare-accessories")?.id || categories[3].id}
                                index={1}
                                isCenter={false}
                            />
                        </div>
                    </div>

                    {/* Middle - Beauty Equipment */}
                    <div className="my-8 md:my-10">
                        <CategoryItem
                            key={categories.find(c => c.id === "beauty-equipment")?.id || categories[1].id}
                            imageSrc={categories.find(c => c.id === "beauty-equipment")?.imageSrc || categories[1].imageSrc}
                            label={categories.find(c => c.id === "beauty-equipment")?.name || categories[1].name}
                            categoryId={categories.find(c => c.id === "beauty-equipment")?.id || categories[1].id}
                            index={2}
                            isCenter={true}
                        />
                    </div>

                    {/* Bottom row - 2 categories */}
                    <div className="grid grid-cols-2 gap-16 sm:gap-20 md:gap-28 w-full">
                        {/* Left: Facial and Waxing */}
                        <div className="flex justify-center">
                            <CategoryItem
                                key={categories.find(c => c.id === "facial-waxing")?.id || categories[2].id}
                                imageSrc={categories.find(c => c.id === "facial-waxing")?.imageSrc || categories[2].imageSrc}
                                label={categories.find(c => c.id === "facial-waxing")?.name || categories[2].name}
                                categoryId={categories.find(c => c.id === "facial-waxing")?.id || categories[2].id}
                                index={3}
                                isCenter={false}
                            />
                        </div>

                        {/* Right: Pedicure and Manicure */}
                        <div className="flex justify-center">
                            <CategoryItem
                                key={categories.find(c => c.id === "pedicure-manicure")?.id || categories[4].id}
                                imageSrc={categories.find(c => c.id === "pedicure-manicure")?.imageSrc || categories[4].imageSrc}
                                label={categories.find(c => c.id === "pedicure-manicure")?.name || categories[4].name}
                                categoryId={categories.find(c => c.id === "pedicure-manicure")?.id || categories[4].id}
                                index={4}
                                isCenter={false}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                // Default grid layout for other numbers of categories
                <div className="grid grid-cols-2 md:grid-cols-3 gap-20 sm:gap-12 md:gap-28">
                    {categories.map((category, index) => (
                        <CategoryItem
                            key={category.id}
                            imageSrc={category.imageSrc}
                            label={category.name}
                            categoryId={category.id}
                            index={index}
                            isCenter={false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Individual category item component with animations
const CategoryItem: React.FC<CategoryItemProps> = ({ imageSrc, label, categoryId, index, isCenter = false }) => {
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

    // Special animation for center item
    const centerVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut",
                delay: 0.2,
            },
        },
    };

    // Determine which variants to use
    const activeVariants = isCenter ? centerVariants : (isMobile ? mobileVariants : desktopVariants);

    // Calculate special styles for center item
    const centerStyles = isCenter ? {
        md: {
            zIndex: 10,
        },
        container: 'z-10',
        imageContainer: 'w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] md:w-[200px] md:h-[200px] shadow-lg',
        image: 'p-7 md:p-8 transition-transform duration-300 scale-100 group-hover:scale-105',
        label: 'text-center text-sm sm:text-base md:text-lg font-medium mt-2'
    } : {
        md: {},
        container: '',
        imageContainer: '',
        image: 'p-7 transition-transform duration-300 scale-100 group-hover:scale-105',
        label: 'text-center text-sm sm:text-base-sm mt-2'
    };

    return (
        // Animated container for category item
        <motion.div
            ref={ref}
            onClick={handleCategoryClick}
            variants={activeVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            transition={{ delay: isCenter ? 0.2 : 0.1 }}
            className={`flex flex-col items-center space-y-3 sm:space-y-4 cursor-pointer group ${centerStyles.container}`}
            style={{ ...centerStyles.md }}
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
                className={`relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[150px] md:h-[150px] ${centerStyles.imageContainer}
                          bg-[radial-gradient(circle,#E1E1E1,#C3C3C3)] rounded-full overflow-visible`}
            >
                <Image
                    className={centerStyles.image}
                    src={imageSrc}
                    alt={label}
                    fill
                    style={{ objectFit: 'contain' }}
                />
            </motion.div>
            {/* Category label */}
            <div className={centerStyles.label}>
                {label}
            </div>
        </motion.div>
    );
};

export default Categories;
