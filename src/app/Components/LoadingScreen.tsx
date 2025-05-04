'use client';

import { motion } from 'framer-motion';
import SpinningLoader from './SpinningLoader';

interface LoadingScreenProps {
  message?: string;
  isFullScreen?: boolean;
}

export default function LoadingScreen({ 
  message = 'Loading...', 
  isFullScreen = true 
}: LoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col items-center justify-center bg-white bg-opacity-90 z-[9999] ${
        isFullScreen ? 'fixed inset-0' : 'absolute inset-0'
      }`}
    >
      <div className="text-center p-6 rounded-lg">
        <SpinningLoader size="large" />
        <p className="mt-4 text-gray-700 font-medium text-lg">{message}</p>
      </div>
    </motion.div>
  );
}
