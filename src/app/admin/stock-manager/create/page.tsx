"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import LoadingScreen from '@/src/app/Components/LoadingScreen';
import SpinningLoader from '@/src/app/Components/SpinningLoader';
import { databases, appwriteConfig } from '@/src/lib/appwrite';
import { ID } from 'appwrite';

// Define stock product categories
const STOCK_CATEGORIES = [
    {
        id: "spa-salon-furniture",
        name: "Spa and Salon Furnitures",
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
        name: "Facials and Waxing",
        icon: "🧖‍♀️",
        color: "from-purple-500 to-purple-700",
    },
    {
        id: "skincare-accessories",
        name: "Skincare Products & Accessories",
        icon: "🧴",
        color: "from-green-500 to-green-700",
    },
    {
        id: "pedicure-manicure",
        name: "Pedicure and Manicure",
        icon: "💅",
        color: "from-yellow-500 to-yellow-700",
    },
];

// Schema for stock product form validation
const stockProductSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    initialStock: z.string().min(1, "Initial stock is required"),
    category: z.string().min(1, "Category is required"),
    remarks: z.string().optional(),
});

type StockProductFormData = z.infer<typeof stockProductSchema>;

// Interface for stock movement data
interface StockMovement {
    date: string;
    stockedIn: number;
    stockedOut: number;
    remarks: string;
    totalStock: number;
    balance: number;
}

