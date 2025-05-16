"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  id?: string; // Unique identifier for each movement
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

const StockProductDetailPage = ({ params }: { params: Promise<{ id: string }> | { id: string } }) => {
  // Unwrap params using React.use() to support future Next.js versions
  const unwrappedParams = params instanceof Promise ? React.use(params) : params;
  const productId = unwrappedParams.id;

  const router = useRouter();
  const [stockProduct, setStockProduct] = useState<StockProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddMovementForm, setShowAddMovementForm] = useState(false);
  const [editingMovementId, setEditingMovementId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newMovement, setNewMovement] = useState<StockMovementFormData>({
    date: new Date().toISOString().split('T')[0],
    stockedIn: 0,
    stockedOut: 0,
    remarks: '',
    sign: '',
  });
  const [editedMovement, setEditedMovement] = useState<StockMovement | null>(null);
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
            productId
          );

          const stockProductData = response as unknown as Record<string, unknown>;

          // Ensure stockMovements is an array
          if (!stockProductData.stockMovements) {
            stockProductData.stockMovements = [];
          }

          // Parse each stock movement from string to object
          const stockMovementsArray = Array.isArray(stockProductData.stockMovements)
            ? stockProductData.stockMovements as (string | Record<string, unknown>)[]
            : [];

          const parsedStockMovements = stockMovementsArray.map((movement, index: number) => {
            if (typeof movement === 'string') {
              try {
                const parsedMovement = JSON.parse(movement);
                // Add a unique ID to each movement for editing purposes
                return { ...parsedMovement, id: `movement-${index}` };
              } catch (error) {
                console.error('Error parsing stock movement:', error);
                return null;
              }
            }
            // Add ID to existing object movements too
            return { ...movement, id: `movement-${index}` };
          }).filter(Boolean); // Remove any null values

          // Create a properly formatted StockProduct object
          const formattedStockProduct: StockProduct = {
            $id: (stockProductData.$id as string) || productId,
            name: (stockProductData.name as string) || 'Unknown Product',
            $createdAt: (stockProductData.$createdAt as string) || new Date().toISOString(),
            lastUpdated: (stockProductData.lastUpdated as string) || new Date().toISOString(),
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
            $id: productId,
            name: productId === "1" ? "Salon Chair" : productId === "2" ? "Hair Dryer" : "Facial Steamer",
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
  }, [productId, router]);

  // Handle form input changes for new movement
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMovement(prev => ({
      ...prev,
      [name]: name === 'stockedIn' || name === 'stockedOut' ? Number(value) : value
    }));
  };

  // Handle form input changes for edited movement
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editedMovement) return;

    const { name, value } = e.target;
    setEditedMovement(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: name === 'stockedIn' || name === 'stockedOut' ? Number(value) : value
      };
    });
  };

  // Start editing a movement
  const startEditingMovement = (movement: StockMovement) => {
    setEditingMovementId(movement.id || null);
    setEditedMovement({ ...movement });
    setShowAddMovementForm(false); // Close add form if open
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingMovementId(null);
    setEditedMovement(null);
  };

  // Save edited movement
  const saveEditedMovement = async () => {
    if (!stockProduct || !editedMovement || !editingMovementId) return;

    try {
      setIsUpdating(true);

      // Find the index of the movement being edited
      const movementIndex = stockProduct.stockMovements.findIndex(m => m.id === editingMovementId);
      if (movementIndex === -1) {
        throw new Error('Movement not found');
      }

      // Create updated movements array
      const updatedMovements = [...stockProduct.stockMovements];
      updatedMovements[movementIndex] = editedMovement;

      // Recalculate totals and balances for all movements after the edited one
      for (let i = movementIndex; i < updatedMovements.length; i++) {
        if (i === 0) {
          // First movement
          updatedMovements[i].totalStock = updatedMovements[i].stockedIn;
          updatedMovements[i].balance = updatedMovements[i].totalStock - updatedMovements[i].stockedOut;
        } else {
          // Subsequent movements
          const prevMovement = updatedMovements[i - 1];
          updatedMovements[i].totalStock = prevMovement.balance + updatedMovements[i].stockedIn;
          updatedMovements[i].balance = updatedMovements[i].totalStock - updatedMovements[i].stockedOut;
        }
      }

      // Convert movements to strings for Appwrite
      const updatedMovementStrings = updatedMovements.map(movement => {
        // Create a copy without the id field which is only used for UI
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...movementWithoutId } = movement;
        return JSON.stringify(movementWithoutId);
      });

      // Update in Appwrite
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.stockProductsCollectionId,
        productId,
        {
          stockMovements: updatedMovementStrings,
          lastUpdated: new Date().toISOString()
        }
      );

      // Update local state
      const updatedStockProduct = {
        ...stockProduct,
        stockMovements: updatedMovements,
        lastUpdated: new Date().toISOString()
      };

      setStockProduct(updatedStockProduct);
      setEditingMovementId(null);
      setEditedMovement(null);
      toast.success('Stock movement updated successfully');
    } catch (error) {
      console.error('Error updating stock movement:', error);
      toast.error('Failed to update stock movement');
    } finally {
      setIsUpdating(false);
    }
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
          productId
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
          productId,
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
          productId
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

        // Use unknown type and then cast to appropriate type
        // This avoids complex type definition issues with the html2pdf library
        interface Html2PdfReturn {
          set: (options: Record<string, unknown>) => Html2PdfReturn;
          from: (element: HTMLElement) => Html2PdfReturn;
          save: () => Promise<void>;
        }

        // Use a more specific type without any
        const html2pdf = window.html2pdf as unknown as () => Html2PdfReturn;
        const pdfInstance = html2pdf();

        // Configure and generate PDF with better print settings
        pdfInstance.set({
          margin: [10, 10, 10, 10],
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2, // Balance between quality and size
            useCORS: true,
            logging: false,
            letterRendering: true,
            backgroundColor: '#ffffff',
            windowWidth: 1200, // Fixed width for consistent rendering
            windowHeight: 1600 // Ensure enough height for all content
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'landscape', // Change to landscape for wider table
            compress: true,
            precision: 3,
            hotfixes: ["px_scaling"] // Fix for scaling issues
          }
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
          <p className="text-gray-700 mb-4">The stock product you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
          <Link
            href="/admin/stock-manager"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg active:bg-blue-50 transition-all duration-200 touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
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

      {/* Back button with animation - improved for mobile */}
      <div className="mb-6">
        <Link
          href="/admin/stock-manager"
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
          Back to Stock Manager
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center">
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
                <Image
                  src="/logo.png"
                  alt="Cepoka Logo"
                  width={64}
                  height={64}
                  className="mr-5 drop-shadow-md"
                  style={{ objectFit: "contain" }}
                />
                <div>
                  <h2 className="text-3xl font-bold uppercase text-gray-900 drop-shadow-sm">CEPOKA BEAUTY HUB</h2>
                  <h3 className="text-xl font-semibold text-gray-900">STOCK CARD</h3>
                </div>
              </div>
            </div>
            <div className="border-t border-b border-gray-300 py-3 my-4 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center opacity-10 blur-md print-watermark">
                <Image
                  src="/logo.png"
                  alt="Cepoka Logo"
                  width={192}
                  height={192}
                  className="object-contain"
                  priority={false}
                />
              </div>
              <div className="flex justify-between items-center px-4 relative z-10">
                <div className="text-gray-900 font-bold text-xl md:text-2xl">
                  Product:
                </div>
                <div className="text-gray-900 font-extrabold text-xl md:text-2xl">
                  {stockProduct.name}
                </div>
              </div>
            </div>

            {/* Add print-specific styles */}
            <style jsx global>{`
              @media print {
                .print-watermark {
                  position: absolute !important;
                  top: 50% !important;
                  left: 50% !important;
                  transform: translate(-50%, -50%) !important;
                  opacity: 0.1 !important;
                  z-index: 1 !important;
                }

                table {
                  width: 100% !important;
                  page-break-inside: auto !important;
                  font-size: 10pt !important;
                }

                table th, table td {
                  color: #111827 !important; /* text-gray-900 */
                  print-color-adjust: exact !important;
                  -webkit-print-color-adjust: exact !important;
                  padding: 4px !important;
                  font-size: 10pt !important;
                }

                h2, h3 {
                  color: #111827 !important;
                  print-color-adjust: exact !important;
                  -webkit-print-color-adjust: exact !important;
                }

                img {
                  max-width: 100% !important;
                  height: auto !important;
                  object-fit: contain !important;
                }

                /* Ensure all content is visible */
                @page {
                  size: landscape;
                  margin: 0.5cm;
                }
              }
            `}</style>
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
                  <th className="border border-gray-300 px-4 py-2 text-gray-900 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stockProduct.stockMovements.map((movement, index) => (
                  editingMovementId === movement.id ? (
                    // Edit form row
                    <tr key={`edit-${movement.id}`} className="bg-blue-50">
                      <td className="border border-gray-300 px-2 py-1">
                        <input
                          type="date"
                          name="date"
                          value={editedMovement?.date.split('T')[0] || ''}
                          onChange={handleEditInputChange}
                          className="w-full px-2 py-1 text-sm border border-gray-400 rounded bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {/* Calculated field, not editable */}
                        {editedMovement?.stockedIn && editedMovement.stockedIn > 0
                          ? editedMovement.stockedIn
                          : editedMovement?.stockedOut || 0}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        <input
                          type="number"
                          name="stockedIn"
                          min="0"
                          value={editedMovement?.stockedIn || 0}
                          onChange={handleEditInputChange}
                          className="w-full px-2 py-1 text-sm border border-gray-400 rounded bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center text-gray-500">
                        {/* Will be recalculated */}
                        Auto
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        <input
                          type="number"
                          name="stockedOut"
                          min="0"
                          value={editedMovement?.stockedOut || 0}
                          onChange={handleEditInputChange}
                          className="w-full px-2 py-1 text-sm border border-gray-400 rounded bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center text-gray-500">
                        {/* Will be recalculated */}
                        Auto
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        <input
                          type="text"
                          name="remarks"
                          value={editedMovement?.remarks || ''}
                          onChange={handleEditInputChange}
                          className="w-full px-2 py-1 text-sm border border-gray-400 rounded bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        <input
                          type="text"
                          name="sign"
                          value={editedMovement?.sign || ''}
                          onChange={handleEditInputChange}
                          className="w-full px-2 py-1 text-sm border border-gray-400 rounded bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        <div className="flex space-x-1">
                          <button
                            onClick={saveEditedMovement}
                            disabled={isUpdating}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                          >
                            {isUpdating ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // Normal display row
                    <tr key={movement.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2 text-gray-900 font-medium">{format(parseISO(movement.date), "MMM dd, yyyy")}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-gray-900">
                        {movement.stockedIn > 0 ? movement.stockedIn : movement.stockedOut}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-gray-900">
                        {movement.stockedIn > 0 ? movement.stockedIn : '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-gray-900 font-medium">{movement.totalStock}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-gray-900">
                        {movement.stockedOut > 0 ? movement.stockedOut : '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-gray-900 font-medium">{movement.balance}</td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-900">{movement.remarks}</td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-900">{movement.sign || '-'}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          onClick={() => startEditingMovement(movement)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 hover:shadow-md transition-all"
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
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-4 py-2 border border-gray-400 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
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
                className={`bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 hover:shadow-md transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
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
