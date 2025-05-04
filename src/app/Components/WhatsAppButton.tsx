"use client"
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const WhatsAppButton = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const openWhatsApp = () => {
        if (!isMounted || typeof window === 'undefined') return;

        if (message.trim() !== "") {
            const encodedMessage = encodeURIComponent(message);
            const whatsappURL = `https://wa.me/2347016027618?text=${encodedMessage}`;
            window?.open(whatsappURL, "_blank");
            setIsModalOpen(false); // Close modal after sending
            setMessage(""); // Reset message
        } else {
            alert("Please enter a message.");
        }
    };

    return (
        <>
            <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-tr from-[#1E90FF] to-[#FF69B4]  p-2 w-[60px] h-[60px] 
                    md:w-[70px] md:h-[70px] rounded-full fixed bottom-[20px] right-[20px] 
                    flex items-center justify-center shadow-lg cursor-pointer z-[999]
                    hover:shadow-xl transition-shadow duration-300"
                style={{
                    willChange: 'transform',
                    transform: 'translate3d(0, 0, 0)',
                }}
            >
                <Image 
                    width={25} 
                    height={25} 
                    className="w-[60%] h-[60%] object-contain" 
                    src={"/icons/message.png"} 
                    alt={"WhatsApp message"} 
                />
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center 
                            justify-center z-[1000] p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            ref={modalRef}
                            className="bg-white rounded-lg w-[90%] max-w-md p-4 sm:p-6 
                                shadow-lg relative"
                            variants={{
                                hidden: { opacity: 0, scale: 0.8, y: 10 },
                                visible: { 
                                    opacity: 1, 
                                    scale: 1, 
                                    y: 0,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 25
                                    }
                                },
                                exit: {
                                    opacity: 0,
                                    scale: 0.8,
                                    y: 10,
                                    transition: { duration: 0.2 }
                                }
                            }}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-2 right-2 text-gray-600 hover:text-black 
                                    p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                ✕
                            </button>
                            <div className="mt-4">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="w-full h-32 p-3 border border-gray-300 rounded-lg 
                                        focus:ring-2 focus:ring-yellow-500 focus:border-transparent
                                        resize-none"
                                />
                                <button
                                    onClick={openWhatsApp}
                                    className="w-full mt-4 bg-gradient-to-r from-[#fe8ef3] to-[#4782ff]
                                        text-white font-medium py-2 px-4 rounded-lg
                                        hover:opacity-90 transition-opacity"
                                >
                                    Send Message
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default WhatsAppButton;
