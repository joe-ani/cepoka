"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { databases, storage, appwriteConfig } from '../../lib/appwrite';
import { ID, Query } from 'appwrite';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
// import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import Link from 'next/link';
import Image from 'next/image';
import LoadingScreen from '../Components/LoadingScreen';
import SpinningLoader from '../Components/SpinningLoader';
import { CATEGORIES } from '@/src/data/categories'
// Category services are not used in this component


// Schema for product form validation using Zod
// Get valid category IDs from CATEGORIES
const validCategoryIds = CATEGORIES.map(cat => cat.id);

const productSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    price: z.string().min(1, "Price is required"),
    description: z.string().min(1, "Description is required"),
    category: z.string().refine(val => validCategoryIds.includes(val), {
        message: "Please select a valid category"
    }).optional(),
});

// Type definition for Appwrite error responses
type AppwriteError = {
    message: string;
    code: number;
};

// Interface for product data structure
interface Product {
    $id: string;          // Unique identifier from Appwrite
    name: string;         // Product name
    price: string;        // Product price
    description: string;  // Product description
    imageUrls: string[]; // Array of image URLs
    category?: string;   // Category ID from predefined CATEGORIES
}

// Interface for
interface ProductFormData {
    name: string;
    price: string;
    description: string;
    category?: string;
}

