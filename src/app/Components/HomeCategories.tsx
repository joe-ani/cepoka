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
    isCenter?: boolean; // Whether this is the center item (for special styling)
}

// Main Categories component - Renders a custom layout with 5 categories
const HomeCategories = () => {
    // Only use the first 5 categories if there are more
    const displayCategories = CATEGORIES.slice(0, 5);

    // Rearrange categories to have Beauty Equipment in the center
    // Find Beauty Equipment category
    const beautyEquipmentIndex = displayCategories.findIndex(cat => cat.id === "beauty-equipment");

    // If Beauty Equipment is found, move it to the center (index 2)
    const arrangedCategories = [...displayCategories];
    if (beautyEquipmentIndex !== -1 && beautyEquipmentIndex !== 2) {
        // Remove Beauty Equipment from its current position
        const beautyEquipment = arrangedCategories.splice(beautyEquipmentIndex, 1)[0];
        // Insert it at position 2 (center)
        arrangedCategories.splice(2, 0, beautyEquipment);
    }

    return (
        <div className="categories p-8 sm:p-6 md:px-8">
            {/* Desktop layout (5 in a row) */}
            <div className="hidden md:flex justify-center">
                <div className="grid grid-cols-5 gap-8 sm:gap-12 md:gap-16 max-w-6xl">
                    {/* First category (left side) */}
                    <div className="col-span-1 flex justify-center">
                        <CategoryItem
                            key={arrangedCategories[0].id}
                            imageSrc={arrangedCategories[0].imageSrc}
                            label={arrangedCategories[0].name}
                            categoryId={arrangedCategories[0].id}
                            index={0}
                            isCenter={false}
                        />
                    </div>

                    {/* Second category (left side) */}
                    <div className="col-span-1 flex justify-center">
                        <CategoryItem
                            key={arrangedCategories[1].id}
                            imageSrc={arrangedCategories[1].imageSrc}
                            label={arrangedCategories[1].name}
                            categoryId={arrangedCategories[1].id}
                            index={1}
                            isCenter={false}
                        />
                    </div>

                    {/* Center category (Beauty Equipment) */}
                    <div className="col-span-1 flex justify-center">
                        <CategoryItem
                            key={arrangedCategories[2].id}
                            imageSrc={arrangedCategories[2].imageSrc}
                            label={arrangedCategories[2].name}
                            categoryId={arrangedCategories[2].id}
                            index={2}
                            isCenter={true}
                        />
                    </div>

                    {/* Fourth category (right side) */}
                    <div className="col-span-1 flex justify-center">
                        <CategoryItem
                            key={arrangedCategories[3].id}
                            imageSrc={arrangedCategories[3].imageSrc}
                            label={arrangedCategories[3].name}
                            categoryId={arrangedCategories[3].id}
                            index={3}
                            isCenter={false}
                        />
                    </div>

                    {/* Fifth category (right side) */}
                    <div className="col-span-1 flex justify-center">
                        <CategoryItem
                            key={arrangedCategories[4].id}
                            imageSrc={arrangedCategories[4].imageSrc}
                            label={arrangedCategories[4].name}
                            categoryId={arrangedCategories[4].id}
                            index={4}
                            isCenter={false}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile layout (center item first, then 2x2 grid) */}
            <div className="md:hidden flex flex-col items-center">
                {/* Center category first on mobile */}
                <div className="mb-8">
                    <CategoryItem
                        key={arrangedCategories[2].id}
                        imageSrc={arrangedCategories[2].imageSrc}
                        label={arrangedCategories[2].name}
                        categoryId={arrangedCategories[2].id}
                        index={2}
                        isCenter={true}
                    />
                </div>

                {/* Top row - first 2 categories */}
                <div className="grid grid-cols-2 gap-12 w-full mb-8">
                    <div className="flex justify-center">
                        <CategoryItem
                            key={arrangedCategories[0].id}
                            imageSrc={arrangedCategories[0].imageSrc}
                            label={arrangedCategories[0].name}
                            categoryId={arrangedCategories[0].id}
                            index={0}
                            isCenter={false}
                        />
                    </div>
                    <div className="flex justify-center">
                        <CategoryItem
                            key={arrangedCategories[1].id}
                            imageSrc={arrangedCategories[1].imageSrc}
                            label={arrangedCategories[1].name}
                            categoryId={arrangedCategories[1].id}
                            index={1}
                            isCenter={false}
                        />
                    </div>
                </div>

                {/* Bottom row - last 2 categories */}
                <div className="grid grid-cols-2 gap-12 w-full">
                    <div className="flex justify-center">
                        <CategoryItem
                            key={arrangedCategories[3].id}
                            imageSrc={arrangedCategories[3].imageSrc}
                            label={arrangedCategories[3].name}
                            categoryId={arrangedCategories[3].id}
                            index={3}
                            isCenter={false}
                        />
                    </div>
                    <div className="flex justify-center">
                        <CategoryItem
                            key={arrangedCategories[4].id}
                            imageSrc={arrangedCategories[4].imageSrc}
                            label={arrangedCategories[4].name}
                            categoryId={arrangedCategories[4].id}
                            index={4}
                            isCenter={false}
                        />
                    </div>
                </div>
            </div>
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
        container: 'z-10',
        imageContainer: 'w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] md:w-[200px] md:h-[200px] shadow-lg',
        image: 'p-7 md:p-8 transition-transform duration-300 scale-100 group-hover:scale-105',
        label: 'text-center text-sm sm:text-base md:text-lg font-medium mt-2'
    } : {
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
            style={{ zIndex: isCenter ? 10 : 'auto' }}
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
                className={`relative ${isCenter ? centerStyles.imageContainer : 'w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[150px] md:h-[150px]'}
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

export default HomeCategories;
