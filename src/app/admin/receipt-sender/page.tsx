"use client";

import { useState, useRef, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { storage, appwriteConfig, databases } from '@/src/lib/appwrite';
import { ID, Query } from 'appwrite';

// Define a fixed document ID for the receipt counter
const RECEIPT_COUNTER_ID = 'receipt-counter';
// Use the dedicated Receipt ID collection
const RECEIPT_COLLECTION_ID = '681721d5001b6819df1b';
// Use the PDF storage collection
const PDF_COLLECTION_ID = '6817243c001593c1b882';

interface Html2PdfOptions {
    margin: number[];
    filename: string;
    image: { type: string; quality: number };
    html2canvas: {
        scale?: number;
        useCORS?: boolean;
        letterRendering?: boolean;
        scrollY?: number;
        windowWidth?: number;
        windowHeight?: number;
        onrendered?: (canvas: HTMLCanvasElement) => void;
        allowTaint?: boolean;
        foreignObjectRendering?: boolean;
        // Add any other properties that might be used
        [key: string]: unknown;
    };
    jsPDF: {
        unit: string;
        format: string;
        orientation: 'portrait' | 'landscape';
        putOnlyUsedFonts?: boolean;
        compress?: boolean;
    };
}

interface Html2PdfResult {
    save(): Promise<void>;
    from(element: HTMLElement): Html2PdfResult;
    set(options: Html2PdfOptions): Html2PdfResult;
    output(type: string): Promise<string | Blob>;
    outputPdf?(type: string): Promise<Blob>; // Add optional outputPdf method
}

declare global {
    interface Window {
        html2pdf: {
            (): Html2PdfResult;
            set: (opt: Html2PdfOptions) => Html2PdfResult;
            from: (element: HTMLElement) => Html2PdfResult;
            save: () => Promise<void>;
            output: (type: string) => Promise<string | Blob>;
        };
    }
}
// Link is used in the JSX
import SpinningLoader from '../../Components/SpinningLoader';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface LineItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface ReceiptData {
    customerName: string;
    whatsapp: string;
    items: LineItem[];
    subtotal: number;
    amountPaid: number;
    balance: number;
    receiptNumber: string;
    date: string;
    receiptIdNumber?: number; // The numeric part of the receipt ID
}

const ReceiptSender = () => {
    const [formData, setFormData] = useState<ReceiptData>({
        customerName: '',
        whatsapp: '',
        items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
        subtotal: 0,
        amountPaid: 0,
        balance: 0,
        receiptNumber: '',
        date: new Date().toISOString().split('T')[0],
        receiptIdNumber: 0,
    });
    const [showPreview, setShowPreview] = useState(false);
    const [isLoadingId, setIsLoadingId] = useState(false);
    const [startingIdNumber, setStartingIdNumber] = useState<number | ''>('');
    const [showIdSettings, setShowIdSettings] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

    // Function to fetch the current receipt ID from Appwrite
    const fetchReceiptId = async () => {
        try {
            setIsLoadingId(true);
            console.log("=== RECEIPT ID FETCH START ===");
            console.log("Database ID:", appwriteConfig.databaseId);
            console.log("Collection ID:", RECEIPT_COLLECTION_ID);
            console.log("Document ID:", RECEIPT_COUNTER_ID);

            // Try to get the receipt counter document directly
            try {
                console.log("Attempting to get document with ID:", RECEIPT_COUNTER_ID);
                const counterDoc = await databases.getDocument(
                    appwriteConfig.databaseId,
                    RECEIPT_COLLECTION_ID,
                    RECEIPT_COUNTER_ID
                );

                console.log("Found receipt counter document:", counterDoc);
                console.log("Raw receiptId value:", counterDoc.receiptId);
                console.log("receiptId type:", typeof counterDoc.receiptId);

                // Clear indication if receipt ID is coming through from Appwrite
                console.log("✅ RECEIPT ID FROM APPWRITE:", counterDoc.receiptId ? "YES - Value: " + counterDoc.receiptId : "NO - Value is missing or null");

                // Convert string ID to number, fallback to 1000 if not a valid number
                let currentId = counterDoc.receiptId ? parseInt(counterDoc.receiptId, 10) : 1000;
                console.log("Parsed receiptId to number:", currentId);

                // Use 1000 as fallback if parsing results in NaN
                currentId = isNaN(currentId) ? 1000 : currentId;
                console.log("Final currentId after validation:", currentId);

                // Generate the receipt number with the CEP prefix
                const newReceiptNumber = `CEP${currentId}`;
                console.log("Generated receipt number:", newReceiptNumber);

                setFormData(prev => ({
                    ...prev,
                    receiptNumber: newReceiptNumber,
                    receiptIdNumber: currentId
                }));
                console.log("Form data updated with receipt number");
                return;
            } catch (getError) {
                console.error('Error getting receipt counter document:', getError);
                console.log("Error details:", JSON.stringify(getError));
                console.log("Will create a new receipt counter document");
            }

            // If we get here, the document doesn't exist
            // Create the document with a default value
            try {
                const defaultId = 1000;
                console.log("Creating new receipt counter document with default ID:", defaultId);
                console.log("Document data to be created:", {
                    receiptId: defaultId.toString()
                });

                const createResponse = await databases.createDocument(
                    appwriteConfig.databaseId,
                    RECEIPT_COLLECTION_ID,
                    RECEIPT_COUNTER_ID,
                    {
                        receiptId: defaultId.toString()
                    }
                );

                console.log("Document creation successful:", createResponse);
                console.log("Created document ID:", createResponse.$id);
                console.log("Created document receiptId:", createResponse.receiptId);

                // Clear indication if receipt ID was successfully stored in Appwrite
                console.log("✅ RECEIPT ID STORED IN APPWRITE:", createResponse.receiptId ? "YES - Value: " + createResponse.receiptId : "NO - Value is missing or null");

                // Set the receipt number with the default ID
                setFormData(prev => ({
                    ...prev,
                    receiptNumber: `CEP${defaultId}`,
                    receiptIdNumber: defaultId
                }));
                console.log("Form data updated with default receipt number:", `CEP${defaultId}`);
                return;
            } catch (createError) {
                console.error('Error creating receipt counter document:', createError);
                console.log("Error details:", JSON.stringify(createError, null, 2));
                throw createError; // Re-throw to be caught by the outer catch
            }
        } catch (error) {
            console.error('Error in receipt ID generation:', error);
            console.log("Error type:", typeof error);
            console.log("Error details:", JSON.stringify(error, null, 2));

            // Fallback to timestamp-based ID if there's an error
            const timestamp = new Date().getTime().toString().slice(-6);
            console.log("Using fallback timestamp-based ID:", timestamp);

            setFormData(prev => ({
                ...prev,
                receiptNumber: `CEP${timestamp}`
            }));
            console.log("Form data updated with fallback receipt number:", `CEP${timestamp}`);

            toast.error('Using fallback receipt ID. Please check Appwrite setup.');
        } finally {
            setIsLoadingId(false);
            console.log("=== RECEIPT ID FETCH COMPLETE ===");
        }
    };

    // Function to update the receipt ID in Appwrite
    const updateReceiptId = async (newId: number) => {
        try {
            console.log("=== UPDATING RECEIPT ID ===");
            console.log("Attempting to update receipt ID to:", newId);

            // First check if the document exists
            try {
                const existingDoc = await databases.getDocument(
                    appwriteConfig.databaseId,
                    RECEIPT_COLLECTION_ID,
                    RECEIPT_COUNTER_ID
                );

                console.log("Found existing receipt counter document:", existingDoc);

                // If it exists, update it
                console.log("Updating document with new receiptId:", newId.toString());
                const updateResponse = await databases.updateDocument(
                    appwriteConfig.databaseId,
                    RECEIPT_COLLECTION_ID,
                    RECEIPT_COUNTER_ID,
                    {
                        receiptId: newId.toString()
                    }
                );

                console.log("Update successful:", updateResponse);
                console.log("✅ RECEIPT ID UPDATED IN APPWRITE:", updateResponse.receiptId);
                return true;
            } catch (getError) {
                console.error('Document not found, creating new one:', getError);

                // If document doesn't exist, create it
                console.log("Creating new receipt counter document with ID:", newId.toString());
                const createResponse = await databases.createDocument(
                    appwriteConfig.databaseId,
                    RECEIPT_COLLECTION_ID,
                    RECEIPT_COUNTER_ID,
                    {
                        receiptId: newId.toString()
                    }
                );

                console.log("Document creation successful:", createResponse);
                console.log("✅ RECEIPT ID CREATED IN APPWRITE:", createResponse.receiptId);
                return true;
            }
        } catch (error) {
            console.error('Error updating receipt ID:', error);
            console.log("Error details:", JSON.stringify(error, null, 2));
            toast.error('Failed to update receipt ID. Please try again.');
            return false;
        }
    };

    // Function to generate a new receipt ID
    const generateNewReceiptId = async () => {
        try {
            setIsLoadingId(true);

            let currentId = 1000;

            // Try to get the current ID
            console.log("=== GENERATE NEW RECEIPT ID ===");
            console.log("Attempting to get document with ID:", RECEIPT_COUNTER_ID);

            try {
                const response = await databases.getDocument(
                    appwriteConfig.databaseId,
                    RECEIPT_COLLECTION_ID,
                    RECEIPT_COUNTER_ID
                );

                console.log("getDocument response:", response);
                console.log("Raw receiptId from getDocument:", response.receiptId);
                console.log("receiptId type:", typeof response.receiptId);

                // Clear indication if receipt ID is coming through from Appwrite in generateNewReceiptId
                console.log("✅ RECEIPT ID FROM APPWRITE (generateNewReceiptId):",
                    response.receiptId ? "YES - Value: " + response.receiptId : "NO - Value is missing or null");

                // Get the current ID if document exists and convert from string to number
                const idFromDb = response.receiptId ? parseInt(response.receiptId, 10) : 1000;
                console.log("Parsed receiptId to number:", idFromDb);

                // Use 1000 as fallback if parsing results in NaN
                currentId = isNaN(idFromDb) ? 1000 : idFromDb;
                console.log("Final currentId after validation:", currentId);
            } catch (getError) {
                console.error('Error getting receipt counter, using default:', getError);
                console.log("Error details:", JSON.stringify(getError, null, 2));
                // If document doesn't exist, we'll use the default 1000
            }

            // Increment the ID
            const newId = currentId + 1;
            console.log("New ID after increment:", newId);

            // Update the ID in Appwrite
            console.log("Updating receipt ID in Appwrite to:", newId);
            const updated = await updateReceiptId(newId);
            console.log("Update result:", updated);

            if (updated) {
                // Update the receipt number in the form
                const newReceiptNumber = `CEP${newId}`;
                console.log("Setting new receipt number:", newReceiptNumber);

                setFormData(prev => ({
                    ...prev,
                    receiptNumber: newReceiptNumber,
                    receiptIdNumber: newId
                }));
                console.log("Form data updated with new receipt number");

                toast.success('Generated new receipt ID');
            } else {
                console.log("Failed to update receipt ID");
                toast.error('Failed to update receipt ID');
            }
        } catch (error) {
            console.error('Error generating new receipt ID:', error);
            console.log("Error details:", JSON.stringify(error, null, 2));

            // Generate a fallback ID based on timestamp
            const timestamp = new Date().getTime().toString().slice(-6);
            const fallbackId = `CEP${timestamp}`;
            console.log("Using fallback timestamp-based ID:", fallbackId);

            setFormData(prev => ({
                ...prev,
                receiptNumber: fallbackId
            }));
            console.log("Form data updated with fallback receipt number");

            toast.error('Using fallback receipt ID due to error');
        } finally {
            setIsLoadingId(false);
            console.log("=== GENERATE NEW RECEIPT ID COMPLETE ===");
        }
    };

    // Function to set a custom starting ID
    const setCustomStartingId = async () => {
        if (startingIdNumber === '' || isNaN(Number(startingIdNumber))) {
            toast.error('Please enter a valid number');
            return;
        }

        const newId = Number(startingIdNumber);
        if (newId < 1000) {
            toast.error('ID must be at least 1000');
            return;
        }

        try {
            setIsLoadingId(true);
            console.log("=== SETTING CUSTOM RECEIPT ID ===");
            console.log("Setting custom receipt ID to:", newId);

            // Update the ID in Appwrite
            const updated = await updateReceiptId(newId);
            console.log("Update result:", updated);

            if (updated) {
                // Update the receipt number in the form
                const newReceiptNumber = `CEP${newId}`;
                console.log("Setting new receipt number:", newReceiptNumber);

                setFormData(prev => ({
                    ...prev,
                    receiptNumber: newReceiptNumber,
                    receiptIdNumber: newId
                }));
                console.log("Form data updated with custom receipt number");

                setStartingIdNumber('');
                setShowIdSettings(false);
                toast.success(`Receipt ID set to ${newId}`);
            } else {
                console.log("Failed to update receipt ID");
                toast.error('Failed to update receipt ID');
            }
        } catch (error) {
            console.error('Error setting custom receipt ID:', error);
            console.log("Error details:", JSON.stringify(error, null, 2));

            // Generate a fallback ID based on the custom number
            const fallbackId = `CEP${newId}`;
            console.log("Using fallback custom ID:", fallbackId);

            setFormData(prev => ({
                ...prev,
                receiptNumber: fallbackId,
                receiptIdNumber: newId
            }));
            console.log("Form data updated with fallback custom receipt number");

            setStartingIdNumber('');
            setShowIdSettings(false);
            toast.error('Using custom ID locally only. Database update failed.');
        } finally {
            setIsLoadingId(false);
            console.log("=== CUSTOM RECEIPT ID SETTING COMPLETE ===");
        }
    };

    // Function to initialize the receipt ID if it doesn't exist
    const initializeReceiptId = async () => {
        try {
            console.log("=== INITIALIZING RECEIPT ID ===");
            console.log("Checking if receipt counter document exists...");

            try {
                // Try to get the existing document
                const existingDoc = await databases.getDocument(
                    appwriteConfig.databaseId,
                    RECEIPT_COLLECTION_ID,
                    RECEIPT_COUNTER_ID
                );

                console.log("Receipt counter document exists:", existingDoc);
                console.log("Current receiptId:", existingDoc.receiptId);

                // If it exists, just fetch it
                fetchReceiptId();
            } catch {
                console.log("Receipt counter document doesn't exist, creating it...");

                // Create the document with a default value
                const defaultId = 1000;
                await databases.createDocument(
                    appwriteConfig.databaseId,
                    RECEIPT_COLLECTION_ID,
                    RECEIPT_COUNTER_ID,
                    {
                        receiptId: defaultId.toString()
                    }
                );

                console.log("Receipt counter document created with default ID:", defaultId);

                // Now fetch it
                fetchReceiptId();
            }
        } catch (error) {
            console.error("Error initializing receipt ID:", error);
            // Still try to fetch in case there's a document
            fetchReceiptId();
        }
    };

    useEffect(() => {
        // Log Appwrite configuration for debugging
        console.log("=== APPWRITE CONFIGURATION ===");
        console.log("Database ID:", appwriteConfig.databaseId);
        console.log("Products Collection ID:", appwriteConfig.productsCollectionId);
        console.log("Storage ID:", appwriteConfig.storageId);
        console.log("Receipt Counter ID:", RECEIPT_COUNTER_ID);
        console.log("Receipt Collection ID:", RECEIPT_COLLECTION_ID);

        // Initialize the receipt ID when the component mounts
        initializeReceiptId();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Real-time calculations are now handled directly in the change handlers

    const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
        // Create a copy of the items array
        const newItems = [...formData.items];

        // Update the specific field
        newItems[index] = {
            ...newItems[index],
            [field]: value
        };

        // Calculate the total for this item immediately
        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index].total = Number(newItems[index].quantity) * Number(newItems[index].unitPrice);
        }

        // Update the form data with the new items
        setFormData(prev => {
            // Calculate new subtotal based on all items
            const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);

            // Calculate new balance based on the new subtotal and current amount paid
            const balance = subtotal - prev.amountPaid;

            // Return updated form data with new items, subtotal, and balance
            return {
                ...prev,
                items: newItems,
                subtotal,
                balance
            };
        });
    };

    const addLineItem = () => {
        setFormData(prev => {
            // Add new empty item
            const newItems = [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }];

            // No need to recalculate totals since the new item has total=0
            // But we'll do it anyway for consistency
            const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
            const balance = subtotal - prev.amountPaid;

            return {
                ...prev,
                items: newItems,
                subtotal,
                balance
            };
        });
    };

    const removeLineItem = (index: number) => {
        if (formData.items.length > 1) {
            const newItems = formData.items.filter((_, i) => i !== index);

            // Update form data and recalculate totals
            setFormData(prev => {
                // Calculate new subtotal based on filtered items
                const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);

                // Calculate new balance
                const balance = subtotal - prev.amountPaid;

                return {
                    ...prev,
                    items: newItems,
                    subtotal,
                    balance
                };
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowPreview(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const downloadPDF = async () => {
        try {
            if (typeof window.html2pdf === 'function' && receiptRef.current) {
                // Show loading toast with custom spinner
                toast.loading(
                    <div className="flex items-center gap-2">
                        <SpinningLoader size="small" />
                        <span>Generating PDF...</span>
                    </div>
                );

                // Use a timeout to ensure the UI updates before PDF generation
                await new Promise(resolve => setTimeout(resolve, 100));

                const element = receiptRef.current;
                const fileName = `${formData.receiptNumber}_${formData.customerName.replace(/\s+/g, '_')}.pdf`;

                console.log("=== GENERATING PDF ===");
                console.log("File name:", fileName);

                // Generate PDF directly from the visible receipt element
                // This is more reliable than creating a clone
                try {
                    const opt: Html2PdfOptions = {
                        margin: [5, 5, 5, 5], // Reduced margins to maximize content space
                        filename: fileName,
                        image: { type: 'jpeg', quality: 0.95 },
                        html2canvas: {
                            scale: 1.5, // Reduced scale for better full-page rendering
                            useCORS: true,
                            logging: true, // Enable logging for debugging
                            letterRendering: true,
                            allowTaint: true, // Allow cross-origin images
                            foreignObjectRendering: false, // Disable foreignObject rendering which can cause issues
                            scrollY: 0,
                            windowHeight: window.innerHeight * 2 // Increase capture height
                        },
                        jsPDF: {
                            unit: 'mm',
                            format: 'a4',
                            orientation: 'portrait',
                            compress: true
                        }
                    };

                    // Wait for fonts and images to load
                    await document.fonts.ready;

                    // Wait for all images to load
                    const images = Array.from(element.getElementsByTagName('img'));
                    await Promise.all(images.map(img => {
                        if (img.complete) return Promise.resolve();
                        return new Promise(resolve => {
                            img.onload = resolve;
                            img.onerror = resolve;
                        });
                    }));

                    // Force a small delay to ensure all styles are applied
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Generate PDF directly from the visible element
                    const pdfResult = await window.html2pdf()
                        .set(opt)
                        .from(element)
                        .output('blob') as Blob;

                    console.log("PDF generated successfully");

                    // Create a direct download link
                    const link = document.createElement('a');
                    const url = window.URL.createObjectURL(new Blob([pdfResult], { type: 'application/pdf' }));
                    link.href = url;
                    link.download = fileName;

                    // Wait a moment before clicking to ensure everything is ready
                    await new Promise(resolve => setTimeout(resolve, 100));
                    link.click();

                    // Cleanup after a short delay
                    setTimeout(() => {
                        window.URL.revokeObjectURL(url);
                    }, 100);

                    // Upload to Appwrite in the background
                    try {
                        console.log("=== UPLOADING PDF TO APPWRITE ===");

                        // Create File object
                        const file = new File([pdfResult], fileName, {
                            type: 'application/pdf'
                        });

                        // Generate a unique file ID
                        const fileId = ID.unique();
                        console.log("File ID:", fileId);

                        // Upload to Appwrite with public read permission
                        const uploadedFile = await storage.createFile(
                            appwriteConfig.storageId,
                            fileId,
                            file,
                            ['read("any")'] // This makes the file publicly readable
                        );
                        console.log("File uploaded successfully:", uploadedFile);

                        // Get the file download URL
                        const fileUrl = storage.getFileDownload(
                            appwriteConfig.storageId,
                            uploadedFile.$id
                        ).toString();
                        console.log("File URL:", fileUrl);

                        // Store the PDF reference in the PDF collection using the exact attribute names
                        const pdfDocument = await databases.createDocument(
                            appwriteConfig.databaseId,
                            PDF_COLLECTION_ID,
                            ID.unique(),
                            {
                                name: formData.customerName,
                                receiptId: formData.receiptNumber,
                                receiptPdf: fileUrl
                            }
                        );
                        console.log("PDF document created in database:", pdfDocument);

                        // Increment the receipt ID after successful upload
                        await incrementReceiptIdAfterUpload();
                    } catch (uploadError) {
                        console.error("Error uploading PDF to Appwrite:", uploadError);
                        console.log("Error details:", JSON.stringify(uploadError, null, 2));
                        // Don't show an error toast since this is a background operation
                    }

                    // Dismiss loading toast and show success
                    toast.dismiss();
                    toast.success('PDF generated successfully!');

                    return pdfResult;
                } catch (error) {
                    console.error('PDF Generation Error:', error);
                    console.log("Error details:", JSON.stringify(error, null, 2));
                    toast.dismiss();
                    toast.error('Failed to generate PDF');
                    throw error;
                }
            }
            throw new Error('PDF generation not available');
        } catch (error) {
            console.error('PDF Generation Error:', error);
            console.log("Error details:", JSON.stringify(error, null, 2));
            toast.dismiss();
            toast.error('Failed to generate PDF');
            throw error;
        }
    };

    // Function to check if a receipt PDF already exists in Appwrite
    const findExistingReceiptPDF = async (receiptNumber: string) => {
        try {
            console.log("=== CHECKING FOR EXISTING RECEIPT PDF ===");
            console.log("Looking for receipt number:", receiptNumber);

            // Query the PDF collection for the receipt ID
            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                PDF_COLLECTION_ID,
                [Query.equal("receiptId", receiptNumber)]
            );

            console.log("Search results:", response);

            if (response.documents.length > 0) {
                // Found existing receipt PDF
                const existingDoc = response.documents[0];
                console.log("Found existing receipt PDF:", existingDoc);
                return {
                    exists: true,
                    fileUrl: existingDoc.receiptPdf,
                    document: existingDoc
                };
            }

            // No existing receipt PDF found
            console.log("No existing receipt PDF found");
            return { exists: false };
        } catch (error) {
            console.error("Error checking for existing receipt PDF:", error);
            console.log("Error details:", JSON.stringify(error, null, 2));
            return { exists: false, error };
        }
    };

    // Function to increment receipt ID after successful upload
    const incrementReceiptIdAfterUpload = async () => {
        try {
            console.log("=== INCREMENTING RECEIPT ID AFTER UPLOAD ===");

            // Get the current receipt ID
            const currentIdNumber = formData.receiptIdNumber || 1000;
            const newId = currentIdNumber + 1;
            console.log("Current ID:", currentIdNumber);
            console.log("New ID:", newId);

            // Update the ID in Appwrite
            const updated = await updateReceiptId(newId);

            if (updated) {
                console.log("Receipt ID incremented successfully");

                // Update the form data with the new receipt ID
                setFormData(prev => ({
                    ...prev,
                    receiptNumber: `CEP${newId}`,
                    receiptIdNumber: newId
                }));

                console.log("Form data updated with new receipt ID");
                return true;
            } else {
                console.error("Failed to increment receipt ID");
                return false;
            }
        } catch (error) {
            console.error("Error incrementing receipt ID:", error);
            console.log("Error details:", JSON.stringify(error, null, 2));
            return false;
        }
    };

    // Function to generate PDF blob without opening it in a new tab
    const generatePDFBlobOnly = async () => {
        try {
            console.log("=== GENERATING PDF BLOB ONLY ===");

            if (typeof window.html2pdf === 'function' && receiptRef.current) {
                const element = receiptRef.current;
                const fileName = `${formData.receiptNumber}_${formData.customerName.replace(/\s+/g, '_')}.pdf`;

                console.log("Generating PDF blob for:", fileName);

                // Set options for the PDF
                const opt: Html2PdfOptions = {
                    margin: [5, 5, 5, 5],
                    filename: fileName,
                    image: { type: 'jpeg', quality: 0.95 },
                    html2canvas: {
                        scale: 1.5,
                        useCORS: true,
                        logging: true,
                        letterRendering: true,
                        allowTaint: true,
                        foreignObjectRendering: false,
                        scrollY: 0,
                        windowHeight: window.innerHeight * 2
                    },
                    jsPDF: {
                        unit: 'mm',
                        format: 'a4',
                        orientation: 'portrait',
                        compress: true
                    }
                };

                // Wait for fonts and images to load
                await document.fonts.ready;

                // Wait for all images to load
                const images = Array.from(element.getElementsByTagName('img'));
                await Promise.all(images.map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise(resolve => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                }));

                // Force a small delay to ensure all styles are applied
                await new Promise(resolve => setTimeout(resolve, 500));

                // Generate PDF blob
                const pdfBlob = await window.html2pdf()
                    .set(opt)
                    .from(element)
                    .output('blob') as Blob;

                console.log("PDF blob generated successfully");
                return pdfBlob;
            }

            throw new Error('PDF generation not available');
        } catch (error) {
            console.error('Error generating PDF blob:', error);
            console.log("Error details:", JSON.stringify(error, null, 2));
            throw error;
        }
    };

    // Function to upload PDF to Appwrite and return the file URL
    const uploadPDFToAppwrite = async (pdfBlob: Blob) => {
        try {
            console.log("=== UPLOADING PDF TO APPWRITE ===");

            // Create File object
            const fileName = `${formData.receiptNumber}_${formData.customerName.replace(/\s+/g, '_')}.pdf`;
            const file = new File([pdfBlob], fileName, {
                type: 'application/pdf'
            });

            console.log("File name:", fileName);

            // Generate a unique file ID
            const fileId = ID.unique();
            console.log("File ID:", fileId);

            // Upload to Appwrite with public read permission
            const uploadedFile = await storage.createFile(
                appwriteConfig.storageId,
                fileId,
                file,
                ['read("any")'] // This makes the file publicly readable
            );
            console.log("File uploaded successfully:", uploadedFile);

            // Get the file download URL
            const fileUrl = storage.getFileDownload(
                appwriteConfig.storageId,
                uploadedFile.$id
            ).toString();
            console.log("File URL:", fileUrl);

            // Store the PDF reference in the PDF collection using the exact attribute names
            const pdfDocument = await databases.createDocument(
                appwriteConfig.databaseId,
                PDF_COLLECTION_ID,
                ID.unique(),
                {
                    name: formData.customerName,
                    receiptId: formData.receiptNumber,
                    receiptPdf: fileUrl
                }
            );
            console.log("PDF document created in database:", pdfDocument);

            // Increment the receipt ID after successful upload
            await incrementReceiptIdAfterUpload();

            return fileUrl;
        } catch (error) {
            console.error("Error uploading PDF to Appwrite:", error);
            console.log("Error details:", JSON.stringify(error, null, 2));
            throw error;
        }
    };

    const sendWhatsApp = async () => {
        try {
            toast.loading(
                <div className="flex items-center gap-2">
                    <SpinningLoader size="small" />
                    <span>Preparing receipt for WhatsApp...</span>
                </div>
            );

            let fileUrl = "";

            // First, check if the receipt PDF already exists in Appwrite
            const existingPDF = await findExistingReceiptPDF(formData.receiptNumber);

            if (existingPDF.exists && existingPDF.fileUrl) {
                // Use the existing PDF
                console.log("Using existing PDF file URL:", existingPDF.fileUrl);
                fileUrl = existingPDF.fileUrl;

                // No need to increment receipt ID since we're using an existing PDF
                console.log("Using existing PDF, not incrementing receipt ID");
            } else {
                // No existing PDF found, generate and upload a new one
                console.log("No existing PDF found, generating a new one");

                try {
                    // Generate the PDF blob without opening it
                    const pdfBlob = await generatePDFBlobOnly();

                    // Upload the PDF to Appwrite
                    fileUrl = await uploadPDFToAppwrite(pdfBlob);
                } catch (error) {
                    console.error("Error generating or uploading PDF:", error);
                    toast.dismiss();
                    toast.error('Failed to prepare receipt for WhatsApp');
                    return;
                }
            }

            // Share via WhatsApp
            const message = encodeURIComponent(
                `Hello ${formData.customerName}, here's your receipt ${formData.receiptNumber} for ₦${formData.subtotal.toLocaleString()}. Thank you for shopping with us!\n\nDownload Receipt: ${fileUrl}`
            );

            // Format the WhatsApp number
            let phone = formData.whatsapp.replace(/[^0-9]/g, '');

            // Add country code if not present
            if (!phone.startsWith('234') && !phone.startsWith('+234')) {
                // If the number starts with 0, replace it with 234
                if (phone.startsWith('0')) {
                    phone = '234' + phone.substring(1);
                } else {
                    // Otherwise, just add 234 prefix
                    phone = '234' + phone;
                }
            }

            // Remove + if present
            phone = phone.replace('+', '');

            console.log("Formatted WhatsApp number:", phone);

            // Create WhatsApp URL
            const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
            console.log("WhatsApp URL:", whatsappUrl);

            // Dismiss loading toast
            toast.dismiss();

            // Open WhatsApp in a new tab
            window.open(whatsappUrl, '_blank');

            toast.success('Receipt sent to WhatsApp!');
        } catch (error) {
            console.error('Error sharing receipt:', error);
            console.log("Error details:", JSON.stringify(error, null, 2));
            toast.dismiss();
            toast.error('Failed to share receipt');
        }
    };



    const resetForm = async () => {
        // Generate a new receipt ID
        try {
            setIsLoadingId(true);
            console.log("=== RESET FORM - RECEIPT ID FETCH ===");

            let currentId = 1000;
            let newId = 1001;

            // Try to get the current ID
            console.log("Attempting to get document with ID:", RECEIPT_COUNTER_ID);

            try {
                const response = await databases.getDocument(
                    appwriteConfig.databaseId,
                    RECEIPT_COLLECTION_ID,
                    RECEIPT_COUNTER_ID
                );

                console.log("getDocument response in resetForm:", response);
                console.log("Raw receiptId from getDocument:", response.receiptId);
                console.log("receiptId type:", typeof response.receiptId);

                // Clear indication if receipt ID is coming through from Appwrite in resetForm
                console.log("✅ RECEIPT ID FROM APPWRITE (resetForm):",
                    response.receiptId ? "YES - Value: " + response.receiptId : "NO - Value is missing or null");

                // Get the current ID if document exists and convert from string to number
                const idFromDb = response.receiptId ? parseInt(response.receiptId, 10) : 1000;
                console.log("Parsed receiptId to number:", idFromDb);

                // Use 1000 as fallback if parsing results in NaN
                currentId = isNaN(idFromDb) ? 1000 : idFromDb;
                console.log("Final currentId after validation:", currentId);

                // Increment the ID
                newId = currentId + 1;
                console.log("New ID after increment:", newId);
            } catch (getError) {
                console.error('Error getting receipt counter, using default:', getError);
                console.log("Error details:", JSON.stringify(getError, null, 2));
                console.log("Using default ID values");
                // If document doesn't exist, we'll use the default values
            }

            // Try to update the ID in Appwrite
            try {
                console.log("Updating receipt ID in Appwrite to:", newId);
                const updated = await updateReceiptId(newId);
                console.log("Update result:", updated);
            } catch (updateError) {
                console.error('Error updating receipt ID:', updateError);
                console.log("Error details:", JSON.stringify(updateError, null, 2));
                console.log("Continuing with the new ID even if update fails");
                // Continue with the new ID even if update fails
            }

            // Reset the form with the new receipt ID
            console.log("Resetting form with new receipt ID:", newId);
            setFormData({
                customerName: '',
                whatsapp: '',
                items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
                subtotal: 0,
                amountPaid: 0,
                balance: 0,
                receiptNumber: `CEP${newId}`,
                receiptIdNumber: newId,
                date: new Date().toISOString().split('T')[0],
            });
            console.log("Form reset with new receipt number:", `CEP${newId}`);
        } catch (error) {
            console.error('Error generating new receipt ID:', error);
            console.log("Error details:", JSON.stringify(error, null, 2));

            // Fallback to timestamp-based ID
            const timestamp = new Date().getTime().toString().slice(-6);
            console.log("Using fallback timestamp-based ID:", timestamp);

            setFormData({
                customerName: '',
                whatsapp: '',
                items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
                subtotal: 0,
                amountPaid: 0,
                balance: 0,
                receiptNumber: `CEP${timestamp}`,
                date: new Date().toISOString().split('T')[0],
            });
            console.log("Form reset with fallback receipt number:", `CEP${timestamp}`);
        } finally {
            setIsLoadingId(false);
            setShowPreview(false);
            console.log("=== RESET FORM COMPLETE ===");
        }
    };

    const startNewReceipt = () => {
        if (window.confirm('Are you sure you want to start a new receipt? This will clear the current one.')) {
            resetForm();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 mt-32 pb-4 sm:pb-8 pt-6 sm:pt-8 md:pt-10">
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" />

            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
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

                <div className="mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Receipt Generator</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 lg:items-start">
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Customer Name
                                    </label>
                                    <input
                                        type="text"
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black text-gray-900 placeholder-gray-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        WhatsApp Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="whatsapp"
                                        value={formData.whatsapp}
                                        onChange={handleChange}
                                        required
                                        placeholder="+234..."
                                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black text-gray-900 placeholder-gray-500"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Receipt Number
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowIdSettings(!showIdSettings)}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            {showIdSettings ? 'Hide Settings' : 'ID Settings'}
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="receiptNumber"
                                            value={formData.receiptNumber}
                                            readOnly
                                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black text-gray-900 placeholder-gray-500 bg-gray-50"
                                        />
                                        <button
                                            type="button"
                                            onClick={generateNewReceiptId}
                                            disabled={isLoadingId}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                        >
                                            {isLoadingId ? 'Loading...' : 'Generate New ID'}
                                        </button>
                                    </div>

                                    {showIdSettings && (
                                        <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                            <p className="text-xs text-gray-600 mb-2">Set a custom starting ID number:</p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={startingIdNumber}
                                                    onChange={(e) => setStartingIdNumber(e.target.value === '' ? '' : Number(e.target.value))}
                                                    placeholder="e.g. 1000"
                                                    min="1000"
                                                    className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={setCustomStartingId}
                                                    disabled={isLoadingId}
                                                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded flex items-center justify-center"
                                                >
                                                    {isLoadingId ? (
                                                        <div className="flex items-center gap-1">
                                                            <SpinningLoader size="small" />
                                                            <span>Setting...</span>
                                                        </div>
                                                    ) : 'Set ID'}
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Current ID: {formData.receiptIdNumber || 'Not set'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-base sm:text-lg text-gray-700 font-semibold">Items</h3>
                                    <button
                                        type="button"
                                        onClick={addLineItem}
                                        className="text-xs sm:text-sm bg-gray-700 text-white px-2 sm:px-3 py-1 rounded-lg hover:bg-gray-600"
                                    >
                                        + Add Item
                                    </button>
                                </div>

                                <div className="space-y-2 -mx-2 px-2 max-w-full overflow-x-auto">
                                    {formData.items.map((item, index) => (
                                        <div key={index} className="flex items-center gap-1.5 sm:gap-2 min-w-max sm:min-w-0">
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                className="flex-1 min-w-[100px] px-2 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black text-gray-900 placeholder-gray-500"
                                            />

                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                value={item.quantity === 0 ? '' : item.quantity}
                                                onChange={(e) => {
                                                    const value = e.target.value === '' ? 0 : Number(e.target.value);
                                                    handleItemChange(index, 'quantity', value);
                                                }}
                                                onFocus={(e) => {
                                                    if (e.target.value === '1' || e.target.value === '0') {
                                                        e.target.select();
                                                    }
                                                }}
                                                className="w-14 sm:w-20 px-1 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black text-gray-900 placeholder-gray-500"
                                                min="1"
                                                step="1"
                                                inputMode="numeric"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Price ₦"
                                                value={item.unitPrice === 0 ? '' : item.unitPrice}
                                                onChange={(e) => {
                                                    const value = e.target.value === '' ? 0 : Number(e.target.value);
                                                    handleItemChange(index, 'unitPrice', value);
                                                }}
                                                onFocus={(e) => e.target.select()}
                                                className="w-16 sm:w-24 px-1 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black text-gray-900 placeholder-gray-500"
                                                min="0"
                                                step="1"
                                                inputMode="numeric"
                                            />
                                            <div className="flex items-center gap-1 sm:gap-2 min-w-[70px] sm:min-w-[100px] justify-end">
                                                <span className="text-xs sm:text-sm text-gray-900 whitespace-nowrap font-medium transition-all duration-300" style={{ color: item.total > 0 ? '#000' : '#888' }}>
                                                    ₦{item.total.toLocaleString()}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeLineItem(index)}
                                                    className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                                                    aria-label="Remove item"
                                                    title="Remove item"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount Paid (₦)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Enter amount paid"
                                        value={formData.amountPaid === 0 ? '' : formData.amountPaid}
                                        onChange={(e) => {
                                            const value = e.target.value === '' ? 0 : Number(e.target.value);
                                            setFormData(prev => ({
                                                ...prev,
                                                amountPaid: value,
                                                balance: prev.subtotal - value // Calculate balance in real-time
                                            }));
                                        }}
                                        onFocus={(e) => e.target.select()}
                                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg text-gray-900 placeholder-gray-500"
                                        min="0"
                                        step="1"
                                    />
                                </div>
                                <div className="text-right space-y-2 text-gray-900 font-medium text-sm sm:text-base">
                                    <p className="transition-all duration-300">
                                        <span className="inline-block w-20 text-gray-600">Subtotal:</span>
                                        <span className="font-semibold">₦{formData.subtotal.toLocaleString()}</span>
                                    </p>
                                    <p className="transition-all duration-300">
                                        <span className="inline-block w-20 text-gray-600">Balance:</span>
                                        <span className={`font-semibold ${formData.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            ₦{formData.balance.toLocaleString()}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between gap-4 mt-6">
                                <button
                                    type="submit"
                                    className="w-full sm:flex-1 bg-[#333333] text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm sm:text-base"
                                >
                                    Generate Receipt
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="w-full sm:flex-1 px-4 py-2 border-gray-400 text-gray-600 border-2 rounded-lg hover:bg-gray-600 hover:text-white text-sm sm:text-base"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    {showPreview && (
                        <div className="bg-white p-2 sm:p-4 md:p-6 rounded-xl shadow-lg overflow-auto"
                            style={{
                                maxHeight: 'calc(100vh - 180px)',
                                height: 'auto',
                                overscrollBehavior: 'contain'
                            }}>
                            <div
                                ref={receiptRef}
                                className="bg-white mx-auto sm:scale-90 md:scale-85"
                                style={{
                                    width: '100%',
                                    maxWidth: '210mm',
                                    height: 'auto',
                                    padding: '5mm', // Smaller padding on mobile
                                    boxSizing: 'border-box',
                                    backgroundColor: 'white',
                                    fontFamily: 'Arial, sans-serif',
                                    fontSize: '10pt', // Smaller font on mobile
                                    lineHeight: '1.4',
                                    letterSpacing: '0.2px',
                                    border: '1px solid #eee',
                                    position: 'relative',
                                    margin: '0 auto',
                                    transformOrigin: 'top center',
                                    color: '#000000',
                                    pageBreakInside: 'avoid'
                                }}
                            >
                                <div className="text-center mb-8">
                                    <div className="mb-3" style={{ height: '80px', position: 'relative' }}>
                                        <Image
                                            src="/logo.png"
                                            alt="Cepoka Logo"
                                            width={80}
                                            height={80}
                                            className="mx-auto"
                                            style={{
                                                maxWidth: '80px',
                                                height: 'auto',
                                                display: 'block',
                                                margin: '0 auto'
                                            }}
                                            priority={true} // Prioritize image loading
                                            unoptimized={true} // Use unoptimized image for better PDF compatibility
                                        />
                                    </div>
                                    <div className="relative pb-3 mb-6">
                                        <h2 style={{
                                            fontSize: '24pt',
                                            fontWeight: '700',
                                            color: '#000000',
                                            marginBottom: '8px'
                                        }}>
                                            CEPOKA BEAUTY HUB
                                        </h2>
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-[2px]"
                                            style={{
                                                background: '#000000',
                                                height: '2px'
                                            }}
                                        />
                                    </div>

                                    {/* Address section with HEAD OFFICE and BRANCHES */}
                                    <div className="flex flex-col items-center" style={{
                                        marginTop: '12px',
                                        marginBottom: '16px',
                                        fontSize: '9pt',
                                        color: '#000000'
                                    }}>
                                        {/* HEAD OFFICE/SHOWROOM */}
                                        <div className="mb-3 text-center">
                                            <p style={{
                                                fontWeight: '700',
                                                marginBottom: '4px',
                                                fontSize: '10pt'
                                            }}>HEAD OFFICE/SHOWROOM</p>
                                            <div className="flex flex-wrap justify-center">
                                                <span style={{ padding: '0 8px' }}>Lekki, Lagos</span>
                                                <span style={{ padding: '0 8px' }}>+234 803 123 4567</span>
                                                <span style={{ padding: '0 8px' }}>info@cepoka.com</span>
                                            </div>
                                        </div>

                                        {/* BRANCHES */}
                                        <div className="text-center">
                                            <p style={{
                                                fontWeight: '700',
                                                marginBottom: '4px',
                                                fontSize: '10pt'
                                            }}>BRANCHES</p>
                                            <div className="flex flex-wrap justify-center">
                                                <span style={{ padding: '0 8px' }}>Ikeja, Lagos</span>
                                                <span style={{ padding: '0 8px' }}>Abuja</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6" style={{ padding: '12px', backgroundColor: '#f8f8f8', borderRadius: '8px' }}>
                                    <div className="flex flex-col xs:flex-row justify-between mb-2" style={{ color: '#000000' }}>
                                        <p className="mb-1 xs:mb-0" style={{ color: '#000000' }}>
                                            <strong style={{ fontWeight: '600' }}>Customer:</strong> {formData.customerName}
                                        </p>
                                        <p className="mb-1 xs:mb-0" style={{ color: '#000000' }}>
                                            <strong style={{ fontWeight: '600' }}>Receipt #:</strong> {formData.receiptNumber}
                                        </p>
                                    </div>
                                    <div className="flex flex-col xs:flex-row xs:justify-between" style={{ color: '#000000' }}>
                                        <p className="mb-1 xs:mb-0" style={{ color: '#000000' }}>
                                            <strong style={{ fontWeight: '600' }}>Tel:</strong> {formData.whatsapp}
                                        </p>
                                        <p style={{ color: '#000000' }}>
                                            <strong style={{ fontWeight: '600' }}>Date:</strong> {new Date(formData.date).toLocaleDateString('en-NG', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* CASH SALES INVOICE Header */}
                                <div className="text-center mb-3">
                                    <h3 style={{
                                        fontWeight: '700',
                                        fontSize: '14pt',
                                        color: '#000000',
                                        marginBottom: '8px'
                                    }}>CASH SALES INVOICE</h3>
                                </div>

                                <div className="overflow-x-auto -mx-2 px-2">
                                    <table style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        marginBottom: '16px',
                                        color: '#000000',
                                        fontSize: '9pt',
                                        minWidth: '300px'
                                    }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #000000', borderTop: '2px solid #000000' }}>
                                                <th style={{
                                                    padding: '8px 6px',
                                                    textAlign: 'left',
                                                    fontWeight: '700',
                                                    color: '#000000'
                                                }}>Description</th>
                                                <th style={{
                                                    padding: '8px 4px',
                                                    textAlign: 'right',
                                                    fontWeight: '700',
                                                    color: '#000000'
                                                }}>Qty</th>
                                                <th style={{
                                                    padding: '8px 4px',
                                                    textAlign: 'right',
                                                    fontWeight: '700',
                                                    color: '#000000'
                                                }}>Price</th>
                                                <th style={{
                                                    padding: '8px 4px',
                                                    textAlign: 'right',
                                                    fontWeight: '700',
                                                    color: '#000000'
                                                }}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.items.map((item, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid #e5e5e5' }}>
                                                    <td style={{ padding: '8px 6px', color: '#000000' }}>{item.description}</td>
                                                    <td style={{ padding: '8px 4px', textAlign: 'right', color: '#000000' }}>{item.quantity}</td>
                                                    <td style={{ padding: '8px 4px', textAlign: 'right', color: '#000000' }}>₦{item.unitPrice.toLocaleString()}</td>
                                                    <td style={{ padding: '8px 4px', textAlign: 'right', color: '#000000' }}>₦{item.total.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{
                                    borderTop: '2px solid #000000',
                                    paddingTop: '12px',
                                    color: '#000000'
                                }}>
                                    <div className="flex flex-col space-y-2" style={{ color: '#000000' }}>
                                        <div className="flex justify-between items-center" style={{ color: '#000000' }}>
                                            <strong style={{
                                                fontWeight: '700',
                                                fontSize: '12pt',
                                                color: '#000000'
                                            }}>Subtotal:</strong>
                                            <span style={{
                                                fontWeight: '700',
                                                fontSize: '12pt',
                                                color: '#000000'
                                            }}>₦{formData.subtotal.toLocaleString()}</span>
                                        </div>

                                        <div className="flex justify-between items-center" style={{ color: '#000000' }}>
                                            <strong style={{
                                                fontWeight: '700',
                                                fontSize: '12pt',
                                                color: '#000000'
                                            }}>Amount Paid:</strong>
                                            <span style={{
                                                fontWeight: '700',
                                                fontSize: '12pt',
                                                color: '#000000'
                                            }}>₦{formData.amountPaid.toLocaleString()}</span>
                                        </div>

                                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200" style={{ color: '#000000' }}>
                                            <strong style={{
                                                fontWeight: '700',
                                                fontSize: '12pt',
                                                color: '#000000'
                                            }}>Balance:</strong>
                                            <span style={{
                                                fontWeight: '700',
                                                fontSize: '12pt',
                                                color: formData.balance > 0 ? '#cc0000' : '#008800'
                                            }}>₦{formData.balance.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: '16px',
                                    paddingTop: '12px',
                                    borderTop: '1px solid #e5e5e5',
                                    textAlign: 'center',
                                    color: '#000000',
                                    fontSize: '9pt'
                                }}>
                                    <p style={{
                                        marginBottom: '3px',
                                        fontWeight: '500',
                                        color: '#000000'
                                    }}>Thank you for your patronage!</p>
                                    <p style={{
                                        fontWeight: '500',
                                        color: '#000000'
                                    }}>Follow us on Instagram: @cepoka</p>
                                    <div style={{
                                        marginTop: '12px',
                                        fontSize: '8pt',
                                        color: '#666666'
                                    }}>
                                        This is a computer-generated receipt and requires no signature.
                                    </div>
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-white pt-3 pb-1 border-t mt-4">
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                    <button
                                        onClick={downloadPDF}
                                        className="w-full sm:flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm sm:text-base"
                                    >
                                        Download PDF
                                    </button>
                                    <button
                                        onClick={sendWhatsApp}
                                        className="w-full sm:flex-1 bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#128C7E] text-sm sm:text-base"
                                    >
                                        Send WhatsApp
                                    </button>
                                    <button
                                        onClick={startNewReceipt}
                                        className="w-full sm:flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                                    >
                                        New Receipt
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReceiptSender;
