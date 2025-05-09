"use client";
import { motion } from "framer-motion";
import BackArrow from "../Components/BackArrow";
import SpinningLoader from "../Components/SpinningLoader";
import { useState, useMemo, useEffect } from "react";
import { ProductCard } from "@/src/components/ProductCard";
import { databases, appwriteConfig } from "@/src/lib/appwrite";
import { useSearchParams } from "next/navigation";
import { fetchCategories, Category } from "@/src/services/categoryService";

// Remove products import since we're using Appwrite data
// import { products } from "@/src/data/products"

interface Product {
  $id: string;
  name: string;
  price: string;
  description: string;
  imageUrls: string[];
  category?: string; // Add category field
}

export default function ShopContent() {
  // =============== STATE MANAGEMENT ===============
  // Router is not used in this component
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams ? searchParams.get('search') || "" : "";
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // =============== LIFECYCLE HOOKS ===============
  // Component Mount Handler
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scroll Handler
  useEffect(() => {
    if (!isMounted) return;

    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setShowScrollTop(window.scrollY > 500);
      }
    };

    window?.addEventListener('scroll', handleScroll);
    return () => window?.removeEventListener('scroll', handleScroll);
  }, [isMounted]);

  // URL Params Handler
  useEffect(() => {
    if (!searchParams) return;

    const category = searchParams.get('category');
    const search = searchParams.get('search');

    if (category) setActiveCategory(category);
    if (search) setSearchQuery(search);
  }, [searchParams]);

  // Fetch categories from Appwrite
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Appwrite Data Fetching
  useEffect(() => {
    const fetchAppwriteData = async () => {
      try {
        setLoading(true);
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.productsCollectionId
        );
        console.log('✅ Appwrite Products:', response.documents);
        const productsData = response.documents as unknown as Product[];
        setProducts(productsData);
      } catch (error) {
        console.error('❌ Error fetching from Appwrite:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppwriteData();
  }, []);

  // =============== MEMOIZED COMPUTATIONS ===============
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    return products.filter(product => {
      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter - find the category name from fetched categories
      const selectedCategory = categories.find(cat => cat.id === activeCategory)?.name;
      const matchesCategory = !activeCategory ||
        (product.category && product.category.toLowerCase() === selectedCategory?.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory, categories]);

  // =============== EVENT HANDLERS ===============
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMounted || typeof window === 'undefined') return;

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('search', searchQuery);
      window.history.pushState({}, '', url.toString());
    } catch (error) {
      console.error('Error updating URL:', error);
    }
  };

  const scrollToTop = () => {
    if (!isMounted || typeof window === 'undefined') return;
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // const handleBack = () => {
  //   if (!isMounted || typeof window === 'undefined') return;
  //   router.back();
  // };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SpinningLoader size="large" text="Loading products..." />
      </div>
    );
  }

  // =============== RENDER METHODS ===============
  return (
    <div className="text-black p-3 sm:p-10 pt-20 sm:pt-28 flex flex-col justify-center items-center">
      {/* Back Button matching ProductPageClient styling */}
      <div className="flex w-full justify-start mb-6 mt-4 sm:mt-0">
        <BackArrow className="text-gray-700" />
      </div>

      {/* Search and Filter Section */}
      <div className="w-full max-w-4xl mt-4 sm:mt-8 flex flex-col sm:flex-row justify-between items-center gap-3 px-2 sm:px-4 md:px-8">
        {/* Search Bar Component */}
        <div className="flex-1 w-full sm:max-w-[280px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={handleSearch} // Trigger search on blur to avoid glitch
              className="w-full py-2 px-4 bg-[#f1f1f1] rounded-full text-sm focus:outline-none
              border border-transparent focus:border-gray-200 transition-all duration-300 pr-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter Dropdown Component */}
        <div className="relative w-full sm:min-w-[100px] sm:w-auto">
          <select
            className="appearance-none w-full py-2 px-4 bg-[#f1f1f1] rounded-full text-sm
            border border-transparent focus:border-gray-200 focus:outline-none cursor-pointer
            transition-all duration-300 pr-8"
            onChange={(e) => {
              const select = e.currentTarget;
              select.style.transform = 'scale(0.98)';
              setTimeout(() => select.style.transform = '', 150);
            }}
          >
            <option value="">All</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="w-full max-w-4xl mt-4 sm:mt-8 px-2 sm:px-4 md:px-8">
        <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-4">Categories</h3>
        {categoriesLoading ? (
          <div className="flex justify-center items-center py-6">
            <SpinningLoader size="small" text="Loading categories..." />
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-3">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                className={`cursor-pointer p-2 sm:p-3 rounded-lg text-center transition-colors duration-200
                  ${activeCategory === category.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                  }
                `}
              >
                <div className="text-lg sm:text-2xl">{category.icon}</div>
                <div className="text-[10px] sm:text-sm font-medium mt-0.5 sm:mt-1">{category.name}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* No Results Message */}
      {filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-center py-8 sm:py-20"
        >
          <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">🔍</div>
          <h3 className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-2">No products found</h3>
          <p className="text-gray-600 text-xs sm:text-base">
            We couldn&apos;t find any products matching your search.
            <br />
            Try using different keywords or browsing our categories.
          </p>
        </motion.div>
      )}

      {/* Products Grid */}
      <div className="w-full max-w-7xl mt-8 sm:mt-12 px-2 sm:px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 place-items-center">
          {filteredProducts.map((product) => (
            <ProductCard key={product.$id} product={product} />
          ))}
        </div>
      </div>

      {/* Scroll To Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-black/80 hover:bg-black text-white w-10 h-10
          rounded-full flex items-center justify-center shadow-lg cursor-pointer backdrop-blur-sm
          transition-all duration-300 hover:shadow-xl"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </motion.button>
      )}
    </div>
  );
}
