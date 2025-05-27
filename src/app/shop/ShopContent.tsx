"use client";

import { motion, AnimatePresence } from "framer-motion";
import SpinningLoader from "../Components/SpinningLoader";
import { useState, useMemo, useEffect } from "react";
import { ProductCard } from "@/src/components/ProductCard";
import { databases, appwriteConfig } from "@/src/lib/appwrite";
import { useSearchParams } from "next/navigation";
import { CATEGORIES } from '@/src/data/categories';
import { Query } from 'appwrite';
import Link from 'next/link';

interface Product {
  $id: string;
  name: string;
  price: string;
  description: string;
  imageUrls: string[];
  category?: string;
  categoryName?: string; // Add category name field
  $createdAt: string;
}

export default function ShopContent() {
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams ? searchParams.get('search') || "" : "";
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

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
    if (!searchParams || !isMounted) return;

    const categoryId = searchParams.get('category');
    const shouldSelect = searchParams.get('select') === 'true';
    const searchParam = searchParams.get('search');

    console.log('URL Parameters:', { categoryId, shouldSelect, searchParam });

    if (categoryId && shouldSelect) {
      console.log('Setting active category:', categoryId);
      setActiveCategory(categoryId);

      // Clean up URL after setting category
      const url = new URL(window.location.href);
      url.searchParams.delete('select');
      window.history.replaceState({}, '', url.toString());
    }

    if (searchParam) {
      console.log('Setting search query:', searchParam);
      setSearchQuery(searchParam);
    }
  }, [searchParams, isMounted]);

  // Fetch products from Appwrite
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.productsCollectionId,
          [
            Query.orderDesc('$createdAt') // Default to newest first
          ]
        );

        console.log('✅ Fetched Products:', response.documents);
        const productsData = response.documents as unknown as Product[];
        setProducts(productsData);
      } catch (error) {
        console.error('❌ Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      // Match by category ID (using the predefined category IDs from CATEGORIES)
      const matchesCategory = !activeCategory ||
        product.category === activeCategory ||
        product.categoryName === CATEGORIES.find(cat => cat.id === activeCategory)?.name;

      // Debug logging for category matching
      console.log(`Product "${product.name}":
        - Category ID: ${product.category || 'none'}
        - Category Name: ${product.categoryName || 'none'}
        - Active Category: ${activeCategory}
        - Active Category Name: ${CATEGORIES.find(cat => cat.id === activeCategory)?.name || 'none'}
        - Matches Category: ${matchesCategory}
      `);

      const matchesSearch = !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });

    // Sort products by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.$createdAt).getTime();
      const dateB = new Date(b.$createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [products, activeCategory, searchQuery, sortOrder]);

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMounted || typeof window === 'undefined') return;

    try {
      const url = new URL(window.location.href);
      if (searchQuery) {
        url.searchParams.set('search', searchQuery);
      } else {
        url.searchParams.delete('search');
      }
      if (activeCategory) {
        url.searchParams.set('category', activeCategory);
      }
      window.history.pushState({}, '', url.toString());
    } catch (error) {
      console.error('Error updating URL:', error);
    }
  };

  // Scroll to top handler
  const scrollToTop = () => {
    if (!isMounted || typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
      >
        <SpinningLoader size="large" text="Loading products..." />
      </motion.div>
    );
  }

  return (
    <div className="text-black p-3 sm:p-10 pt-20 sm:pt-28 flex flex-col justify-center items-center">
      {/* Back Button */}
      <div className="flex w-full justify-start mb-8 mt-8 sm:mt-4 px-2 sm:px-4 md:px-8">
        <Link
          href="/"
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
          Back to Home
        </Link>
      </div>

      {/* Search Bar and Sort Order */}
      <div className="w-full max-w-4xl mt-4 sm:mt-8 px-2 sm:px-4 md:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1 w-full sm:max-w-[280px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={handleSearch}
                className="w-full py-2 px-4 bg-[#f1f1f1] rounded-full text-sm focus:outline-none
                border border-transparent focus:border-gray-200 transition-all duration-300 pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Sort Order Selector */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Categories Section */}
      <div className="w-full max-w-4xl mt-4 sm:mt-8 px-2 sm:px-4 md:px-8">
        <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-4">Categories</h3>
        <div className="categories-section grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-3">
          {CATEGORIES.map((category) => {
            // Count products that match either by category ID or category name
            const productCount = products.filter(p =>
              p.category === category.id ||
              p.categoryName === category.name
            ).length;
            return (
              <motion.div
                key={category.id}
                data-category-id={category.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const newCategory = activeCategory === category.id ? null : category.id;
                  setActiveCategory(newCategory);

                  if (typeof window !== 'undefined') {
                    const url = new URL(window.location.href);
                    if (newCategory) {
                      url.searchParams.set('category', newCategory);
                    } else {
                      url.searchParams.delete('category');
                    }
                    window.history.pushState({}, '', url.toString());
                  }
                }}
                className={`relative cursor-pointer p-2 sm:p-3 rounded-lg text-center transition-colors duration-200 group
                  ${activeCategory === category.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }
                `}
              >
                <div className="text-xl sm:text-2xl mb-1">{category.icon}</div>
                <div className="text-[10px] sm:text-sm font-medium line-clamp-2">
                  {category.name}
                </div>
                {productCount > 0 && (
                  <div className="text-[8px] sm:text-xs font-medium mt-1 bg-black/10 rounded-full px-1.5 py-0.5">
                    {productCount} items
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 place-items-center">
          {filteredProducts.map((product) => (
            <ProductCard key={product.$id} product={product} />
          ))}
        </div>
      </div>

      {/* Scroll To Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 bg-black/80 hover:bg-black text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
