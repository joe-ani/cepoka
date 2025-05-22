"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import SpinningLoader from '@/src/app/Components/SpinningLoader';
import LoadingScreen from '@/src/app/Components/LoadingScreen';
import BackArrow from '@/src/app/Components/BackArrow';
import { fetchCategories, deleteCategory, addCategory } from '@/src/services/categoryService';

// Define the exact 5 categories we want to keep
const DESIRED_CATEGORIES = [
  {
    id: "spa-salon-furniture",
    name: "Spa and Salon Furnitures",
    icon: "🪑",
    imageSrc: "/icons/spa-bed.png",
  },
  {
    id: "beauty-equipment",
    name: "Beauty Equipment",
    icon: "⚙️",
    imageSrc: "/icons/hairdryer.png",
  },
  {
    id: "facial-waxing",
    name: "Facials and Waxing",
    icon: "🧖‍♀️",
    imageSrc: "/icons/hot-stone.png",
  },
  {
    id: "skincare-accessories",
    name: "Skincare Products & Accessories",
    icon: "🧴",
    imageSrc: "/icons/slim.png",
  },
  {
    id: "pedicure-manicure",
    name: "Pedicure and Manicure",
    icon: "💅",
    imageSrc: "/icons/nails.png",
  },
];

const CategoryResetPage = () => {
  const router = useRouter();
  interface Category {
    id: string;
    name: string;
    icon: string;
    imageSrc: string;
  }

  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentCategories, setCurrentCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [progress, setProgress] = useState({ step: '', details: '' });

  // Fetch current categories on load
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const categories = await fetchCategories();
        setCurrentCategories(categories);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Failed to load current categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Function to reset categories
  const resetCategories = async () => {
    try {
      setIsLoading(true);

      // Step 1: Delete all existing categories
      setProgress({ step: 'Deleting existing categories', details: '0/' + currentCategories.length });

      for (let i = 0; i < currentCategories.length; i++) {
        const category = currentCategories[i];
        setProgress({
          step: 'Deleting existing categories',
          details: `${i + 1}/${currentCategories.length}: ${category.name}`
        });

        await deleteCategory(category.id);
      }

      // Step 2: Create the 5 desired categories
      setProgress({ step: 'Creating new categories', details: '0/5' });

      for (let i = 0; i < DESIRED_CATEGORIES.length; i++) {
        const category = DESIRED_CATEGORIES[i];
        setProgress({
          step: 'Creating new categories',
          details: `${i + 1}/5: ${category.name}`
        });

        await addCategory({
          name: category.name,
          icon: category.icon
        });
      }

      // Success message
      toast.success('Categories have been reset successfully');

      // Navigate back to admin page after a short delay
      setTimeout(() => {
        setIsNavigating(true);
        router.push('/admin');
      }, 2000);

    } catch (error) {
      console.error('Error resetting categories:', error);
      toast.error('Failed to reset categories');
    } finally {
      setIsLoading(false);
    }
  };

  if (isNavigating) {
    return <LoadingScreen message="Redirecting to Admin..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 sm:pt-40 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-gray-700 hover:text-black transition-all duration-200">
            <BackArrow href="/admin" />
            <span className="ml-2">Back to Admin</span>
          </Link>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Reset Categories</h1>
          <p className="text-gray-700 mb-6">
            This will delete all existing categories in Appwrite and create only the 5 specified categories.
            This ensures that your shop and admin pages use the same consistent categories.
          </p>

          {loadingCategories ? (
            <div className="flex justify-center py-8">
              <SpinningLoader size="medium" text="Loading current categories..." />
            </div>
          ) : (
            <>
              <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold mb-3">Current Categories ({currentCategories.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentCategories.map((category) => (
                    <div key={category.id} className="flex items-center p-2 bg-white rounded border border-gray-100">
                      <span className="text-xl mr-2">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  ))}
                  {currentCategories.length === 0 && (
                    <p className="text-gray-500 col-span-2 py-2">No categories found</p>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3">New Categories (5)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DESIRED_CATEGORIES.map((category) => (
                    <div key={category.id} className="flex items-center p-2 bg-gray-50 rounded border border-gray-200">
                      <span className="text-xl mr-2">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex flex-col items-center">
                    <SpinningLoader size="large" />
                    <p className="mt-4 text-gray-800 font-medium">
                      {progress.step}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {progress.details}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetCategories}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-all"
                  >
                    Reset Categories
                  </motion.button>
                  <Link href="/admin">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </motion.button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryResetPage;
