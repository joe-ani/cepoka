"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface SpinningLoaderProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  text?: string;
}

const SpinningLoader: React.FC<SpinningLoaderProps> = ({ 
  size = 'medium', 
  className = '',
  text
}) => {
  // Size mapping
  const sizeMap = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4',
  };

  const sizeClass = sizeMap[size];
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClass} rounded-full border-t-pink-500 border-r-blue-500 border-b-pink-500 border-l-blue-500`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ borderStyle: 'solid' }}
      />
      {text && (
        <p className="mt-3 text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
};

export default SpinningLoader;
