"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { databases, storage, appwriteConfig } from '../../lib/appwrite';
import { ID, Query } from 'appwrite';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { COLORS } from '../../data/colors';
import type { Variants } from 'framer-motion';
import Image from 'next/image';
import { CATEGORIES } from '@/src/data/categories'


// Schema for product form validation using Zod
const productSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    price: z.string().min(1, "Price is required"),
    description: z.string().min(1, "Description is required"),
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
}

// Interface for
interface ProductFormData {
    name: string;
    price: string;
    description: string;
    category?: string;
}

const AdminPage = () => {
    // Router for navigation
    const router = useRouter();

    // State management
    const [isAuthorized, setIsAuthorized] = useState(false);        // Authorization status
    const [products, setProducts] = useState<Product[]>([]);         // List of products
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);  // Selected image files
    const [isLoading, setIsLoading] = useState(false);              // Loading state
    const [editingProduct, setEditingProduct] = useState<Product | null>(null); // Currently editing product
    const [showImageModal, setShowImageModal] = useState<string | null>(null);  // Image modal visibility
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');        // Sort order for products
    const [currentImageIndex, setCurrentImageIndex] = useState(0);             // Current image index in modal
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null); // Delete confirmation modal
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Selected category

    // Ref for form scrolling
    const formRef = useRef<HTMLDivElement>(null);

    // Form setup using react-hook-form with Zod validation
    const { register, handleSubmit, reset, formState: { errors }, getValues } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema)
    });

    // Fetch products from Appwrite database
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

    // Check authorization on component mount
    useEffect(() => {
        const checkAuth = async () => {
            const adminKey = localStorage.getItem('adminKey');
            if (adminKey !== 'fugo101') {
                router.push('/');
                return;
            }
            setIsAuthorized(true);
            await fetchProducts();
        };

        checkAuth();
    }, [router, fetchProducts]);

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
            }

            // Update the productData object to correctly include the category
            const productData = {
                name: data.name,
                price: data.price,
                description: data.description,
                // Get the category name instead of the ID
                category: CATEGORIES.find(cat => cat.id === selectedCategory)?.name || '',
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

    const swipeHandlers = useSwipeable({
        onSwipedLeft: handleNextImage,
        onSwipedRight: handlePrevImage,
        trackMouse: true
    });

    const handleColorClick = (colorName: string, event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        reset({ description: colorName });
    };

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(prevCategory => prevCategory === categoryId ? null : categoryId);
        // Update the form data
        const category = CATEGORIES.find(cat => cat.id === categoryId)?.name || '';
        reset({ ...getValues(), description: getValues().description, category });
    };

    if (!isAuthorized) {
        return null; // or return a loading state
    }

    const imageVariants: Variants = {
        initial: { opacity: 0, x: 100, position: "relative" },
        animate: { opacity: 1, x: 0, position: "relative" },
        exit: { opacity: 0, x: -100, position: "absolute" },
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-32 sm:pt-40 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-8 sm:mb-12 text-center tracking-tight">
                    Product Management
                </h1>

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
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Colour</label>
                            <textarea
                                {...register('description')}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200 text-gray-900 font-normal placeholder-gray-500 min-h-[120px]"
                                placeholder="Enter product description"
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-2">{errors.description.message}</p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">
                                {COLORS.map((color) => (
                                    <motion.button
                                        key={color.id}
                                        onClick={(e) => handleColorClick(color.name, e)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium 
                                        transition-all duration-200
                                          ${color.id === 'mixed'
                                                ? 'bg-gradient-to-r from-pink-300 via-purple-300 via-blue-300 via-green-300 via-yellow-300 to-red-300 text-black'
                                                : ''
                                            }
                                        `}
                                        style={{
                                            backgroundColor: color.id !== 'mixed' ? color.hex : undefined,
                                            color: ['black', 'burgundy', 'brown'].includes(color.id) ? 'white' : 'black',
                                        }}
                                    >
                                        {color.name}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 sm:mt-8">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-4">Category</h3>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-3">
                                {CATEGORIES.map((category) => (
                                    <motion.div
                                        key={category.id}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => handleCategorySelect(category.id)}
                                        className={`cursor-pointer p-2 sm:p-3 rounded-lg text-center transition-colors duration-200
                                            ${selectedCategory === category.id
                                                ? 'bg-black text-white'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                            }
                                        `}
                                    >
                                        <div className="text-lg sm:text-2xl mb-1">{category.icon}</div>
                                        <div className="text-[10px] sm:text-sm font-medium">
                                            {category.name}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Images</label>
                            <div className="mt-1 flex flex-col space-y-4">
                                <div className="flex justify-center px-4 sm:px-6 pt-4 pb-4 sm:pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-all duration-200">
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <input
                                                type="file"
                                                multiple
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    setSelectedFiles(files);
                                                }}
                                                className="relative w-full cursor-pointer rounded-md font-medium text-gray-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-gray-400 focus-within:ring-offset-2 hover:text-gray-800"
                                                accept="image/*"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB (Max 3 images)</p>
                                    </div>
                                </div>

                                {/* Selected Files Preview */}
                                {selectedFiles.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="relative group">
                                                <Image
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Selected ${index + 1}`}
                                                    width={100}
                                                    height={100}
                                                    className="w-full h-24 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
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
                            </p>
                        </div>
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
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {products.map((product) => (
                            <div key={product.$id} className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
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
                                )}
                                <div className="p-4 sm:p-6">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
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

            <AnimatePresence>
                {showImageModal && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowImageModal(null)}
                    >
                        <motion.div
                            className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-[90%] sm:max-w-[80%] lg:max-w-[60%] max-h-[calc(100vh-60px)] overflow-auto relative"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            onClick={(e) => e.stopPropagation()}
                            {...swipeHandlers}
                        >
                            <AnimatePresence initial={false} custom={currentImageIndex}>
                                <motion.div
                                    key={showImageModal}
                                    variants={imageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="w-full h-auto object-contain"
                                >
                                    <Image
                                        src={showImageModal}
                                        alt="Product"
                                        width={100}
                                        height={100}
                                        className="w-full h-auto object-contain"
                                    />
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteModal(null)}
                    >
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
        </div>
    );
};

export default AdminPage;
