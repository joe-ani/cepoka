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

interface StockProduct {
  $id: string;
  name: string;
  $createdAt: string;
  lastUpdated?: string;
  stockMovements?: any; // Can be an array or a string (JSON)
}

const StockManagerPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<StockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dateFilter, setDateFilter] = useState("");

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
            { $id: "1", name: "Salon Chair", $createdAt: "2023-05-01T12:00:00.000Z", lastUpdated: "2023-05-10T14:30:00.000Z" },
            { $id: "2", name: "Hair Dryer", $createdAt: "2023-05-02T10:15:00.000Z", lastUpdated: "2023-05-12T09:45:00.000Z" },
            { $id: "3", name: "Facial Steamer", $createdAt: "2023-05-03T15:30:00.000Z", lastUpdated: "2023-05-15T16:20:00.000Z" },
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
    filterProducts(value, dateFilter);
  };

  // Handle date filter functionality
  const handleDateFilter = (value: string) => {
    setDateFilter(value);
    filterProducts(search, value);
  };

  // Combined filter function
  const filterProducts = (searchValue: string, dateValue: string) => {
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
    <div className="p-4 max-w-7xl mt-32 mx-auto">
      {/* Back button */}
      <Link
        href="/admin"
        className="inline-flex items-center mb-6 text-gray-700 hover:text-black transition-colors duration-200"
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

      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent flex items-center">
          <span className="text-gray-900 mr-2 inline-block">📦</span>
          Stock Manager
        </h1>
        <p className="text-gray-700 mt-1 text-lg">Create and manage your inventory stock cards</p>
      </div>

      {/* Controls section */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6 border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Create new button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-[#1E90FF] to-[#FF69B4] text-white px-4 py-2 rounded-lg font-medium hover:shadow-md transition-all w-full md:w-auto"
          >
            Create New Stock Product
          </motion.button>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search input */}
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name..."
              className="border border-gray-300 px-4 py-2 rounded-lg w-full sm:w-64 text-gray-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />

            {/* Date filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => handleDateFilter(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-lg w-full sm:w-auto text-gray-900 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />

            {/* Mock data link */}
            <Link
              href="/admin/stock-manager/mock-data"
              className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <span className="mr-1">🧪</span> Add Mock Data
            </Link>
          </div>
        </div>
      </div>

      {/* Stock products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filtered.length > 0 ? (
          filtered.map((product) => (
            <motion.div
              key={product.$id}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200"
            >
              <Link
                href={`/admin/stock-manager/${product.$id}`}
                className="block p-5"
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">{product.name}</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Stock Card</span>
                </div>

                <div className="space-y-1 text-sm text-gray-800">
                  <p className="font-medium">Created: <span className="font-bold text-gray-900">{formatDate(product.$createdAt)}</span></p>
                  {product.lastUpdated && (
                    <p className="font-medium">Last Updated: <span className="font-bold text-gray-900">{formatDate(product.lastUpdated)}</span></p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
            <p className="text-gray-800 mb-4 font-medium">No stock products found.</p>
            <p className="text-gray-700 text-sm">
              {search || dateFilter ? "Try adjusting your search filters." : "Create your first stock product to get started."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockManagerPage;
