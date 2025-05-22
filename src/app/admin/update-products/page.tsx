"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import SpinningLoader from '@/src/app/Components/SpinningLoader';
import { updateExistingProducts } from '@/src/utils/updateExistingProducts';

const UpdateProductsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ updatedCount?: number; errorCount?: number } | null>(null);

  const handleUpdateProducts = async () => {
    try {
      setIsLoading(true);
      const result = await updateExistingProducts();
      
      if (result.success) {
        toast.success(`Updated ${result.updatedCount} products successfully!`);
        setResult(result);
      } else {
        toast.error('Failed to update products');
      }
    } catch (error) {
      console.error('Error updating products:', error);
      toast.error('An error occurred while updating products');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 sm:pt-40 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-gray-700 hover:text-black transition-all duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="ml-2">Back to Admin</span>
          </Link>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Update Existing Products</h1>
          <p className="text-gray-700 mb-6">
            This utility will update all existing products in your database to include the category name based on the category ID.
            This ensures that products can be properly filtered by category in the shop.
          </p>

          {isLoading ? (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex flex-col items-center">
                <SpinningLoader size="large" />
                <p className="mt-4 text-gray-800 font-medium">
                  Updating products...
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdateProducts}
                className="bg-gradient-to-r from-blue-600 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-md transition-all"
              >
                Update All Products
              </motion.button>

              {result && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800">Update Complete</h3>
                  <p className="text-green-700 mt-1">
                    Successfully updated {result.updatedCount} products.
                    {result.errorCount && result.errorCount > 0 ? (
                      <span className="text-amber-600"> There were {result.errorCount} errors.</span>
                    ) : null}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateProductsPage;
