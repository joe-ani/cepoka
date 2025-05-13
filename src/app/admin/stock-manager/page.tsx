"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import LoadingScreen from "@/src/app/Components/LoadingScreen";
import SpinningLoader from "@/src/app/Components/SpinningLoader";
import { format, parseISO } from "date-fns";
import { databases, appwriteConfig } from "@/src/lib/appwrite";

// Define stock product categories
const STOCK_CATEGORIES = [
  {
    id: "spa-salon-furniture",
    name: "Spa & Salon Furniture",
    icon: "🪑",
    color: "from-blue-500 to-blue-700",
  },
  {
    id: "beauty-equipment",
    name: "Beauty Equipment",
    icon: "⚙️",
    color: "from-pink-500 to-pink-700",
  },
  {
    id: "facial-waxing",
    name: "Facial & Waxing",
    icon: "🧖‍♀️",
    color: "from-purple-500 to-purple-700",
  },
  {
    id: "skincare-accessories",
    name: "Skin Care Products & Accessories",
    icon: "🧴",
    color: "from-green-500 to-green-700",
  },
  {
    id: "pedicure-manicure",
    name: "Pedicure & Manicure",
    icon: "💅",
    color: "from-yellow-500 to-yellow-700",
  },
];

interface StockProduct {
  $id: string;
  name: string;
  $createdAt: string;
  lastUpdated?: string;
  stockMovements?: any; // Can be an array or a string (JSON)
  category?: string; // Added category field
}

const StockManagerPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<StockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch stock products from Appwrite
  useEffect(() => {
    const fetchStockProducts = async () => {
      try {
        setLoading(true);

        try {
          const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.stockProductsCollectionId
          );

          // Process the documents to ensure proper formatting
          const stockProducts = response.documents.map((doc: any) => {
            // Ensure stockMovements is an array
            if (!doc.stockMovements) {
              doc.stockMovements = [];
            }

            // Parse each stock movement from string to object if needed
            // This is only for display purposes in the list view
            if (doc.stockMovements && Array.isArray(doc.stockMovements)) {
              doc.stockMovements = doc.stockMovements.map((movement: any) => {
                if (typeof movement === 'string') {
                  try {
                    return JSON.parse(movement);
                  } catch (error) {
                    console.error(`Error parsing stock movement for product ${doc.$id}:`, error);
                    return null;
                  }
                }
                return movement;
              }).filter(Boolean); // Remove any null values
            }

            return doc as StockProduct;
          });

          setProducts(stockProducts);
          setFiltered(stockProducts);
        } catch (error) {
          console.error("Error fetching stock products:", error);
          // Fallback to dummy data if there's an error
          const dummyData: StockProduct[] = [
            {
              $id: "1",
              name: "Salon Chair",
              $createdAt: "2023-05-01T12:00:00.000Z",
              lastUpdated: "2023-05-10T14:30:00.000Z",
              category: "spa-salon-furniture"
            },
            {
              $id: "2",
              name: "Hair Dryer",
              $createdAt: "2023-05-02T10:15:00.000Z",
              lastUpdated: "2023-05-12T09:45:00.000Z",
              category: "beauty-equipment"
            },
            {
              $id: "3",
              name: "Facial Steamer",
              $createdAt: "2023-05-03T15:30:00.000Z",
              lastUpdated: "2023-05-15T16:20:00.000Z",
              category: "facial-waxing"
            },
          ];
          setProducts(dummyData);
          setFiltered(dummyData);
        }
      } catch (error) {
        console.error("Error fetching stock products:", error);
        toast.error("Failed to load stock products");
      } finally {
        setLoading(false);
      }
    };

    fetchStockProducts();
  }, []);

  // Handle search functionality
  const handleSearch = (value: string) => {
    setSearch(value);
    filterProducts(value, dateFilter, selectedCategory);
  };

  // Handle date filter functionality
  const handleDateFilter = (value: string) => {
    setDateFilter(value);
    filterProducts(search, value, selectedCategory);
  };

  // Handle category filter
  const handleCategoryFilter = (categoryId: string | null) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    filterProducts(search, dateFilter, categoryId === selectedCategory ? null : categoryId);
  };

  // Combined filter function
  const filterProducts = (searchValue: string, dateValue: string, categoryValue: string | null) => {
    let filteredData = [...products];

    // Apply search filter
    if (searchValue) {
      filteredData = filteredData.filter(
        (item) => item.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Apply date filter
    if (dateValue) {
      filteredData = filteredData.filter(
        (item) => {
          const itemDate = new Date(item.$createdAt).toISOString().split('T')[0];
          return itemDate === dateValue;
        }
      );
    }

    // Apply category filter
    if (categoryValue) {
      filteredData = filteredData.filter(
        (item) => item.category === categoryValue
      );
    }

    setFiltered(filteredData);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Navigate to create new stock product page
  const handleCreateNew = () => {
    setIsCreating(true);
    setTimeout(() => {
      router.push("/admin/stock-manager/create");
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SpinningLoader size="large" text="Loading stock products..." />
      </div>
    );
  }

  if (isCreating) {
    return <LoadingScreen message="Preparing stock product form..." />;
  }

  return (
    <div className="p-4 max-w-7xl mt-28 sm:mt-32 md:mt-40 mx-auto pt-8 sm:pt-10">
      {/* Back button with animation */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-block mb-4 sm:mb-6"
      >
        <Link
          href="/admin"
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
          Back to Admin
        </Link>
      </motion.div>

      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent flex items-center">
          <span className="text-gray-900 mr-2 inline-block">📦</span>
          Stock Manager
        </h1>
        <p className="text-gray-700 mt-1 text-sm sm:text-base md:text-lg">Create and manage your inventory stock cards</p>
      </div>

      {/* Category Filters */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Categories</h2>
        <div className="flex overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {STOCK_CATEGORIES.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCategoryFilter(category.id)}
              className={`relative cursor-pointer p-3 sm:p-4 rounded-lg text-center transition-all duration-200 shadow-sm flex-shrink-0 min-w-[140px] sm:min-w-0
                ${selectedCategory === category.id
                  ? 'bg-gradient-to-br ' + category.color + ' text-white'
                  : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
                }
              `}
            >
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{category.icon}</div>
              <div className="text-xs sm:text-sm font-medium line-clamp-2">
                {category.name}
              </div>
              {selectedCategory === category.id && (
                <div className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Controls section */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg shadow-sm mb-4 sm:mb-6 border">
        <div className="flex flex-col gap-3">
          {/* Create new button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-[#1E90FF] to-[#FF69B4] text-white px-4 py-3 rounded-lg font-medium hover:shadow-md transition-all w-full flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Stock Product
          </motion.button>

          <div className="flex flex-col gap-3">
            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {/* Search input */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by name..."
                  className="border border-gray-300 pl-10 pr-4 py-3 rounded-lg w-full text-gray-800 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder-gray-500"
                />
              </div>

              {/* Date filter */}
              <div className="relative sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => handleDateFilter(e.target.value)}
                  className="border border-gray-300 pl-10 pr-4 py-3 rounded-lg w-full text-gray-800 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none [color-scheme:light]"
                />
              </div>
            </div>

            {/* Mock data link */}
            <Link
              href="/admin/stock-manager/mock-data"
              className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <span className="mr-2">🧪</span> Add Mock Data
            </Link>
          </div>
        </div>
      </div>

      {/* Stock products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {filtered.length > 0 ? (
          filtered.map((product) => {
            // Find the category for this product
            const productCategory = STOCK_CATEGORIES.find(cat => cat.id === product.category);

            return (
              <motion.div
                key={product.$id}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200"
              >
                <Link
                  href={`/admin/stock-manager/${product.$id}`}
                  className="block p-4 sm:p-5 active:bg-gray-50"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-3">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent pr-2">{product.name}</h2>

                    {/* Category badge */}
                    {productCategory ? (
                      <span className={`bg-gradient-to-r ${productCategory.color} text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center self-start sm:self-auto w-fit`}>
                        <span className="mr-1">{productCategory.icon}</span>
                        {productCategory.name.split(' ')[0]}
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full self-start sm:self-auto">Stock Card</span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs sm:text-sm text-gray-800">
                    <p className="font-medium flex justify-between">
                      <span>Created:</span>
                      <span className="font-bold text-gray-900 ml-2">{formatDate(product.$createdAt)}</span>
                    </p>
                    {product.lastUpdated && (
                      <p className="font-medium flex justify-between">
                        <span>Last Updated:</span>
                        <span className="font-bold text-gray-900 ml-2">{formatDate(product.lastUpdated)}</span>
                      </p>
                    )}
                  </div>

                  {/* View button */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-blue-600 text-xs font-medium flex items-center">
                      <span>View Details</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-lg p-6 sm:p-8 text-center border border-gray-200">
            <div className="flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-800 mb-2 font-medium">No stock products found.</p>
              <p className="text-gray-700 text-sm">
                {search || dateFilter || selectedCategory ? "Try adjusting your search filters." : "Create your first stock product to get started."}
              </p>
              {(search || dateFilter || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearch('');
                    setDateFilter('');
                    setSelectedCategory(null);
                    filterProducts('', '', null);
                  }}
                  className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockManagerPage;
