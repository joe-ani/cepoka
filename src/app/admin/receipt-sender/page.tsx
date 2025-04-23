"use client";

import { useState, useRef, useEffect } from 'react';
import Script from 'next/script';

declare global {
    interface Window {
        html2pdf: {
            (): any;
            set: (opt: any) => any;
            from: (element: HTMLElement) => any;
            save: () => Promise<void>;
            output: (type: string) => Promise<string>;
        };
    }
}
import Link from 'next/link';
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
    });
    const [showPreview, setShowPreview] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Generate receipt number when component mounts
        const timestamp = new Date().getTime().toString().slice(-6);
        setFormData(prev => ({ ...prev, receiptNumber: `CEP${timestamp}` }));
    }, []);

    const calculateTotals = () => {
        const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
        const balance = subtotal - formData.amountPaid;
        setFormData(prev => ({ ...prev, subtotal, balance }));
    };

    const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
        const newItems = [...formData.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
            total: field === 'quantity' || field === 'unitPrice'
                ? Number(newItems[index].quantity) * Number(newItems[index].unitPrice)
                : newItems[index].total
        };

        setFormData(prev => ({ ...prev, items: newItems }));
        calculateTotals();
    };

    const addLineItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
        }));
    };

    const removeLineItem = (index: number) => {
        if (formData.items.length > 1) {
            const newItems = formData.items.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, items: newItems }));
            calculateTotals();
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
        if (typeof window.html2pdf === 'function' && receiptRef.current) {
            const element = receiptRef.current;

            const opt = {
                margin: [15, 15, 15, 15],
                filename: `receipt-${formData.customerName}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 4,
                    useCORS: true,
                    scrollX: 0,
                    scrollY: 0,
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    putOnlyUsedFonts: true,
                    compress: true
                }
            };

            try {
                // Create a temporary container with fixed dimensions
                const tempContainer = document.createElement('div');
                tempContainer.style.width = '210mm';  // A4 width
                tempContainer.style.minHeight = '297mm'; // A4 height
                tempContainer.style.padding = '15mm';
                tempContainer.style.backgroundColor = 'white';
                tempContainer.style.boxSizing = 'border-box';
                tempContainer.innerHTML = element.innerHTML;
                document.body.appendChild(tempContainer);

                // Generate PDF
                // @ts-expect-error - html2pdf is loaded via CDN
                await html2pdf().set(opt).from(tempContainer).save();

                // Cleanup
                document.body.removeChild(tempContainer);
            } catch (error) {
                console.error('PDF Generation Error:', error);
            }
        }
    };

    const downloadAndShare = async () => {
        if (typeof window.html2pdf === 'function' && receiptRef.current) {
            const opt = {
                margin: [0.5, 0.5, 0.5, 0.5],
                filename: `receipt-${formData.customerName}.pdf`,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: {
                    scale: 4,
                    useCORS: true,
                    letterRendering: true,
                    scrollY: 0,
                    windowWidth: receiptRef.current.offsetWidth,
                    windowHeight: receiptRef.current.offsetHeight
                },
                jsPDF: {
                    unit: 'in',
                    format: [8.5, 11],
                    orientation: 'portrait',
                    putOnlyUsedFonts: true
                }
            };

            try {
                const receiptClone = receiptRef.current.cloneNode(true) as HTMLElement;
                document.body.appendChild(receiptClone);
                receiptClone.style.position = 'absolute';
                receiptClone.style.left = '-9999px';
                receiptClone.style.top = '0';

                // @ts-expect-error - html2pdf is loaded via CDN
                const pdf = await html2pdf().set(opt).from(receiptClone).output('datauristring');
                document.body.removeChild(receiptClone);
                return pdf;
            } catch (error) {
                console.error('Error generating PDF:', error);
                toast.error('Failed to generate receipt');
            }
        }
    };

    const sendWhatsApp = async () => {
        const pdfData = await downloadAndShare();
        const message = encodeURIComponent(
            `Hello ${formData.customerName}, here's your receipt for ₦${formData.subtotal}. Thank you for shopping with us!\n\nReceipt: ${pdfData}`
        );
        const phone = formData.whatsapp.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    const getCurrentDate = () => {
        if (formData.date) {
            return new Date(formData.date).toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        return new Date().toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const resetForm = () => {
        const timestamp = new Date().getTime().toString().slice(-6);
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
        setShowPreview(false);
    };

    const startNewReceipt = () => {
        if (window.confirm('Are you sure you want to start a new receipt? This will clear the current one.')) {
            resetForm();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-32 sm:pt-40 pb-8 px-4 sm:px-6 lg:px-8">
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" />

            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Receipt Generator</h1>
                    <Link href="/admin" className="bg-[#333333] text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Admin
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black text-gray-900 placeholder-gray-500"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black text-gray-900"
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black text-gray-900 placeholder-gray-500"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg text-gray-700 font-semibold">Items</h3>
                                    <button
                                        type="button"
                                        onClick={addLineItem}
                                        className="text-sm bg-gray-700 px-3 py-1 rounded-lg hover:bg-gray-600"
                                    >
                                        + Add Item
                                    </button>
                                </div>

                                {formData.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2">
                                        <div className="col-span-5">
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                className="w-full px-2 py-1 border rounded text-gray-900 placeholder-gray-500"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                                className="w-full px-2 py-1 border rounded text-gray-900 placeholder-gray-500"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                value={item.unitPrice}
                                                onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                                                className="w-full px-2 py-1 border rounded text-gray-900 placeholder-gray-500"
                                            />
                                        </div>
                                        <div className="col-span-2 flex items-center gap-2">
                                            <span className="text-sm text-gray-900">₦{item.total}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeLineItem(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount Paid (₦)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.amountPaid}
                                        onChange={(e) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                amountPaid: Number(e.target.value)
                                            }));
                                            calculateTotals();
                                        }}
                                        className="w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500"
                                    />
                                </div>
                                <div className="text-right space-y-1 text-gray-900 font-medium">
                                    <p>Subtotal: ₦{formData.subtotal}</p>
                                    <p>Balance: ₦{formData.balance}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#333333] text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                                >
                                    Generate Receipt
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 border-gray-400 text-gray-600 border-2 rounded-lg hover:bg-gray-600 hover:text-white"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    {showPreview && (
                        <div className="bg-white p-6 rounded-xl shadow-lg overflow-auto">
                            <div
                                ref={receiptRef}
                                className="bg-white mx-auto"
                                style={{
                                    width: '210mm',
                                    minHeight: '297mm',
                                    padding: '20mm',
                                    margin: '0 auto',
                                    boxSizing: 'border-box',
                                    backgroundColor: 'white',
                                    fontFamily: "'Arial', sans-serif",
                                    border: '1px solid #eee'
                                }}
                            >
                                <div className="text-center mb-12">
                                    <div className="mb-4">
                                        <Image
                                            src="/logo.png" // Make sure this path points to your logo in the public folder
                                            alt="Cepoka Logo"
                                            width={120}
                                            height={120}
                                            className="mx-auto"
                                        />
                                    </div>
                                    <h2 className="text-4xl font-bold text-gray-800 mb-2">CEPOKA</h2>
                                    <p className="text-xl font-medium text-gray-700 mb-4">BEAUTY HUB</p>
                                    <div
                                        className="w-48 mx-auto mb-4"
                                        style={{
                                            height: '4px',
                                            background: 'linear-gradient(to right, #ff69b4, #4a90e2)',
                                            borderRadius: '2px'
                                        }}
                                    ></div>
                                    <p className="text-lg font-semibold text-gray-700">Official Receipt</p>
                                    <p className="text-sm text-gray-600 mt-2">Receipt No: {formData.receiptNumber}</p>
                                    <p className="text-sm text-gray-600">{getCurrentDate()}</p>
                                </div>

                                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-gray-800 mb-1"><strong className="font-semibold">Customer:</strong> {formData.customerName}</p>
                                    <p className="text-gray-800"><strong className="font-semibold">Tel:</strong> {formData.whatsapp}</p>
                                </div>

                                <table className="w-full mb-8">
                                    <thead>
                                        <tr className="border-y-2 border-gray-800">
                                            <th className="py-3 text-left text-sm font-bold text-gray-800 px-2">Description</th>
                                            <th className="py-3 text-right text-sm font-bold text-gray-800 px-2">Qty</th>
                                            <th className="py-3 text-right text-sm font-bold text-gray-800 px-2">Price</th>
                                            <th className="py-3 text-right text-sm font-bold text-gray-800 px-2">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.items.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-200">
                                                <td className="py-3 text-gray-800 px-2">{item.description}</td>
                                                <td className="py-3 text-right text-gray-800 px-2">{item.quantity}</td>
                                                <td className="py-3 text-right text-gray-800 px-2">₦{item.unitPrice.toLocaleString()}</td>
                                                <td className="py-3 text-right text-gray-800 px-2">₦{item.total.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="border-t-2 border-gray-800 pt-4 px-2">
                                    <div className="flex justify-between text-gray-800 mb-2">
                                        <strong className="font-semibold">Subtotal:</strong>
                                        <span>₦{formData.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-800 mb-2">
                                        <strong className="font-semibold">Amount Paid:</strong>
                                        <span>₦{formData.amountPaid.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-800 font-bold text-lg mt-4 pt-2 border-t border-gray-300">
                                        <strong>Balance:</strong>
                                        <span>₦{formData.balance.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="mt-12 pt-8 border-t border-gray-300 text-center">
                                    <p className="text-gray-600 mb-1">Thank you for your patronage!</p>
                                    <p className="text-gray-600">Follow us on Instagram: @cepoka</p>
                                    <div className="mt-4 text-xs text-gray-500">
                                        This is a computer-generated receipt and requires no signature.
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={downloadPDF}
                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                >
                                    Download PDF
                                </button>
                                <button
                                    onClick={sendWhatsApp}
                                    className="flex-1 bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#128C7E]"
                                >
                                    Send WhatsApp
                                </button>
                                <button
                                    onClick={startNewReceipt}
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    New Receipt
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReceiptSender;
