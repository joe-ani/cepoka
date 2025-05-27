"use client"
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from "react";
import AdminAccessModal from './AdminAccessModal';
import toast from 'react-hot-toast';
import LoadingScreen from './LoadingScreen';
import * as ReactDOM from 'react-dom/client';

const Footer = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [showAdminPrompt, setShowAdminPrompt] = useState(false);
    const [adminKey, setAdminKey] = useState('');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        // Define handleAdminAccess inside the useEffect to avoid dependency issues
        const handleAdminAccess = () => {
            if (!isMounted || typeof window === 'undefined') return;

            try {
                // Get the current value directly from state
                const currentKey = adminKey;
                console.log("Checking admin key:", currentKey);

                // Hardcoded comparison with the exact string
                if (currentKey === "cepoka101") {
                    console.log("Admin key is valid, setting localStorage and redirecting");
                    // Store the exact string
                    localStorage.setItem('adminKey', "cepoka101");
                    // Redirect to admin page
                    window.location.href = '/admin';
                } else {
                    console.log("Invalid admin key:", currentKey);
                    alert('Invalid admin key');
                    setAdminKey('');
                }
            } catch (error) {
                console.error('Error accessing admin:', error);
                alert('An error occurred');
            }
        };

        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                handleAdminAccess();
            }
        };

        if (showAdminPrompt && typeof window !== 'undefined') {
            window.addEventListener('keydown', handleKeyPress);
            return () => window.removeEventListener('keydown', handleKeyPress);
        }
    }, [showAdminPrompt, isMounted, adminKey]);

    const handleGetDirections = () => {
        if (!isMounted || typeof window === 'undefined') return;
        try {
            window?.open(`https://www.google.com/maps/search/?api=1&query=6.456559134970387,3.3842979366622847`);
        } catch (error) {
            console.error('Error getting directions:', error);
            alert('An error occurred');
        }
    };

    const handleCloseModal = () => {
        setShowAdminPrompt(false);
        setAdminKey('');
    };

    return (
        <footer className="relative w-full bg-[#ededed] text-black pt-24 pb-6 font-light mt-auto">
            {/* Top fade gradient */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white via-[#ededed]/50 to-[#ededed] z-10" />

            <AdminAccessModal
                isOpen={showAdminPrompt}
                onClose={handleCloseModal}
                onAccess={(key) => {
                    console.log("Received admin key:", key);

                    // Direct check without using state
                    if (key === "cepoka101") {
                        console.log("Valid admin key, redirecting...");
                        localStorage.setItem('adminKey', "cepoka101");

                        // Add the LoadingScreen component to the DOM
                        const loadingScreenContainer = document.createElement('div');
                        loadingScreenContainer.id = 'admin-loading-screen';
                        document.body.appendChild(loadingScreenContainer);

                        // Render the LoadingScreen component
                        const root = ReactDOM.createRoot(loadingScreenContainer);
                        root.render(
                            <LoadingScreen message="Accessing Admin Panel..." isFullScreen={true} />
                        );

                        // Add a slight delay before redirecting to show the loading state
                        setTimeout(() => {
                            // Clean up the loading screen container before navigation
                            const loadingScreenContainer = document.getElementById('admin-loading-screen');
                            if (loadingScreenContainer) {
                                document.body.removeChild(loadingScreenContainer);
                            }
                            window.location.href = '/admin';
                        }, 800);
                    } else {
                        console.log("Invalid admin key:", key);
                        // Add a slight delay before showing the alert to make the loading state visible
                        setTimeout(() => {
                            toast.error('Invalid admin key', {
                                duration: 3000,
                                position: 'top-center',
                                style: {
                                    background: '#FEE2E2',
                                    color: '#B91C1C',
                                    fontWeight: 'bold'
                                },
                            });
                        }, 500);
                    }
                }}
            />
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Logo and Description */}
                    <div className="flex flex-col space-y-4">
                        <Image
                            src="/logo.png"
                            alt="DFugo Hair"
                            width={50}
                            height={60}
                            className="mb-4"
                        />
                        <p className="text-black text-sm font-light">
                            Premium quality hair products and accessories for all your styling needs.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="/" className="text-black hover:text-black transition font-light">Home</Link></li>
                            <li><Link href="/shop" className="text-black hover:text-black transition font-light">Shop</Link></li>
                            <li><Link href="/about" className="text-black hover:text-black transition font-light">About Us</Link></li>
                            <li><Link href="/contact" className="text-black hover:text-black transition font-light">Contact</Link></li>
                            <li>
                                <button
                                    onClick={() => setShowAdminPrompt(true)}
                                    className="text-black hover:text-white transition font-light text-left w-full"
                                >
                                    Admin
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Contact Us</h3>
                        <ul onClick={handleGetDirections} className="space-y-2 text-black font-light cursor-pointer">
                            10, Balogun street<br />
                            Lagos Island, Lagos Nigeria
                        </ul>
                    </div>

                    {/* Social Media - temporary version without icons */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-black hover:text-white transition">
                                FB
                            </a>
                            <a href="https://www.tiktok.com/@d_fugo_hair" target="_blank" rel="noopener noreferrer" className="text-black hover:text-white transition">
                                TK
                            </a>
                            <a href="https://www.instagram.com/d_fugo_hair" target="_blank" rel="noopener noreferrer" className="text-black hover:text-white transition">
                                IG
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-black-300 mt-8 pt-6 text-center text-gray-400 text-sm font-light">
                    <p>&copy; {new Date().getFullYear()} DFugo Hair. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
