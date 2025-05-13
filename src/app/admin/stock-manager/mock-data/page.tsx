"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import SpinningLoader from '@/src/app/Components/SpinningLoader';
import { databases, appwriteConfig } from '@/src/lib/appwrite';
import { ID } from 'appwrite';

// Define stock product categories
const STOCK_CATEGORIES = [
  {
    id: "spa-salon-furniture",
    name: "Spa & Salon Furniture",
    icon: "🪑",
  },
  {
    id: "beauty-equipment",
    name: "Beauty Equipment",
    icon: "⚙️",
  },
  {
    id: "facial-waxing",
    name: "Facial & Waxing",
    icon: "🧖‍♀️",
  },
  {
    id: "skincare-accessories",
    name: "Skin Care Products & Accessories",
    icon: "🧴",
  },
  {
    id: "pedicure-manicure",
    name: "Pedicure & Manicure",
    icon: "💅",
  },
];

// Mock data for stock products
const mockStockProducts = [
  {
    name: "Salon Chair",
    category: "spa-salon-furniture",
    stockMovements: [
      {
        date: new Date("2023-05-01").toISOString(),
        stockedIn: 10,
        stockedOut: 0,
        remarks: "Initial stock",
        totalStock: 10,
        balance: 10,
        sign: "Admin"
      },
      {
        date: new Date("2023-05-15").toISOString(),
        stockedIn: 5,
        stockedOut: 0,
        remarks: "Restocked",
        totalStock: 15,
        balance: 15,
        sign: "Admin"
      },
      {
        date: new Date("2023-06-01").toISOString(),
        stockedIn: 0,
        stockedOut: 3,
        remarks: "Sold to customer",
        totalStock: 15,
        balance: 12,
        sign: "Admin"
      }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    name: "Hair Dryer",
    category: "beauty-equipment",
    stockMovements: [
      {
        date: new Date("2023-05-10").toISOString(),
        stockedIn: 8,
        stockedOut: 0,
        remarks: "Initial stock",
        totalStock: 8,
        balance: 8,
        sign: "Admin"
      },
      {
        date: new Date("2023-06-05").toISOString(),
        stockedIn: 0,
        stockedOut: 2,
        remarks: "Sold to customer",
        totalStock: 8,
        balance: 6,
        sign: "Admin"
      }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    name: "Facial Steamer",
    category: "facial-waxing",
    stockMovements: [
      {
        date: new Date("2023-05-20").toISOString(),
        stockedIn: 5,
        stockedOut: 0,
        remarks: "Initial stock",
        totalStock: 5,
        balance: 5,
        sign: "Admin"
      }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    name: "Makeup Brushes Set",
    category: "skincare-accessories",
    stockMovements: [
      {
        date: new Date("2023-06-10").toISOString(),
        stockedIn: 15,
        stockedOut: 0,
        remarks: "Initial stock",
        totalStock: 15,
        balance: 15,
        sign: "Admin"
      },
      {
        date: new Date("2023-06-20").toISOString(),
        stockedIn: 0,
        stockedOut: 5,
        remarks: "Sold to customer",
        totalStock: 15,
        balance: 10,
        sign: "Admin"
      }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    name: "Nail Polish Collection",
    category: "pedicure-manicure",
    stockMovements: [
      {
        date: new Date("2023-07-01").toISOString(),
        stockedIn: 20,
        stockedOut: 0,
        remarks: "Initial stock",
        totalStock: 20,
        balance: 20,
        sign: "Admin"
      }
    ],
    lastUpdated: new Date().toISOString()
  }
];

const MockDataPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(mockStockProducts.length);

  const addMockData = async () => {
    try {
      setIsLoading(true);
      setAddedCount(0);

      // Add each mock stock product to Appwrite
      for (const product of mockStockProducts) {
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

          // Increment the counter
          setAddedCount(prev => prev + 1);

          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error: any) {
          console.error(`Error adding mock product ${product.name}:`, error);
          toast.error(`Failed to add ${product.name}: ${error.message || 'Unknown error'}`);
        }
      }

      toast.success(`Added ${addedCount} mock stock products successfully!`);
    } catch (error: any) {
      console.error('Error adding mock data:', error);
      toast.error(`Failed to add mock data: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-7xl mt-28 sm:mt-32 md:mt-40 mx-auto pt-8 sm:pt-10">
      {/* Back button with animation */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-block mb-6"
      >
        <Link
          href="/admin/stock-manager"
          className="inline-flex items-center px-3 py-2 rounded-lg text-gray-700 hover:text-black hover:bg-gray-100 transition-all duration-200"
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
      </motion.div>

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
          <h2 className="text-xl font-semibold text-gray-900">Available Mock Products</h2>
          <p className="text-gray-700 mt-1">
            The following mock products will be added to your database:
          </p>

          <ul className="mt-4 space-y-2">
            {mockStockProducts.map((product, index) => {
              const category = STOCK_CATEGORIES.find(cat => cat.id === product.category);
              return (
                <li key={index} className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full mr-2 text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{product.name}</span>
                  {category && (
                    <span className="ml-2 flex items-center text-sm">
                      <span className="mr-1">{category.icon}</span>
                      <span className="text-gray-700">{category.name}</span>
                    </span>
                  )}
                  <span className="ml-2 text-sm text-gray-600">
                    ({product.stockMovements.length} stock movements)
                  </span>
                </li>
              );
            })}
          </ul>
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
                  Adding Mock Data ({addedCount}/{totalCount})...
                </span>
              </div>
            ) : (
              'Add Mock Stock Products'
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default MockDataPage;