const CreateStockProductPage = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const formRef = useRef<HTMLDivElement>(null);

    // Form setup using react-hook-form with Zod validation
    const { register, handleSubmit, formState: { errors } } = useForm<StockProductFormData>({
        resolver: zodResolver(stockProductSchema),
        defaultValues: {
            name: '',
            initialStock: '0',
            category: '',
            remarks: '',
        }
    });

    // Handle form submission
    // Function to test Appwrite connection and verify collection exists
    const testAppwriteConnection = async () => {
        try {
            console.log('Testing Appwrite connection with:');
            console.log('- Project ID:', '67d07dc9000bafdd5d81', '(confirmed correct)');
            console.log('- Database ID:', appwriteConfig.databaseId, '(6813eadb003e7d64f63c)');
            console.log('- Collection ID:', appwriteConfig.stockProductsCollectionId, '(681a651d001cc3de8395)');

            // Try to list documents to test the connection
            try {
                const response = await databases.listDocuments(
                    appwriteConfig.databaseId,
                    appwriteConfig.stockProductsCollectionId,
                    // Using the correct query format
                    []
                );
                console.log('Appwrite connection test successful:', response);
                return true;
            } catch (listError: unknown) {
                const error = listError as { code?: number; message?: string };
                // If the error is that the collection doesn't exist (404)
                if (error.code === 404) {
                    console.log('Collection not found. This is expected for a new collection.');
                    return true; // We can still proceed if the collection doesn't exist yet
                }

                // For other errors, log and return false
                console.error('Error listing documents:', listError);
                if (error.message) {
                    console.error('Error message:', error.message);
                }
                if (error.code) {
                    console.error('Error code:', error.code);
                }
                return false;
            }
        } catch (err: unknown) {
            const error = err as { code?: number; message?: string };
            console.error('Appwrite connection test failed:', err);
            if (error.message) {
                console.error('Error message:', error.message);
            }
            if (error.code) {
                console.error('Error code:', error.code);
            }
            return false;
        }
    };

    const onSubmit = async (data: StockProductFormData) => {
        try {
            setIsSubmitting(true);

            // Test Appwrite connection first
            const connectionOk = await testAppwriteConnection();
            if (!connectionOk) {
                toast.error('Could not connect to Appwrite. Please check your connection and permissions.');
                setIsSubmitting(false);
                return;
            }

            // Create initial stock movement
            const initialStockMovement: StockMovement = {
                date: new Date().toISOString(),
                stockedIn: parseInt(data.initialStock),
                stockedOut: 0,
                remarks: data.remarks || 'Initial stock',
                totalStock: parseInt(data.initialStock),
                balance: parseInt(data.initialStock),
            };

            // Convert the stock movement to a string
            const stockMovementString = JSON.stringify(initialStockMovement);

            // Prepare stock product data for Appwrite
            // The collection expects an array of strings
            const stockProductData = {
                name: data.name,
                category: data.category,
                stockMovements: [stockMovementString], // Array of strings
                lastUpdated: new Date().toISOString(),
            };

            // Create stock product in Appwrite
            try {
                // Log the data we're sending to Appwrite for debugging
                console.log('Sending to Appwrite:', {
                    databaseId: appwriteConfig.databaseId,
                    collectionId: appwriteConfig.stockProductsCollectionId,
                    data: stockProductData
                });

                // Generate a unique ID
                const documentId = ID.unique();
                console.log('Generated document ID:', documentId);

                // Format the data for Appwrite
                const formattedData = {
                    name: String(stockProductData.name),
                    category: String(stockProductData.category),
                    stockMovements: stockProductData.stockMovements, // Keep as array
                    lastUpdated: String(stockProductData.lastUpdated)
                };

                console.log('Formatted data:', formattedData);

                // Create the document
                const newStockProduct = await databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.stockProductsCollectionId,
                    documentId,
                    formattedData
                );

                console.log('Stock product created successfully:', newStockProduct);
            } catch (err: unknown) {
                const error = err as { code?: number; message?: string; response?: unknown };
                // More detailed error logging
                console.error('Error creating stock product in Appwrite:', err);

                // Log specific error details if available
                if (error.message) {
                    console.error('Error message:', error.message);
                }
                if (error.code) {
                    console.error('Error code:', error.code);
                }
                if (error.response) {
                    console.error('Error response:', error.response);
                }

                // Show a more specific error message to the user
                toast.error(`Failed to create stock product: ${error.message || 'Unknown error'}`);
                throw err; // Re-throw to be caught by the outer try-catch
            }

            toast.success('Stock product created successfully');

            // Navigate back to stock manager page after a short delay
            setTimeout(() => {
                setIsNavigating(true);
                router.push('/admin/stock-manager');
            }, 1000);
        } catch (err: unknown) {
            const error = err as { message?: string };
            console.error('Error creating stock product:', err);

            // We already show a specific error message from the inner catch block
            // This is just a fallback in case the error wasn't caught there
            if (!error.message || error.message === 'Unknown error') {
                toast.error('Failed to create stock product. Please check the console for details.');
            }

            setIsSubmitting(false);
        }
    };

    if (isNavigating) {
        return <LoadingScreen message="Redirecting to stock manager..." />;
    }

    return (
        <div className="p-4 max-w-7xl mt-28 sm:mt-32 md:mt-40 mx-auto pt-8 sm:pt-10">
            {/* Back button with animation - improved for mobile */}
            <div className="mb-6">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        // Create a direct navigation function
                        const navigateDirectly = () => {
                            window.location.href = '/admin/stock-manager';
                        };

                        // Navigate immediately
                        navigateDirectly();
                    }}
                    className="inline-flex items-center px-4 py-3 rounded-lg text-gray-700 hover:text-black hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 touch-manipulation"
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
                </button>
            </div>

            <div className="mb-6">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent flex items-center">
                    <span className="text-gray-900 mr-2 inline-block">🆕</span>
                    Create New Stock Product
                </h1>
                <p className="text-gray-700 mt-1 text-lg">Add a new product to your inventory</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                <div ref={formRef}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Product Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-1">
                                Product Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                {...register('name')}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 font-medium placeholder-gray-500"
                                placeholder="e.g. Salon Chair"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Initial Stock */}
                        <div>
                            <label htmlFor="initialStock" className="block text-sm font-medium text-gray-800 mb-1">
                                Initial Stock Quantity
                            </label>
                            <input
                                id="initialStock"
                                type="number"
                                min="0"
                                {...register('initialStock')}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 font-medium placeholder-gray-500"
                                placeholder="0"
                            />
                            {errors.initialStock && (
                                <p className="mt-1 text-sm text-red-600">{errors.initialStock.message}</p>
                            )}
                        </div>

                        {/* Category Selection */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-800 mb-1">
                                Product Category
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-3">
                                {STOCK_CATEGORIES.map((category) => (
                                    <label
                                        key={category.id}
                                        className="cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            value={category.id}
                                            {...register('category')}
                                            className="sr-only"
                                            onChange={() => setSelectedCategory(category.id)}
                                        />
                                        <div className={`p-3 rounded-lg text-center transition-all duration-200 shadow-sm
                                            ${errors.category ? 'border-red-500' : 'border border-gray-200'}
                                            hover:border-blue-500
                                            ${selectedCategory === category.id ? 'bg-gradient-to-br ' + category.color + ' text-white' : 'bg-white'}`}
                                        >
                                            <div className="text-2xl mb-1">{category.icon}</div>
                                            <div className="text-xs font-medium line-clamp-2">
                                                {category.name}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                            )}
                        </div>

                        {/* Remarks */}
                        <div>
                            <label htmlFor="remarks" className="block text-sm font-medium text-gray-800 mb-1">
                                Remarks (Optional)
                            </label>
                            <textarea
                                id="remarks"
                                {...register('remarks')}
                                rows={3}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-800 font-medium placeholder-gray-500"
                                placeholder="Any additional notes about this stock"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`bg-gradient-to-r from-[#1E90FF] to-[#FF69B4] text-white px-6 py-2 rounded-lg font-medium hover:shadow-md transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center">
                                        <SpinningLoader size="small" className="mr-2" />
                                        <span>Creating...</span>
                                    </div>
                                ) : (
                                    'Create Stock Product'
                                )}
                            </motion.button>
                        </div>
                    </form>
                </div>
            </div >
        </div >
    );
};

export default CreateStockProductPage;