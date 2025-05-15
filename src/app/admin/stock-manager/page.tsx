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
    name: "Spa and salon furnitures",
    icon: "🪑",
    color: "from-blue-500 to-blue-700",
  },
  {
    id: "beauty-equipment",
    name: "Beauty equipment",
    icon: "⚙️",
    color: "from-pink-500 to-pink-700",
  },
  {
    id: "facial-waxing",
    name: "Facials and waxing",
    icon: "🧖‍♀️",
    color: "from-purple-500 to-purple-700",
  },
  {
    id: "skincare-accessories",
    name: "Skincare products & accessories",
    icon: "🧴",
    color: "from-green-500 to-green-700",
  },
  {
    id: "pedicure-manicure",
    name: "Pedicure and manicure",
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
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteProgress, setBulkDeleteProgress] = useState({ current: 0, total: 0 });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

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

  // Bulk delete all stock products
  const bulkDeleteStockProducts = async () => {
    try {
      setIsBulkDeleting(true);
      const totalProducts = products.length;
      setBulkDeleteProgress({ current: 0, total: totalProducts });

      // Delete products one by one
      for (let i = 0; i < totalProducts; i++) {
        const product = products[i];
        setBulkDeleteProgress({ current: i + 1, total: totalProducts });

        await databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.stockProductsCollectionId,
          product.$id
        );
      }

      toast.success('All stock products deleted successfully');
      setProducts([]);
      setFiltered([]);
    } catch (error) {
      console.error('Error bulk deleting stock products:', error);
      toast.error('Failed to delete all stock products');
    } finally {
      setIsBulkDeleting(false);
      setShowBulkDeleteModal(false);
    }
  };

  // Delete selected stock products
  const deleteSelectedStockProducts = async () => {
    try {
      if (selectedProducts.length === 0) {
        toast.error('No products selected');
        return;
      }

      setIsBulkDeleting(true);
      const totalSelected = selectedProducts.length;
      setBulkDeleteProgress({ current: 0, total: totalSelected });

      // Delete selected products one by one
      for (let i = 0; i < totalSelected; i++) {
        const productId = selectedProducts[i];
        setBulkDeleteProgress({ current: i + 1, total: totalSelected });

        await databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.stockProductsCollectionId,
          productId
        );
      }

      toast.success(`${totalSelected} product${totalSelected > 1 ? 's' : ''} deleted successfully`);
      setSelectedProducts([]); // Clear selection
      setIsMultiSelectMode(false); // Exit multi-select mode

      // Refresh the products list
      const updatedProducts = products.filter(product => !selectedProducts.includes(product.$id));
      setProducts(updatedProducts);
      setFiltered(updatedProducts);
    } catch (error) {
      console.error('Error deleting selected products:', error);
      toast.error('Failed to delete selected products');
    } finally {
      setIsBulkDeleting(false);
      setShowBulkDeleteModal(false);
    }
  };

  // Toggle product selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
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
      {/* Back button with animation - improved for mobile */}
      <div className="mb-4 sm:mb-6">
        <a
          href="/admin"
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
          Back to Admin
        </a>
      </div>

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {STOCK_CATEGORIES.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCategoryFilter(category.id)}
              className={`relative cursor-pointer p-3 sm:p-4 rounded-lg text-center transition-all duration-200 shadow-sm
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
            {/* Multi-select mode toggle */}
            {products.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsMultiSelectMode(!isMultiSelectMode);
                  if (isMultiSelectMode) {
                    setSelectedProducts([]);
                  }
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center
                  ${isMultiSelectMode
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {isMultiSelectMode ? 'Exit Selection Mode' : 'Select Multiple Products'}
              </motion.button>
            )}

            {/* Delete Selected Button */}
            {isMultiSelectMode && selectedProducts.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowBulkDeleteModal(true)}
                className="bg-red-50 text-red-600 px-4 py-3 rounded-lg font-medium hover:bg-red-100 transition-all duration-200 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected ({selectedProducts.length})
              </motion.button>
            )}

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

            {/* Add stock products link */}
            <Link
              href="/admin/stock-manager/mock-data"
              className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <span className="mr-2">📋</span> Add All Stock Products from Categories
            </Link>

            {/* Delete all stock products button */}
            {products.length > 0 && (
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="px-4 py-3 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors duration-200 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete All Stock Products
              </button>
            )}
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
                className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border ${isMultiSelectMode && selectedProducts.includes(product.$id)
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200'
                  }`}
                onClick={(e) => {
                  if (isMultiSelectMode) {
                    e.preventDefault();
                    toggleProductSelection(product.$id);
                  }
                }}
              >
                {isMultiSelectMode ? (
                  <div className="block p-4 sm:p-5 active:bg-gray-50 cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent pr-2">{product.name}</h2>

                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center ${selectedProducts.includes(product.$id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                          }`}
                      >
                        {selectedProducts.includes(product.$id) && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Category badge */}
                    {productCategory ? (
                      <span className={`bg-gradient-to-r ${productCategory.color} text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center self-start sm:self-auto w-fit`}>
                        <span className="mr-1">{productCategory.icon}</span>
                        {productCategory.name.split(' ')[0]}
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full self-start sm:self-auto">Stock Card</span>
                    )}

                    <div className="space-y-1 text-xs sm:text-sm text-gray-800 mt-3">
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
                  </div>
                ) : (
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
                )}
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

      {/* Bulk Delete Stock Products Confirmation Modal */}
      {
        showBulkDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-md">
              {isBulkDeleting ? (
                <div className="flex flex-col items-center py-4">
                  <SpinningLoader size="large" />
                  <p className="mt-4 text-gray-800 font-medium">
                    Deleting stock products... ({bulkDeleteProgress.current} of {bulkDeleteProgress.total})
                  </p>
                  <div className="w-full mt-4 bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-pink-500 h-2.5 rounded-full"
                      style={{ width: `${(bulkDeleteProgress.current / bulkDeleteProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    {isMultiSelectMode && selectedProducts.length > 0
                      ? 'Delete Selected Stock Products'
                      : 'Delete All Stock Products'
                    }
                  </h2>
                  <p className="text-gray-600 mb-2">
                    {isMultiSelectMode && selectedProducts.length > 0
                      ? 'Are you sure you want to delete the selected stock products?'
                      : 'Are you sure you want to delete all stock products?'
                    }
                  </p>
                  <p className="text-red-600 text-sm mb-6">
                    This will delete <span className="font-bold">
                      {isMultiSelectMode && selectedProducts.length > 0
                        ? `${selectedProducts.length} selected`
                        : products.length
                      } stock product{(isMultiSelectMode && selectedProducts.length > 0 ? selectedProducts.length : products.length) !== 1 ? 's' : ''}
                    </span> and cannot be undone.
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
                      onClick={() => setShowBulkDeleteModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-all duration-200"
                      onClick={isMultiSelectMode && selectedProducts.length > 0 ? deleteSelectedStockProducts : bulkDeleteStockProducts}
                    >
                      {isMultiSelectMode && selectedProducts.length > 0 ? 'Delete Selected' : 'Delete All'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      }
    </div>
  );
};

export default StockManagerPage;