const AdminPage = () => {
    // Router for navigation is not used in this component

    // State management
    const [isAuthorized, setIsAuthorized] = useState(false);        // Authorization status
    const [products, setProducts] = useState<Product[]>([]);         // List of products
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);  // Selected image files
    const [isLoading, setIsLoading] = useState(false);              // Loading state
    const [isNavigating] = useState(false);        // Navigation loading state
    const [isStockNavigating] = useState(false);        // Navigation loading state
    const [categoriesLoading, setCategoriesLoading] = useState(true); // Categories loading state
    const [editingProduct, setEditingProduct] = useState<Product | null>(null); // Currently editing product
    const [showImageModal, setShowImageModal] = useState<string | null>(null);  // Image modal visibility
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');        // Sort order for products
    const [currentImageIndex, setCurrentImageIndex] = useState(0);             // Current image index in modal
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null); // Delete confirmation modal
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Selected category from predefined CATEGORIES
    const [isDragging, setIsDragging] = useState(false); // State for drag and drop functionality
    const fileInputRef = useRef<HTMLInputElement>(null); // Reference to file input element
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false); // Bulk delete confirmation modal
    const [isBulkDeleting, setIsBulkDeleting] = useState(false); // Bulk delete loading state
    const [bulkDeleteProgress, setBulkDeleteProgress] = useState({ current: 0, total: 0 }); // Bulk delete progress
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]); // Selected products for multi-delete
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false); // Multi-select mode toggle
    // Loading state is handled by isLoading

    // State variables for category management
    // Using predefined categories, so these states are not needed
    const [newCategory, setNewCategory] = useState('');
    const [showIconSelector, setShowIconSelector] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState('');
    const [showCustomIconInput, setShowCustomIconInput] = useState(false);
    const [customIcon, setCustomIcon] = useState('');
    const [showCategoryDeleteModal, setShowCategoryDeleteModal] = useState<string | null>(null);

    // Available icons for category selection
    const AVAILABLE_ICONS = ['🛋️', '💆‍♀️', '🧴', '💅', '💇‍♀️', '🪑', '🛁', '🧖‍♀️', '🧼', '💈'];

    // Ref for form scrolling
    const formRef = useRef<HTMLDivElement>(null);

    // Form setup using react-hook-form with Zod validation
    const { register, handleSubmit, reset, formState: { errors }, getValues } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema)
    });

    // Function to fetch products
    const fetchProducts = useCallback(async () => {
        try {
            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.productsCollectionId,
                [sortOrder === 'asc' ? Query.orderAsc('$createdAt') : Query.orderDesc('$createdAt')]
            );
            setProducts(response.documents as unknown as Product[]);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products');
        }
    }, [sortOrder]);

    // Fetch products from Appwrite database
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const response = await databases.listDocuments(
                    appwriteConfig.databaseId,
                    appwriteConfig.productsCollectionId,
                    [sortOrder === 'asc' ? Query.orderAsc('$createdAt') : Query.orderDesc('$createdAt')]
                );
                setProducts(response.documents as unknown as Product[]);
            } catch (error) {
                console.error('Error fetching products:', error);
                toast.error('Failed to fetch products');
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthorized) {
            fetchProducts();
        }
    }, [isAuthorized, sortOrder]);    // No need to fetch categories since we're using fixed ones from CATEGORIES
    useEffect(() => {
        setCategoriesLoading(false);
    }, []);

    const clearForm = () => {
        reset({
            name: '',
            price: '',
            description: '',
            category: ''
        });
        setSelectedFiles([]);
        setSelectedCategory(null);
        setEditingProduct(null);
    };

    // Handle form submission for creating/updating products
    const onSubmit = async (data: ProductFormData) => {
        try {
            setIsLoading(true);
            console.log('📝 Submitting product data:', data);

            // Handle image uploads
            let imageUrls: string[] = [];
            if (selectedFiles.length > 0) {
                try {
                    console.log('🖼️ Uploading images...');
                    // Upload all selected images to Appwrite storage
                    const uploadPromises = selectedFiles.map(file =>
                        storage.createFile(
                            appwriteConfig.storageId,
                            ID.unique(),
                            file
                        )
                    );

                    const uploadedFiles = await Promise.all(uploadPromises);
                    // Generate URLs for uploaded images
                    imageUrls = uploadedFiles.map(file => {
                        if (file && file.$id) {
                            // Use the getFileView method instead of constructing URL manually
                            return storage.getFileView(
                                appwriteConfig.storageId,
                                file.$id
                            ).toString();
                        } else {
                            console.error('❌ File upload error: missing file ID');
                            toast.error('Failed to upload images. Please try again.');
                            setIsLoading(false);
                            return "";
                        }
                    });
                    console.log('✅ Images uploaded successfully');
                } catch (fileError: unknown) {
                    const appwriteError = fileError as AppwriteError;
                    console.error('❌ File upload error:', appwriteError);
                    toast.error('Failed to upload images. Please try again.');
                    setIsLoading(false);
                    return;
                }
            }            // Update the productData object with the exact category ID and name from CATEGORIES
            const category = CATEGORIES.find(cat => cat.id === selectedCategory);
            if (!category) {
                toast.error('Invalid category selected');
                setIsLoading(false);
                return;
            }
            const productData = {
                name: data.name,
                price: data.price,
                description: data.description,
                category: selectedCategory || editingProduct?.category || "beauty-equipment", // Ensure we have a valid category ID
                imageUrls: imageUrls.length > 0 ? imageUrls : (editingProduct?.imageUrls || []),
            };

            console.log('📦 Final product data being sent to Appwrite:', productData);

            if (editingProduct) {
                try {
                    console.log('📝 Updating existing product...');
                    await databases.updateDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.productsCollectionId,
                        editingProduct.$id,
                        productData
                    );
                    console.log('✅ Product updated successfully');
                    toast.success('Product updated successfully');
                } catch (updateError: unknown) {
                    const appwriteError = updateError as AppwriteError;
                    console.error('❌ Product update error:', appwriteError);
                    toast.error('Failed to update product. Please try again.');
                    setIsLoading(false);
                    return;
                }
            } else {
                try {
                    console.log('📝 Creating new product...');
                    const newProduct = await databases.createDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.productsCollectionId,
                        ID.unique(),
                        productData
                    );
                    console.log('✅ Product created successfully:', newProduct);
                    toast.success('Product created successfully');
                    clearForm(); // Clear all fields after successful creation
                } catch (createError: unknown) {
                    const appwriteError = createError as AppwriteError;
                    console.error('❌ Product creation error:', appwriteError);
                    toast.error('Failed to create product. Please try again.');
                    setIsLoading(false);
                    return;
                }
            }

            // Reset form and state after successful submission
            setSelectedCategory(null);
            reset();
            setSelectedFiles([]);
            setEditingProduct(null);
            await fetchProducts();
        } catch (error: unknown) {
            const appwriteError = error as AppwriteError;
            console.error('❌ General error:', appwriteError);
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle file validation for image uploads
    const validateFiles = (files: File[]): File[] => {
        // Filter for image files only
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        // Check if any files were filtered out
        if (imageFiles.length < files.length) {
            toast.error('Only image files are allowed');
        }

        // Check file sizes (max 10MB)
        const validSizeFiles = imageFiles.filter(file => {
            const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
            if (!isValidSize) {
                toast.error(`File "${file.name}" exceeds 10MB limit`);
            }
            return isValidSize;
        });

        // Limit to 3 images total
        const totalFiles = [...selectedFiles, ...validSizeFiles].slice(0, 3);

        // Show warning if files were truncated
        if (selectedFiles.length + validSizeFiles.length > 3) {
            toast.error('Maximum 3 images allowed');
        }

        return totalFiles;
    };

    // Handle product deletion
    const confirmDelete = async () => {
        if (showDeleteModal) {
            try {
                await databases.deleteDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.productsCollectionId,
                    showDeleteModal
                );
                toast.success('Product deleted successfully');
                setShowDeleteModal(null);
                await fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error('Failed to delete product');
            }
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        reset({
            name: product.name,
            price: product.price,
            description: product.description,
        });
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleNextImage = () => {
        if (showImageModal && products.length > 0) {
            const product = products.find(p => p.imageUrls.includes(showImageModal));
            if (product) {
                const nextIndex = (currentImageIndex + 1) % product.imageUrls.length;
                setCurrentImageIndex(nextIndex);
                setShowImageModal(product.imageUrls[nextIndex]);
            }
        }
    };

    const handlePrevImage = () => {
        if (showImageModal && products.length > 0) {
            const product = products.find(p => p.imageUrls.includes(showImageModal));
            if (product) {
                const prevIndex = (currentImageIndex - 1 + product.imageUrls.length) % product.imageUrls.length;
                setCurrentImageIndex(prevIndex);
                setShowImageModal(product.imageUrls[prevIndex]);
            }
        }
    };

    // Swipe handlers for image navigation
    // Not used in the current implementation

    const handleCategorySelect = (categoryId: string) => {
        // Only allow selection from predefined CATEGORIES
        const validCategory = CATEGORIES.find(cat => cat.id === categoryId);
        if (validCategory) {
            setSelectedCategory(prevCategory => prevCategory === categoryId ? null : categoryId);
            const updatedFormData = getValues();
            reset({ ...updatedFormData, category: categoryId }); // Use the category ID directly
        } else {
            console.error('Invalid category ID selected:', categoryId);
            toast.error('Invalid category selected');
        }
    };// No longer needed as we're using fixed categories
    const handleAddCategory = () => { };    // No longer needed as we're using fixed categories
    // Category deletion is not implemented as we're using fixed categories
    const confirmCategoryDelete = () => { };

    // Bulk delete all products
    const bulkDeleteProducts = async () => {
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
                    appwriteConfig.productsCollectionId,
                    product.$id
                );
            }

            toast.success('All products deleted successfully');
            await fetchProducts(); // Refresh the products list
        } catch (error) {
            console.error('Error bulk deleting products:', error);
            toast.error('Failed to delete all products');
        } finally {
            setIsBulkDeleting(false);
            setShowBulkDeleteModal(false);
        }
    };

    // Delete selected products
    const deleteSelectedProducts = async () => {
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
                    appwriteConfig.productsCollectionId,
                    productId
                );
            }

            toast.success(`${totalSelected} product${totalSelected > 1 ? 's' : ''} deleted successfully`);
            setSelectedProducts([]); // Clear selection
            setIsMultiSelectMode(false); // Exit multi-select mode
            await fetchProducts(); // Refresh the products list
        } catch (error) {
            console.error('Error deleting selected products:', error);
            toast.error('Failed to delete selected products');
        } finally {
            setIsBulkDeleting(false);
            setShowBulkDeleteModal(false);
        }
    };    // Toggle product selection
    const toggleProductSelection = (productId: string) => {
        setSelectedProducts(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            } else {
                return [...prev, productId];
            }
        });
    };

    // Set authorized to true for now - auth check removed temporarily
    useEffect(() => {
        setIsAuthorized(true);
    }, []);

    const imageVariants: Variants = {
        initial: { opacity: 0, x: 100, position: "relative" },
        animate: { opacity: 1, x: 0, position: "relative" },
        exit: { opacity: 0, x: -100, position: "absolute" },
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-32 sm:pt-40 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
            {/* Loading screen for navigation - using LoadingScreen component for consistency */}
            {isNavigating && <LoadingScreen message="Loading Receipt Generator..." isFullScreen={true} />}
            {isStockNavigating && <LoadingScreen message="Loading Stock Manager..." isFullScreen={true} />}

            <div className="max-w-7xl mx-auto">
                {/* Back button with animation */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block mb-6"
                >
                    <Link
                        href="/"
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
                        Back to Home
                    </Link>
                </motion.div>

                {/* Navigation buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12">
                    <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 text-center sm:text-left tracking-tight">
                        Product Manager
                    </h1>
                    <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3 mt-4 sm:mt-0">
                        {/* Receipt Generator Button */}
                        <div className="relative w-full sm:w-auto">
                            <Link
                                href="/admin/receipt-sender"
                                className="w-full text-center px-5 py-3 rounded-lg transition-all duration-200
                                    flex items-center justify-center gap-2
                                    bg-[#333333] hover:bg-gray-800 active:bg-gray-700
                                    text-white font-medium"
                                style={{
                                    WebkitTapHighlightColor: 'transparent',
                                    touchAction: 'manipulation',
                                    userSelect: 'none'
                                }}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Receipt Generator</span>
                                </div>
                            </Link>
                        </div>

                        {/* Stock Manager Button */}
                        <div className="relative w-full sm:w-auto">
                            <Link
                                href="/admin/stock-manager"
                                className="w-full text-center px-5 py-3 rounded-lg transition-all duration-200
                                    flex items-center justify-center gap-2
                                    bg-[#333333] hover:bg-gray-800 active:bg-gray-700
                                    text-white font-medium"
                                style={{
                                    WebkitTapHighlightColor: 'transparent',
                                    touchAction: 'manipulation',
                                    userSelect: 'none'
                                }}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <span>Stock Manager</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div>
                    {/* Product Form */}
                    <div ref={formRef} className="bg-white p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg mb-8 sm:mb-12 transition-all duration-300 hover:shadow-xl">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                                <input
                                    type="text"
                                    {...register('name')}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200 text-gray-900 font-normal placeholder-gray-500"
                                    placeholder="Enter product name"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-2">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
                                <input
                                    type="text"
                                    {...register('price')}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200 text-gray-900 font-normal placeholder-gray-500"
                                    placeholder="Enter price"
                                />
                                {errors.price && (
                                    <p className="text-red-500 text-sm mt-2">{errors.price.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    {...register('description')}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200 text-gray-900 font-normal placeholder-gray-500 min-h-[120px]"
                                    placeholder="Enter product description"
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-2">{errors.description.message}</p>
                                )}
                            </div>

                            <div className="mt-4 sm:mt-8">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-4">Category</h3>
                                {categoriesLoading ? (
                                    <div className="flex justify-center items-center py-6">
                                        <div className="animate-pulse flex space-x-4">
                                            <div className="flex-1 space-y-4 py-1">
                                                <div className="h-10 bg-gray-200 rounded w-full"></div>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="h-20 bg-gray-200 rounded"></div>
                                                    <div className="h-20 bg-gray-200 rounded"></div>
                                                    <div className="h-20 bg-gray-200 rounded"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-3">                                        {CATEGORIES.map((category) => (
                                        <motion.div
                                            key={category.id}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`relative cursor-pointer p-2 sm:p-3 rounded-lg text-center transition-colors duration-200
                                                    ${selectedCategory === category.id
                                                    ? 'bg-black text-white'
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                                }
                                                `}
                                            onClick={() => handleCategorySelect(category.id)}
                                        >
                                            <div className="text-lg sm:text-2xl mb-1">{category.icon}</div>
                                            <div className="text-[10px] sm:text-sm font-medium">
                                                {category.name}
                                            </div>
                                        </motion.div>
                                    ))}
                                    </div>
                                )}
                                {showNewCategoryInput && (
                                    <div className="mt-4 space-y-4">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newCategory}
                                                onChange={(e) => setNewCategory(e.target.value)}
                                                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200 text-gray-900 font-normal placeholder-gray-500"
                                                placeholder="Enter new category name"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowIconSelector(!showIconSelector)}
                                                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                                            >
                                                <span className="text-2xl">{selectedIcon}</span>
                                            </button>
                                            <button
                                                onClick={handleAddCategory}
                                                className="bg-[#333333] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200"
                                            >
                                                Add
                                            </button>
                                        </div>

                                        {showIconSelector && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="p-3 border border-gray-200 rounded-lg bg-white shadow-lg"
                                            >
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-6 gap-2">
                                                        {AVAILABLE_ICONS.map((icon) => (
                                                            <button
                                                                key={icon}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedIcon(icon);
                                                                    setShowIconSelector(false);
                                                                    setShowCustomIconInput(false);
                                                                }}
                                                                className={`p-2 text-xl hover:bg-gray-100 rounded-lg transition-all duration-200 ${selectedIcon === icon ? 'bg-gray-100' : ''
                                                                    }`}
                                                            >
                                                                {icon}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="border-t border-gray-200 pt-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCustomIconInput(!showCustomIconInput)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                                        >
                                                            {showCustomIconInput ? 'Hide custom icon input' : 'Use custom emoji or icon'}
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showCustomIconInput ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                                            </svg>
                                                        </button>

                                                        {showCustomIconInput && (
                                                            <div className="mt-2">
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={customIcon}
                                                                        onChange={(e) => setCustomIcon(e.target.value)}
                                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                                        placeholder="Paste emoji or icon here"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (customIcon.trim()) {
                                                                                setSelectedIcon(customIcon);
                                                                                setShowIconSelector(false);
                                                                                setShowCustomIconInput(false);
                                                                            }
                                                                        }}
                                                                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
                                                                    >
                                                                        Use
                                                                    </button>
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    You can copy and paste any emoji or icon character
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Images</label>
                                <div className="mt-1 flex flex-col space-y-4">
                                    <div
                                        className={`flex justify-center px-4 sm:px-6 pt-4 pb-4 sm:pb-6 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer ${isDragging
                                            ? 'border-blue-500 bg-blue-50'
                                            : selectedFiles.length > 0
                                                ? 'border-green-500 hover:border-green-600'
                                                : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        onDragEnter={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsDragging(true);
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsDragging(true);
                                        }}
                                        onDragLeave={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsDragging(false);
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsDragging(false);

                                            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                                const droppedFiles = Array.from(e.dataTransfer.files);
                                                const validatedFiles = validateFiles(droppedFiles);

                                                if (validatedFiles.length > selectedFiles.length) {
                                                    setSelectedFiles(validatedFiles);
                                                    const newFilesCount = validatedFiles.length - selectedFiles.length;
                                                    toast.success(`${newFilesCount} image${newFilesCount > 1 ? 's' : ''} added`);
                                                }
                                            }
                                        }}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="space-y-1 text-center">
                                            <svg className={`mx-auto h-10 w-10 sm:h-12 sm:w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex flex-col items-center">
                                                <input
                                                    type="file"
                                                    multiple
                                                    ref={fileInputRef}
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files.length > 0) {
                                                            const selectedInputFiles = Array.from(e.target.files);
                                                            const validatedFiles = validateFiles(selectedInputFiles);

                                                            if (validatedFiles.length > selectedFiles.length) {
                                                                setSelectedFiles(validatedFiles);
                                                                const newFilesCount = validatedFiles.length - selectedFiles.length;
                                                                toast.success(`${newFilesCount} image${newFilesCount > 1 ? 's' : ''} selected`);
                                                            }
                                                        }
                                                    }}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                                <button
                                                    type="button"
                                                    className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        fileInputRef.current?.click();
                                                    }}
                                                >
                                                    Click to upload
                                                </button>
                                                <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB (Max 3 images)</p>
                                            {selectedFiles.length > 0 && (
                                                <p className="text-xs font-medium text-green-600 mt-2">
                                                    {selectedFiles.length} image{selectedFiles.length > 1 ? 's' : ''} selected
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Selected Files Preview */}
                                    {selectedFiles.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                                                    <div className="relative h-24 sm:h-32 bg-gray-100">
                                                        <Image
                                                            src={URL.createObjectURL(file)}
                                                            alt={`Selected ${index + 1}`}
                                                            width={100}
                                                            height={100}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                                                    </div>
                                                    <div className="absolute top-2 right-2 flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                                                                toast.success('Image removed');
                                                            }}
                                                            className="bg-red-500 text-white rounded-full p-1.5 shadow-md transform scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300"
                                                            title="Remove image"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2 truncate">
                                                        {file.name}
                                                    </div>
                                                </div>
                                            ))}
                                            {selectedFiles.length < 3 && (
                                                <div
                                                    className="relative h-24 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-all duration-200"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <div className="text-center">
                                                        <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                        <p className="text-xs text-gray-500 mt-1">Add more</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full sm:flex-1 bg-[#333333] text-white px-4 sm:px-6 py-3 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {isLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                                </button>

                                {editingProduct && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingProduct(null);
                                            reset();
                                        }}
                                        className="w-full sm:flex-1 bg-gray-100 text-gray-700 px-4 sm:px-6 py-3 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Products List */}
                    <div className="bg-white p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Products List</h2>
                                <p className="text-gray-600">
                                    Total Products: <span className="font-semibold text-[#333333]">{products.length}</span>
                                    {isMultiSelectMode && (
                                        <span className="ml-2 text-blue-600">
                                            Selected: <span className="font-semibold">{selectedProducts.length}</span>
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
                                {/* Multi-select mode toggle */}
                                {products.length > 0 && (
                                    <button
                                        onClick={() => {
                                            setIsMultiSelectMode(!isMultiSelectMode);
                                            if (isMultiSelectMode) {
                                                setSelectedProducts([]);
                                            }
                                        }}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1
                                            ${isMultiSelectMode
                                                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        {isMultiSelectMode ? 'Exit Selection' : 'Select Multiple'}
                                    </button>
                                )}

                                {/* Delete Selected Button */}
                                {isMultiSelectMode && selectedProducts.length > 0 && (
                                    <button
                                        onClick={() => setShowBulkDeleteModal(true)}
                                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-all duration-200 flex items-center gap-1"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete Selected ({selectedProducts.length})
                                    </button>
                                )}

                                {/* Delete All Products Button */}
                                {products.length > 0 && !isMultiSelectMode && (
                                    <button
                                        onClick={() => {
                                            setSelectedProducts([]); // Clear any previous selection
                                            setShowBulkDeleteModal(true);
                                        }}
                                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-all duration-200 flex items-center gap-1"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete All
                                    </button>
                                )}

                                <div className="flex items-center gap-2 sm:gap-4">
                                    <label className="text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
                                    <select
                                        className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200"
                                        onChange={(e) => {
                                            const order = e.target.value === 'newest' ? 'desc' : 'asc';
                                            setSortOrder(order);
                                            fetchProducts();
                                        }}
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                    </select>
                                </div>

                                {/* Bulk Upload Products Button */}
                                <Link
                                    href="/admin/product-uploader"
                                    className="px-3 py-2 bg-gradient-to-r from-blue-600 to-pink-500 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all duration-200 flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    Bulk Upload
                                </Link>

                                {/* Update Products Button */}
                                <Link
                                    href="/admin/update-products"
                                    className="px-3 py-2 bg-gradient-to-r from-green-600 to-teal-500 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all duration-200 flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Update Categories
                                </Link>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                            {products.map((product) => (
                                <div
                                    key={product.$id}
                                    className={`bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border ${isMultiSelectMode && selectedProducts.includes(product.$id)
                                        ? 'border-blue-500 ring-2 ring-blue-200'
                                        : 'border-gray-100'
                                        }`}
                                    onClick={() => {
                                        if (isMultiSelectMode) {
                                            toggleProductSelection(product.$id);
                                        }
                                    }}
                                >
                                    {product.imageUrls && product.imageUrls.length > 0 && (
                                        <div className="relative h-48 sm:h-64 overflow-hidden">
                                            {product.imageUrls.length > 0 && (
                                                <Image
                                                    src={product.imageUrls[0]}
                                                    alt={`${product.name} 1`}
                                                    width={100}
                                                    height={100}
                                                    className="w-full h-full object-cover cursor-pointer"
                                                    onClick={() => {
                                                        setCurrentImageIndex(0);
                                                        setShowImageModal(product.imageUrls[0]);
                                                    }}
                                                />
                                            )}
                                            {product.imageUrls.length > 1 && (
                                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                                                    {product.imageUrls.length} images
                                                </div>
                                            )}
                                        </div>
                                    )}                                    <div className="p-4 sm:p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                                                <p className="text-sm font-medium text-gray-700">
                                                    {CATEGORIES.find(cat => cat.id === product.category)?.name || 'No category'}
                                                </p>
                                            </div>
                                            {isMultiSelectMode && (
                                                <div
                                                    className={`w-5 h-5 rounded border flex items-center justify-center ${selectedProducts.includes(product.$id)
                                                        ? 'bg-blue-500 border-blue-500'
                                                        : 'border-gray-300'
                                                        }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleProductSelection(product.$id);
                                                    }}
                                                >
                                                    {selectedProducts.includes(product.$id) && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">₦{product.price}</p>
                                        <p className="text-gray-600 mb-4 sm:mb-6 line-clamp-2">{product.description}</p>
                                        <div className="flex gap-2 sm:gap-3">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="flex-1 bg-[#333333] text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteModal(product.$id)}
                                                className="flex-1 bg-red-50 text-red-600 px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-all duration-200"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {showImageModal && (
                        <motion.div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-[90%] sm:max-w-[80%] lg:max-w-[60%] max-h-[calc(100vh-60px)] overflow-auto relative">
                                <AnimatePresence initial={false} custom={currentImageIndex}>
                                    <motion.div
                                        key={showImageModal}
                                        variants={imageVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                        className="w-full h-auto object-contain"
                                    >                                    {showImageModal && (
                                        <Image
                                            src={showImageModal}
                                            alt="Product"
                                            width={100}
                                            height={100}
                                            className="w-full h-auto object-contain"
                                        />
                                    )}
                                    </motion.div>
                                </AnimatePresence>
                                <button
                                    className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-all duration-200"
                                    onClick={handlePrevImage}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-all duration-200"
                                    onClick={handleNextImage}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showDeleteModal && (
                        <motion.div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <motion.div
                                className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-sm"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h2>
                                <p className="text-gray-600 mb-6">Are you sure you want to delete this product?</p>
                                <div className="flex justify-end gap-4">
                                    <button
                                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
                                        onClick={() => setShowDeleteModal(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-all duration-200"
                                        onClick={confirmDelete}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Category Delete Confirmation Modal */}
                <AnimatePresence>
                    {showCategoryDeleteModal && (
                        <motion.div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <motion.div
                                className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-sm"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete Category</h2>
                                <p className="text-gray-600 mb-2">Are you sure you want to delete this category?</p>
                                <p className="text-red-600 text-sm mb-6">This action cannot be undone and may affect products using this category.</p>
                                <div className="flex justify-end gap-4">
                                    <button
                                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
                                        onClick={() => setShowCategoryDeleteModal(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-all duration-200"
                                        onClick={confirmCategoryDelete}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bulk Delete Products Confirmation Modal */}
                <AnimatePresence>
                    {showBulkDeleteModal && (
                        <motion.div
                            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isBulkDeleting && setShowBulkDeleteModal(false)}
                        >
                            <motion.div
                                className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-md"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {isBulkDeleting ? (
                                    <div className="flex flex-col items-center py-4">
                                        <SpinningLoader size="large" />
                                        <p className="mt-4 text-gray-800 font-medium">
                                            Deleting products... ({bulkDeleteProgress.current} of {bulkDeleteProgress.total})
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
                                            {selectedProducts.length > 0 ? 'Delete Selected Products' : 'Delete All Products'}
                                        </h2>
                                        <p className="text-gray-600 mb-2">
                                            {selectedProducts.length > 0
                                                ? 'Are you sure you want to delete the selected products?'
                                                : 'Are you sure you want to delete all products?'
                                            }
                                        </p>
                                        <p className="text-red-600 text-sm mb-6">
                                            This will delete <span className="font-bold">
                                                {selectedProducts.length > 0 ? selectedProducts.length : products.length}
                                                product{(selectedProducts.length > 0 ? selectedProducts.length : products.length) !== 1 ? 's' : ''}
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
                                                onClick={selectedProducts.length > 0 ? deleteSelectedProducts : bulkDeleteProducts}
                                            >
                                                {selectedProducts.length > 0 ? 'Delete Selected' : 'Delete All'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminPage;
