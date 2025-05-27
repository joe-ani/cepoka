"use client"
import { motion } from "framer-motion"
import Image from "next/image"
import BackArrow from "../Components/BackArrow"
import { useState, useEffect } from "react"
import ClientMap from '../Components/ClientMap'

export default function ContactPage() {
  // Router is not used in this component
  const targetLocation = { lat: 6.456559134970387, lng: 3.3842979366622847 };
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleGetDirections = () => {
    if (!isMounted || typeof window === 'undefined') return;

    const url = `https://www.google.com/maps/search/?api=1&query=${targetLocation.lat},${targetLocation.lng}`;
    window?.open(url);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white text-[#333333] p-4 pt-20 sm:pt-28">
      <div className="w-full max-w-6xl">
        {/* Simplified Header with only back button */}
        <div className="flex items-center mb-6 mt-4 sm:mt-0">
          <BackArrow className="text-gray-700" />
        </div>

        {/* Main Content Container */}
        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          {/* Left Side - Text Content */}
          <div className="flex-1">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">Find us the easy way</h1>

              <div className="space-y-8">
                {/* Store Information */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Visit Our Store</h2>
                  <p className="text-base sm:text-lg text-gray-600">
                    D&apos;Fugo Hair<br />
                    23/24, Balogun street<br />
                    Lagos Island, Lagos Nigeria
                  </p>
                </div>

                {/* Opening Hours */}
                <div className="space-y-2 text-gray-600">
                  <p className="text-sm sm:text-base">Monday - Saturday: 8:00 AM - 1:00 PM</p>
                  <p className="text-sm sm:text-base text-red-400">Sunday: Closed</p>
                  <motion.a
                    href="https://wa.me/2347016027618?text=Hello!%20I'm%20interested%20in%20your%20wigs.%20"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base mt-4 inline-block cursor-pointer hover:text-yellow-500 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    📞 +2348038683235
                  </motion.a>
                </div>

                {/* Get Directions Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleGetDirections}
                  className="flex items-center justify-center space-x-2 bg-[#333333] text-white
                  py-3 px-8 rounded-md hover:opacity-90 transition-opacity text-base sm:text-lg"
                >
                  <span>Get Directions</span>
                  <Image
                    width={20}
                    height={20}
                    src="/icons/location.png"
                    alt="location"
                    className="ml-2"
                  />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Map */}
          <motion.div
            className="flex-1"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#A4A4A4]">
              <ClientMap height="100%" className="absolute inset-0" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}