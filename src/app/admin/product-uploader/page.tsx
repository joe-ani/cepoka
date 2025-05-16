"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { databases, appwriteConfig } from '@/src/lib/appwrite';
import { ID } from 'appwrite';
import SpinningLoader from '@/src/app/Components/SpinningLoader';
import LoadingScreen from '@/src/app/Components/LoadingScreen';
import BackArrow from '@/src/app/Components/BackArrow';

// Define product categories
const PRODUCT_CATEGORIES = [
  {
    id: "spa-salon-furniture",
    name: "Spa and salon furnitures",
    icon: "🪑",
    products: [
      "Massage bed",
      "Saloon Chairs",
      "Pedicure chair",
      "Manicure chair",
      "Salon/spa trolleys",
      "Mirrors",
      "Massage equipment",
      "Side drawers",
      "Hair washing basin"
    ]
  },
  {
    id: "beauty-equipment",
    name: "Beauty equipment",
    icon: "⚙️",
    products: [
      "Hydrofacial machine",
      "Micro dermabrasion machine",
      "Facial steamers | Standing Dryer",
      "Cavitio machine",
      "Hair steamers",
      "Clippers | Straightner | Wall dryers",
      "Towel warmers Strilizer | Towels",
      "Apron | Cape | Scissors",
      "Vacuum Machine",
      "Tatoo Machine",
      "G-5"
    ]
  },
  {
    id: "facial-waxing",
    name: "Facials and waxing",
    icon: "🧖‍♀️",
    products: [
      "3D Beauty mask",
      "Omega liquid | Jelly Mask | Face mask",
      "Cucumber eye pad | Gold eye mask",
      "Razor/planning blade | Eye brow razor",
      "Facial soap | Extraction pin",
      "Small medium & large wax pot",
      "Wax beans",
      "Paraffin wax",
      "After/Before wax oil",
      "Roll on wax",
      "Cotton pads"
    ]
  },
  {
    id: "skincare-accessories",
    name: "Skincare products & accessories",
    icon: "🧴",
    products: [
      "Cleanser | Toner | Moisturizer",
      "SunScreen",
      "Facial mask | Scrub | Moroccan prrling cream | Moroccan sponge",
      "Aloe vera gel",
      "Body Ampoules",
      "Body Scrub",
      "Collagen facial mask",
      "24K Gold toner",
      "Facial Foam"
    ]
  },
  {
    id: "pedicure-manicure",
    name: "Pedicure and manicure",
    icon: "💅",
    products: [
      "Foot file",
      "Scrapper",
      "Manicure bowl",
      "Pedicure bowl",
      "Callous removal",
      "Foot mask | Foot scrub | Hand foot cream",
      "Paraffin bath | Gloves & socks",
      "Cotton wool | Cutile softener | Removal"
    ]
  }
];

// Generate mock products from the categories
const mockProducts = [];

// Create a product for each product in each category
PRODUCT_CATEGORIES.forEach(category => {
  category.products.forEach(productName => {
    mockProducts.push({
      name: productName,
      price: "200000", // 200k as requested
      description: `${productName} - High quality product from Cepoka Beauty Hub. This is a placeholder description that will be updated later with detailed product information.`,
      category: category.name,
      imageUrls: [] // Empty array for now, will be updated later
    });
  });
});

const ProductUploaderPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isNavigating, setIsNavigating] = useState(false);

  // Function to create a single product
  const createProduct = async (product) => {
    try {
      // Generate a unique ID
      const documentId = ID.unique();

      // Create the document
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.productsCollectionId,
        documentId,
        {
          name: product.name,
          price: product.price,
          description: product.description,
          category: product.category,
          imageUrls: product.imageUrls
        }
      );

      return true;
    } catch (error) {
      console.error(`Error creating product "${product.name}":`, error);
      return false;
    }
  };

  // Function to create all products
  const createAllProducts = async () => {
    try {
      setIsLoading(true);

      // Calculate total products
      const totalProducts = mockProducts.length;

      setProgress({ current: 0, total: totalProducts });

      let successCount = 0;
      let failCount = 0;

      // Process in batches of 10 for better performance and UI feedback
      const batchSize = 10;
      const batches = Math.ceil(totalProducts / batchSize);

      for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, totalProducts);
        const batch = mockProducts.slice(startIndex, endIndex);

        // Process batch in parallel for faster creation
        const results = await Promise.all(
          batch.map(async (product) => {
            try {
              const success = await createProduct(product);
              return { success, product };
            } catch (err) {
              console.error(`Error in batch processing for ${product.name}:`, err);
              return { success: false, product };
            }
          })
        );

        // Update counts and progress
        results.forEach(({ success }) => {
          if (success) {
            successCount++;
          } else {
            failCount++;
          }
        });

        setProgress(prev => ({
          ...prev,
          current: Math.min(startIndex + batchSize, totalProducts)
        }));
      }

      // Show success message
      toast.success(`Created ${successCount} products successfully${failCount > 0 ? ` (${failCount} failed)` : ''}`);

      // Navigate back to admin page after a short delay
      setTimeout(() => {
        setIsNavigating(true);
        router.push('/admin');
      }, 2000);

    } catch (error) {
      console.error('Error creating products:', error);
      toast.error('Failed to create products');
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
          <BackArrow href="/admin" text="Back to Admin" />
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Add Shop Products</h1>
          <p className="text-gray-700 mb-6">
            This will create shop products for all categories based on the predefined list.
            A total of {mockProducts.length} products will be created with dummy data (₦200,000 price and basic descriptions).
          </p>

          {isLoading ? (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex flex-col items-center">
                <SpinningLoader size="large" />
                <p className="mt-4 text-gray-800 font-medium">
                  Creating products... ({progress.current} of {progress.total})
                </p>
                <div className="w-full mt-4 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-pink-500 h-2.5 rounded-full"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={createAllProducts}
                className="bg-gradient-to-r from-blue-600 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-md transition-all"
              >
                Create All Shop Products
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
        </div>

        {/* Category Preview */}
        <div className="mt-8 bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Categories and Products</h2>
          <div className="space-y-6">
            {PRODUCT_CATEGORIES.map((category, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-xl mr-2">{category.icon}</span>
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                    {category.products.length} products
                  </span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {category.products.map((product, prodIndex) => (
                    <li key={prodIndex} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {product}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductUploaderPage;
