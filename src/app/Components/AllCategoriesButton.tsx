"use client"
import { useState } from "react";
import { motion } from "framer-motion";
import { Grid } from "lucide-react";
import CategoriesModal from "./CategoriesModal";

const AllCategoriesButton = () => {
    const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

    return (
        <>
            {/* Categories Modal - Ensure it's clickable when open */}
            <CategoriesModal
                isOpen={isCategoriesModalOpen}
                onClose={() => setIsCategoriesModalOpen(false)}
            />

            {/* All Categories Button */}
            <div className="mt-6 sm:mt-8 mb-8 sm:mb-12 w-full flex justify-center">
                <motion.button
                    onClick={() => setIsCategoriesModalOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#1E90FF] to-[#FF69B4]
                              text-white rounded-full text-sm sm:text-base font-medium shadow-md hover:shadow-lg transition-all mx-auto"
                >
                    <Grid size={16} className="sm:hidden" />
                    <Grid size={18} className="hidden sm:block" />
                    <span>All Categories</span>
                </motion.button>
            </div>
        </>
    );
};

export default AllCategoriesButton;
