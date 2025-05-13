"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import SpinningLoader from '@/src/app/Components/SpinningLoader';
import Script from 'next/script';
import { format, parseISO } from 'date-fns';
import { databases, appwriteConfig } from '@/src/lib/appwrite';

// Interface for stock movement data
interface StockMovement {
  date: string;
  stockedIn: number;
  stockedOut: number;
  remarks: string;
  totalStock: number;
  balance: number;
  sign?: string;
}

// Interface for stock product data
interface StockProduct {
  $id: string;
  name: string;
  stockMovements: StockMovement[];
  lastUpdated: string;
  $createdAt: string;
}

// Interface for form data
interface StockMovementFormData {
  date: string;
  stockedIn: number;
  stockedOut: number;
  remarks: string;
  sign: string;
}

// We'll use a type assertion in the function instead of declaring the global interface

const StockProductDetailPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [stockProduct, setStockProduct] = useState<StockProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddMovementForm, setShowAddMovementForm] = useState(false);
  const [newMovement, setNewMovement] = useState<StockMovementFormData>({
    date: new Date().toISOString().split('T')[0],
    stockedIn: 0,
    stockedOut: 0,
    remarks: '',
    sign: '',
  });
  const stockCardRef = useRef<HTMLDivElement>(null);

  // Fetch stock product data
  useEffect(() => {
    const fetchStockProduct = async () => {
      try {
        setLoading(true);

        try {
          const response = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.stockProductsCollectionId,
            params.id
          );

          const stockProductData = response as unknown as any;

          // Ensure stockMovements is an array
          if (!stockProductData.stockMovements) {
            stockProductData.stockMovements = [];
          }

          // Parse each stock movement from string to object
          const parsedStockMovements = stockProductData.stockMovements.map((movement: any) => {
            if (typeof movement === 'string') {
              try {
                return JSON.parse(movement);
              } catch (error) {
                console.error('Error parsing stock movement:', error);
                return null;
              }
            }
            return movement;
          }).filter(Boolean); // Remove any null values

          // Create a properly formatted StockProduct object
          const formattedStockProduct: StockProduct = {
            ...stockProductData,
            stockMovements: parsedStockMovements
          };

          setStockProduct(formattedStockProduct);
        } catch (error) {
          console.error("Error fetching stock product:", error);

          // Fallback to dummy data if there's an error
          const dummyStockMovements: StockMovement[] = [
            {
              date: "2023-05-01T12:00:00.000Z",
              stockedIn: 10,
              stockedOut: 0,
              remarks: "Initial stock",
              totalStock: 10,
              balance: 10,
              sign: "John Doe"
            },
            {
              date: "2023-05-10T14:30:00.000Z",
              stockedIn: 5,
              stockedOut: 0,
              remarks: "Restocked",
              totalStock: 15,
              balance: 15,
              sign: "Jane Smith"
            },
            {
              date: "2023-05-15T09:45:00.000Z",
              stockedIn: 0,
              stockedOut: 3,
              remarks: "Sold to customer",
              totalStock: 15,
              balance: 12,
              sign: "John Doe"
            }
          ];

          const dummyProduct: StockProduct = {
            $id: params.id,
            name: params.id === "1" ? "Salon Chair" : params.id === "2" ? "Hair Dryer" : "Facial Steamer",
            stockMovements: dummyStockMovements,
            lastUpdated: "2023-05-15T09:45:00.000Z",
            $createdAt: "2023-05-01T12:00:00.000Z"
          };

          setStockProduct(dummyProduct);
          throw error; // Re-throw to be caught by the outer try-catch
        }
      } catch (error) {
        console.error("Error fetching stock product:", error);
        toast.error("Failed to load stock product");
        router.push('/admin/stock-manager');
      } finally {
        setLoading(false);
      }
    };

    fetchStockProduct();
  }, [params.id, router]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMovement(prev => ({
      ...prev,
      [name]: name === 'stockedIn' || name === 'stockedOut' ? Number(value) : value
    }));
  };

  // Handle adding new stock movement
  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stockProduct) return;

    try {
      setIsSubmitting(true);

      // Calculate new totals
      const lastMovement = stockProduct.stockMovements[stockProduct.stockMovements.length - 1];
      const newTotalStock = lastMovement.totalStock + newMovement.stockedIn;
      const newBalance = newTotalStock - newMovement.stockedOut;

      // Create new stock movement
      const stockMovement: StockMovement = {
        date: new Date(newMovement.date).toISOString(),
        stockedIn: newMovement.stockedIn,
        stockedOut: newMovement.stockedOut,
        remarks: newMovement.remarks,
        totalStock: newTotalStock,
        balance: newBalance,
        sign: newMovement.sign
      };

      // Add to existing stock movements
      const updatedStockMovements = [...stockProduct.stockMovements, stockMovement];

      // Convert the new movement to a string
      const stockMovementString = JSON.stringify(stockMovement);

      // Get the current stockMovements array from Appwrite (as strings)
      let currentStockMovementsStrings: string[] = [];
      try {
        const currentDoc = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.stockProductsCollectionId,
          params.id
        );

        currentStockMovementsStrings = currentDoc.stockMovements || [];
      } catch (error) {
        console.error('Error fetching current stock movements:', error);
        currentStockMovementsStrings = [];
      }

      // Add the new movement string to the array
      const updatedStockMovementsStrings = [...currentStockMovementsStrings, stockMovementString];

      // Update stock product
      const updatedStockProduct = {
        ...stockProduct,
        stockMovements: updatedStockMovements,
        lastUpdated: new Date().toISOString()
      };

      try {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.stockProductsCollectionId,
          params.id,
          {
            stockMovements: updatedStockMovementsStrings, // Send array of strings
            lastUpdated: new Date().toISOString()
          }
        );
      } catch (error) {
        console.error('Error updating stock product in Appwrite:', error);
        throw error; // Re-throw to be caught by the outer try-catch
      }

      // Update local state
      setStockProduct(updatedStockProduct);

      // Reset form
      setNewMovement({
        date: new Date().toISOString().split('T')[0],
        stockedIn: 0,
        stockedOut: 0,
        remarks: '',
        sign: '',
      });

      setShowAddMovementForm(false);
      toast.success('Stock movement added successfully');
    } catch (error) {
      console.error('Error adding stock movement:', error);
      toast.error('Failed to add stock movement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting stock product
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      try {
        await databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.stockProductsCollectionId,
          params.id
        );
      } catch (error) {
        console.error('Error deleting stock product from Appwrite:', error);
        throw error; // Re-throw to be caught by the outer try-catch
      }

      toast.success('Stock product deleted successfully');

      // Navigate back to stock manager page
      router.push('/admin/stock-manager');
    } catch (error) {
      console.error('Error deleting stock product:', error);
      toast.error('Failed to delete stock product');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Generate and download PDF
  const downloadPDF = async () => {
    try {
      if (stockCardRef.current) {
        // Show loading toast
        toast.loading(
          <div className="flex items-center gap-2">
            <SpinningLoader size="small" />
            <span>Generating PDF...</span>
          </div>
        );

        // Use a timeout to ensure the UI updates before PDF generation
        await new Promise(resolve => setTimeout(resolve, 100));

        const element = stockCardRef.current;

        // Wait for fonts and images to load
        await document.fonts.ready;

        // Generate PDF with filename
        const filename = `Stock_Card_${stockProduct?.name.replace(/\s+/g, '_')}.pdf`;

        // Use any type to bypass TypeScript errors
        const html2pdf = window.html2pdf as any;
        const pdfInstance = html2pdf();

        // Configure and generate PDF
        pdfInstance.set({
          margin: [10, 10, 10, 10],
          filename: filename,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        });

        await pdfInstance.from(element).save();

        toast.dismiss();
        toast.success('PDF downloaded successfully');
      } else {
        toast.error('PDF generation not available');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss();
      toast.error('Failed to generate PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SpinningLoader size="large" text="Loading stock product..." />
      </div>
    );
  }

  if (!stockProduct) {
    return (
      <div className="p-4 max-w-7xl mt-28 sm:mt-32 md:mt-40 mx-auto pt-8 sm:pt-10">
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Stock Product Not Found</h2>
          <p className="text-gray-700 mb-4">The stock product you're looking for doesn't exist or has been deleted.</p>
          <Link
            href="/admin/stock-manager"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
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
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mt-28 sm:mt-32 md:mt-40 mx-auto pt-8 sm:pt-10">
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" />

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent flex items-center">
            <span className="text-gray-900 mr-2 inline-block">📋</span>
            {stockProduct.name}
          </h1>
          <p className="text-gray-700 mt-1 text-lg">
            Created: <span className="font-medium">{format(parseISO(stockProduct.$createdAt), "MMM dd, yyyy")}</span> | Last Updated: <span className="font-medium">{format(parseISO(stockProduct.lastUpdated), "MMM dd, yyyy")}</span>
          </p>
        </div>

        <div className="flex gap-2 mt-4 sm:mt-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={downloadPDF}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-all"
          >
            Download PDF
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-all"
          >
            Delete
          </motion.button>
        </div>
      </div>

      {/* Stock Card */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div ref={stockCardRef} className="p-4">
          <div className="mb-6">
            <div className="flex items-center justify-center mb-2">
              <div className="flex items-center">
                <img
                  src="/logo.png"
                  alt="Cepoka Logo"
                  className="h-20 w-20 mr-5 object-contain drop-shadow-md"
                />
                <div>
                  <h2 className="text-3xl font-bold uppercase bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">CEPOKA BEAUTY HUB</h2>
                  <h3 className="text-xl font-semibold text-gray-900">STOCK CARD</h3>
                </div>
              </div>
            </div>
            <div className="border-t border-b border-gray-300 py-3 my-4">
              <p className="text-gray-900 font-bold text-center text-2xl">
                Product: <span className="text-gray-900 font-extrabold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">{stockProduct.name}</span>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 shadow-md">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-gray-900 font-semibold">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-gray-900 font-semibold">Qty</th>
                  <th className="border border-gray-300 px-4 py-2 text-gray-900 font-semibold">Stocked In</th>
                  <th className="border border-gray-300 px-4 py-2 text-gray-900 font-semibold">Total Stock</th>
                  <th className="border border-gray-300 px-4 py-2 text-gray-900 font-semibold">Stocked Out</th>
                  <th className="border border-gray-300 px-4 py-2 text-gray-900 font-semibold">Balance</th>
                  <th className="border border-gray-300 px-4 py-2 text-gray-900 font-semibold">Remarks</th>
                  <th className="border border-gray-300 px-4 py-2 text-gray-900 font-semibold">Sign</th>
                </tr>
              </thead>
              <tbody>
                {stockProduct.stockMovements.map((movement, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-2 text-gray-800 font-medium">{format(parseISO(movement.date), "MMM dd, yyyy")}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-800">
                      {movement.stockedIn > 0 ? movement.stockedIn : movement.stockedOut}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-800">
                      {movement.stockedIn > 0 ? movement.stockedIn : '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-800 font-medium">{movement.totalStock}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-800">
                      {movement.stockedOut > 0 ? movement.stockedOut : '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-800 font-medium">{movement.balance}</td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-800">{movement.remarks}</td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-800">{movement.sign || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Movement Button */}
      <div className="mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddMovementForm(!showAddMovementForm)}
          className="bg-gradient-to-r from-[#1E90FF] to-[#FF69B4] text-white px-4 py-2 rounded-lg font-medium hover:shadow-md transition-all"
        >
          {showAddMovementForm ? 'Cancel' : 'Add Stock Movement'}
        </motion.button>
      </div>

      {/* Add Movement Form */}
      {showAddMovementForm && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Stock Movement</h3>

          <form onSubmit={handleAddMovement} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-800 mb-1">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={newMovement.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Stocked In */}
              <div>
                <label htmlFor="stockedIn" className="block text-sm font-medium text-gray-800 mb-1">
                  Stocked In
                </label>
                <input
                  id="stockedIn"
                  type="number"
                  name="stockedIn"
                  min="0"
                  value={newMovement.stockedIn}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Stocked Out */}
              <div>
                <label htmlFor="stockedOut" className="block text-sm font-medium text-gray-800 mb-1">
                  Stocked Out
                </label>
                <input
                  id="stockedOut"
                  type="number"
                  name="stockedOut"
                  min="0"
                  value={newMovement.stockedOut}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Sign */}
              <div>
                <label htmlFor="sign" className="block text-sm font-medium text-gray-800 mb-1">
                  Sign
                </label>
                <input
                  id="sign"
                  type="text"
                  name="sign"
                  value={newMovement.sign}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your name"
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-800 mb-1">
                Remarks
              </label>
              <textarea
                id="remarks"
                name="remarks"
                rows={2}
                value={newMovement.remarks}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional notes about this movement"
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
                    <span>Adding...</span>
                  </div>
                ) : (
                  'Add Movement'
                )}
              </motion.button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Stock Product</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">{stockProduct.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <SpinningLoader size="small" className="mr-2" />
                    <span>Deleting...</span>
                  </div>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockProductDetailPage;
