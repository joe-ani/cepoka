"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

const ContactForm = () => {
    const [message, setMessage] = React.useState("");

    const handleSendMessage = () => {
        if (message.trim()) {
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/2347016027618?text=${encodedMessage}`, '_blank');
            setMessage(""); // Clear the input after sending
        }
    };

    return (
        // Add new styling
        <div className="flex flex-col md:flex-row justify-around relative bg-gradient-to-b from-[#ededed] to-transparent p-4 rounded-[20px] md:rounded-[50px] m-4 md:m-11 md:p-10">
            {/* WhatsApp Section */}
            <motion.div
                className="flex flex-col p-4 md:p-20 space-y-4 md:space-y-14"
                initial={{ x: -100, opacity: 0 }} // Initial state: slide in from the left and invisible
                whileInView={{ x: 0, opacity: 1 }} // Animate to: slide to position and become visible
                transition={{ duration: 0.6 }} // Animation duration
                viewport={{ once: true }} // Trigger animation only once
            >
                <div className="flex flex-col">
                    <div className="font-medium text-xs md:text-base text-black">Send us a.</div>
                    <div className="text-lg md:text-2xl text-black">Whatsapp Message</div>
                </div>

                <motion.div
                    className="w-full md:w-[550px] h-[80px] md:h-[150px] bg-[#d4d4d4] border-2 border-white rounded-[10px] md:rounded-[20px] relative flex flex-col justify-end p-3 md:p-4"
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                >
                    <div className="flex items-center w-full">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-black placeholder-black text-xs md:text-base font-thin"
                            placeholder="Type your message..."
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                        />
                        <motion.div
                            onClick={handleSendMessage}
                            className="ml-2 cursor-pointer"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Image className="object-contain w-6 md:w-8" width={32} height={32} src="/icons/share.png" alt="send" />
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Social Media Section */}
            <motion.div
                className="flex flex-col p-4 md:p-20 space-y-4 md:space-y-14"
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }} // Animation duration
                viewport={{ once: true }} // Trigger animation only once
            >
                <div className="flex flex-col">
                    <div className="font-medium text-xs md:text-base text-black">Follow us via.</div>
                    <div className="text-lg md:text-2xl text-black">Our Social Media</div>
                </div>

                <motion.div
                    className="w-full md:w-[350px] h-[180px] md:h-[250px] bg-[#d4d4d4] border-2 border-white rounded-[10px] md:rounded-[20px] p-3 md:p-6 space-y-3 md:space-y-6"
                    initial={{ scale: 0.9, opacity: 0 }} // Initial state: slightly smaller and invisible
                    whileInView={{ scale: 1, opacity: 1 }} // Animate to: full size and visible
                    transition={{ duration: 0.6, delay: 0.3 }} // Animation duration with delay
                    viewport={{ once: true }} // Trigger animation only once
                >
                    {/* instagram */}
                    <motion.a
                        href="https://www.instagram.com/d_fugo_hair"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 md:space-x-4 p-2 rounded cursor-pointer"
                        whileHover={{ scale: 1.05, backgroundColor: "#d3d3d3" }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Image className="object-contain w-4 md:w-5" width={20} height={20} src="/icons/instagram.png" alt="instagram" />
                        <div className="font-normal text-xs md:text-base">@d_fugo_hair</div>
                    </motion.a>
                    <motion.div className="w-full h-[1px] bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}></motion.div>
                    {/* tiktok */}
                    <motion.a
                        href="https://www.tiktok.com/@d_fugo_hair"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 md:space-x-4 p-2 rounded cursor-pointer"
                        whileHover={{ scale: 1.05, backgroundColor: "#d3d3d3" }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Image className="object-contain w-4 md:w-5" width={20} height={20} src="/icons/tiktok.png" alt="tiktok" />
                        <div className="font-normal text-xs md:text-base">@d_fugo_hair</div>
                    </motion.a>
                    <motion.div className="w-full h-[1px] bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}></motion.div>
                    {/* whatsapp */}
                    <motion.a
                        href="https://wa.me/2347016027618?text=Hello!%20I'm%20interested%20in%20your%20wigs.%20"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 md:space-x-4 p-2 rounded cursor-pointer"
                        whileHover={{ scale: 1.05, backgroundColor: "#d3d3d3" }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Image className="object-contain w-4 md:w-5" width={20} height={20} src="/icons/whatsapp.png" alt="whatsapp" />
                        <div className="font-normal text-xs md:text-base">@d_fugo_hair</div>
                    </motion.a>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ContactForm;