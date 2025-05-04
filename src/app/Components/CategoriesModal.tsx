"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Grid } from 'lucide-react';
import { fetchCategories, Category } from '@/src/services/categoryService';
import SpinningLoader from './SpinningLoader';

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoriesModal: React.FC<CategoriesModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen]);

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/shop?category=${categoryId}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300
            }}
            className="relative w-[95%] sm:w-[90%] md:w-[85%] max-w-2xl
                      bg-white rounded-2xl shadow-2xl z-[10000] overflow-hidden max-h-[90vh] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3 sm:p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-[#f8f9fa] to-[#f1f3f5]">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Grid size={16} className="text-[#1E90FF] sm:hidden" />
                  <Grid size={18} className="text-[#1E90FF] hidden sm:block md:hidden" />
                  <Grid size={20} className="text-[#1E90FF] hidden md:block" />
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-[#1E90FF] to-[#FF69B4] bg-clip-text text-transparent">
                  All Categories
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/80 transition-colors"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            </div>

            {/* Categories Grid */}
            <div className="p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[40vh] sm:max-h-[50vh]">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <SpinningLoader size="small" text="Loading categories..." />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                  {categories.map((category) => (
                    <motion.div
                      key={category.id}
                      whileHover={{ scale: 1.03, y: -5 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleCategoryClick(category.id)}
                      className="flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl
                                bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md
                                cursor-pointer transition-all border border-gray-100 hover:border-[#1E90FF]/30"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 relative mb-2 sm:mb-3
                                    bg-white rounded-full p-2 sm:p-3 shadow-sm">
                        <Image
                          src={category.imageSrc}
                          alt={category.name}
                          fill
                          className="object-contain p-1 sm:p-2"
                        />
                      </div>
                      <span className="text-xs sm:text-sm md:text-base font-medium text-center">
                        {category.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 md:p-6 border-t border-gray-100 flex justify-between items-center bg-gradient-to-r from-[#f8f9fa] to-[#f1f3f5]">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-gray-200 text-gray-600
                          rounded-full text-xs sm:text-sm font-medium hover:bg-white hover:shadow-sm transition-all"
              >
                Close
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/shop')}
                className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#1E90FF] to-[#FF69B4] text-white
                          rounded-full text-xs sm:text-sm font-medium hover:shadow-md transition-all"
              >
                <span className="hidden sm:inline">View All Products</span>
                <span className="sm:hidden">View All</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CategoriesModal;
