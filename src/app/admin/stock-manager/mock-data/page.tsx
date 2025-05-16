"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import SpinningLoader from '@/src/app/Components/SpinningLoader';
import { databases, appwriteConfig } from '@/src/lib/appwrite';
import { ID } from 'appwrite';

// Define stock product categories
const STOCK_CATEGORIES = [
  {
    id: "spa-salon-furniture",
    name: "Spa and salon furnitures",
    icon: "🪑",
    products: [
      "Massage bed",
      "saloon Chairs",
      "pedicure chair",
      "manicure chair",
      "salon/spa trolleys",
      "mirrors",
      "massage equipment",
      "side drawers",
      "hair washing basin"
    ]
  },
  {
    id: "beauty-equipment",
    name: "Beauty equipment",
    icon: "⚙️",
    products: [
      "Hydrofacial machine",
      "Micro dermabrasion machine",
      "Facial steamers | standing Dryer",
      "Cavitio machine",
      "Hair steamers",
      "Clippers | straightner | wall dryers",
      "Towel warmers Strilizer | Towels",
      "Apron | Cape | scissors",
      "vacuum Machine",
      "tatoo Machine",
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
      "Cucumber eye pad | gold eye mask",
      "Razor/planning blade | eye brow razor",
      "Facial soap | Extraction pin",
      "small medium & large wax pot",
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
      "sunScreen",
      "Facial mask | Scrub | moroccan prrling cream | moroccan sponge",
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
      "manicure bowl",
      "pedicure bowl",
      "Callous removal",
      "foot mask | foot scrub | hand foot cream",
      "paraffin bath | gloves & socks",
      "cotton wool | cutile softener | removal"
    ]
  },
];

// Define interfaces for stock movement and stock product
interface StockMovement {
  date: string;
  stockedIn: number;
  stockedOut: number;
  remarks: string;
  totalStock: number;
  balance: number;
  sign: string;
}

interface StockProduct {
  name: string;
  category: string;
  stockMovements: StockMovement[];
  lastUpdated: string;
}

// Generate mock stock products from the categories
const mockStockProducts: StockProduct[] = [];

// Create a stock product for each product in each category
STOCK_CATEGORIES.forEach(category => {
  category.products.forEach(productName => {
    mockStockProducts.push({
      name: productName,
      category: category.id,
      stockMovements: [
        {
          date: new Date().toISOString(),
          stockedIn: 10, // Default initial stock
          stockedOut: 0,
          remarks: "Initial stock",
          totalStock: 10,
          balance: 10,
          sign: "Admin"
        }
      ],
      lastUpdated: new Date().toISOString()
    });
  });
});

const MockDataPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [addedCount, setAddedCount] = useState(0);

  const addMockData = async () => {
    try {
      setIsLoading(true);
      setAddedCount(0);
      let successCount = 0;

      // Add each mock stock product to Appwrite
      for (let i = 0; i < mockStockProducts.length; i++) {
        const product = mockStockProducts[i];
        try {
          // Generate a unique ID
          const documentId = ID.unique();

          // Convert each stock movement to a string
          const stringifiedStockMovements = product.stockMovements.map(movement =>
            JSON.stringify(movement)
          );

          // Create the document with stringified stock movements
          await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.stockProductsCollectionId,
            documentId,
            {
              name: product.name,
              category: product.category,
              stockMovements: stringifiedStockMovements, // Array of strings
              lastUpdated: product.lastUpdated
            }
          );

          // Increment the counters
          successCount++;
          setAddedCount(successCount);

          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
          console.error(`Error adding mock product ${product.name}:`, error);

          // Only show toast for first few errors to avoid flooding
          if (successCount < 5) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error(`Failed to add ${product.name}: ${errorMessage}`);
          }

          // Try again with a longer delay
          try {
            await new Promise(resolve => setTimeout(resolve, 500));

            // Generate a unique ID
            const documentId = ID.unique();

            // Convert each stock movement to a string
            const stringifiedStockMovements = product.stockMovements.map(movement =>
              JSON.stringify(movement)
            );

            // Create the document with stringified stock movements
            await databases.createDocument(
              appwriteConfig.databaseId,
              appwriteConfig.stockProductsCollectionId,
              documentId,
              {
                name: product.name,
                category: product.category,
                stockMovements: stringifiedStockMovements, // Array of strings
                lastUpdated: product.lastUpdated
              }
            );

            // Increment the counters
            successCount++;
            setAddedCount(successCount);

          } catch (retryError) {
            console.error(`Failed retry for ${product.name}:`, retryError);
          }
        }
      }

      toast.success(`Added ${successCount} mock stock products successfully!`);
    } catch (error) {
      console.error('Error adding mock data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to add mock data: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-7xl mt-28 sm:mt-32 md:mt-40 mx-auto pt-8 sm:pt-10">
      {/* Back button with animation - improved for mobile */}
      <div className="mb-6">
        <Link
          href="/admin/stock-manager"
          className="inline-flex items-center px-4 py-3 rounded-lg text-gray-700 hover:text-black hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 touch-manipulation"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
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
          Back to Stock Manager
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent flex items-center">
          <span className="text-gray-900 mr-2 inline-block">🧪</span>
          Add Mock Stock Products
        </h1>
        <p className="text-gray-700 mt-1 text-lg">
          Add sample stock products to test the system
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Available Categories and Products</h2>
          <p className="text-gray-700 mt-1">
            The following {mockStockProducts.length} products will be added to your database:
          </p>

          <div className="mt-4 space-y-4">
            {STOCK_CATEGORIES.map((category, catIndex) => (
              <div key={catIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-xl mr-2">{category.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                    {category.products.length} products
                  </span>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {category.products.map((product, prodIndex) => (
                    <li key={prodIndex} className="flex items-center bg-white p-2 rounded border border-gray-100">
                      <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full mr-2 text-xs font-medium">
                        {prodIndex + 1}
                      </span>
                      <span className="text-gray-800 text-sm">{product}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addMockData}
            disabled={isLoading}
            className={`bg-gradient-to-r from-[#1E90FF] to-[#FF69B4] text-white px-6 py-3 rounded-lg font-medium hover:shadow-md transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <SpinningLoader size="small" className="mr-2" />
                <span>
                  Adding Products ({addedCount}/{mockStockProducts.length})...
                </span>
              </div>
            ) : (
              `Add All ${mockStockProducts.length} Stock Products`
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default MockDataPage;
