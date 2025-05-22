"use client"
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useRouter } from "next/navigation";
import { CATEGORIES } from '@/src/data/categories';

// Props interface for individual category items
interface CategoryItemProps {
    imageSrc: string;    // Path to category image
    label: string;       // Category display name
    categoryId: string;  // Unique identifier for category
    index: number;      // Position in the grid for animation sequencing
    isCenter: boolean; // Whether this is the center item (for special styling)
    position: 'left' | 'right' | 'center'; // Item position for layout
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
        <div className="categories px-4 py-12 sm:px-6 md:px-8 lg:px-12">
            {/* Desktop layout */}
            <div className="hidden md:flex justify-center items-center min-h-[500px] relative">
                <div className="flex justify-center items-center w-full max-w-7xl mx-auto px-8">
                    {/* Left column */}
                    <div className="flex flex-col gap-16 mr-16"> {/* Increased gap and margin */}
                        <CategoryItem
                            key={arrangedCategories[0].id}
                            imageSrc={arrangedCategories[0].imageSrc}
                            label={arrangedCategories[0].name}
                            categoryId={arrangedCategories[0].id}
                            index={0}
                            isCenter={false}
                            position="left"
                        />
                        <CategoryItem
                            key={arrangedCategories[1].id}
                            imageSrc={arrangedCategories[1].imageSrc}
                            label={arrangedCategories[1].name}
                            categoryId={arrangedCategories[1].id}
                            index={1}
                            isCenter={false}
                            position="left"
                        />
                    </div>

                    {/* Center item */}
                    <div className="transform scale-110 z-10"> {/* Reduced scale from 125 to 110 */}
                        <CategoryItem
                            key={arrangedCategories[2].id}
                            imageSrc={arrangedCategories[2].imageSrc}
                            label={arrangedCategories[2].name}
                            categoryId={arrangedCategories[2].id}
                            index={2}
                            isCenter={true}
                            position="center"
                        />
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col gap-16 ml-16"> {/* Increased gap and margin */}
                        <CategoryItem
                            key={arrangedCategories[3].id}
                            imageSrc={arrangedCategories[3].imageSrc}
                            label={arrangedCategories[3].name}
                            categoryId={arrangedCategories[3].id}
                            index={3}
                            isCenter={false}
                            position="right"
                        />
                        <CategoryItem
                            key={arrangedCategories[4].id}
                            imageSrc={arrangedCategories[4].imageSrc}
                            label={arrangedCategories[4].name}
                            categoryId={arrangedCategories[4].id}
                            index={4}
                            isCenter={false}
                            position="right"
                        />
                    </div>
                </div>
            </div>

            {/* Mobile layout */}
            <div className="md:hidden space-y-8">
                {/* Center item first */}
                <div className="flex justify-center">
                    <CategoryItem
                        key={arrangedCategories[2].id}
                        imageSrc={arrangedCategories[2].imageSrc}
                        label={arrangedCategories[2].name}
                        categoryId={arrangedCategories[2].id}
                        index={2}
                        isCenter={true}
                        position="center"
                    />
                </div>

                {/* 2x2 grid for other items */}
                <div className="grid grid-cols-2 gap-6">
                    {[0, 1, 3, 4].map((index) => (
                        <div key={arrangedCategories[index].id} className="flex justify-center">
                            <CategoryItem
                                imageSrc={arrangedCategories[index].imageSrc}
                                label={arrangedCategories[index].name}
                                categoryId={arrangedCategories[index].id}
                                index={index}
                                isCenter={false}
                                position={index < 2 ? "left" : "right"}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Individual category item component with animations
const CategoryItem: React.FC<CategoryItemProps> = ({ imageSrc, label, categoryId, index, isCenter, position }) => {
    const router = useRouter();

    // Navigation handler for category clicks
    const handleCategoryClick = () => {
        // Route to shop page with the category parameter
        // The categoryId will be from categories.ts
        router.push(`/shop?category=${categoryId}&select=true`);
    };

    // Set up intersection observer to trigger animations when item becomes visible
    const { ref, inView } = useInView({
        triggerOnce: true,    // Animation plays only once
        threshold: 0.1,       // Trigger when 10% of item is visible
        rootMargin: "50px",   // Start animation slightly before item enters viewport
    });

    // Animations based on position
    const getAnimationVariants = () => {
        if (position === "center") {
            return {
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.6, ease: "easeOut" }
                }
            };
        }

        const xOffset = position === "left" ? -30 : 30;
        return {
            hidden: { opacity: 0, x: xOffset },
            visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.5, ease: "easeOut" }
            }
        };
    };

    const variants = getAnimationVariants();

    // Calculate sizes based on position
    const getContainerStyles = () => {
        if (isCenter) {
            return "w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] md:w-[220px] md:h-[220px]"; // Reduced size for center item
        }
        return "w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] md:w-[170px] md:h-[170px]";
    };

    return (
        // Animated container for category item
        <motion.div
            ref={ref}
            variants={variants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCategoryClick}
            className="flex flex-col items-center cursor-pointer group"
        >
            {/* Animated image container with hover and tap effects */}
            <div className={`relative ${getContainerStyles()} bg-gradient-to-b from-gray-300 to-gray-300 rounded-full overflow-visible shadow-lg hover:shadow-xl transition-all duration-300`}>
                {/* <div className="absolute inset-0 bg-gray-100 rounded-full transform -rotate-6 scale-95 opacity-50" />
                <div className="absolute inset-0 bg-gray-100 rounded-full transform rotate-3 scale-95 opacity-50" /> */}
                <div className="relative w-full h-full rounded-full overflow-hidden bg-balck">
                    <Image
                        src={imageSrc}
                        alt={label}
                        fill
                        className="object-contain p-6 transition-transform duration-300 group-hover:scale-110"
                    />
                </div>
            </div>
            {/* Category label */}
            <h3 className={`mt-4 text-center font-medium ${isCenter ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}>
                {label}
            </h3>
        </motion.div>
    );
}

export default HomeCategories;
