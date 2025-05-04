"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface BackArrowProps {
  href?: string;
  className?: string;
  onClick?: () => void;
}

export default function BackArrow({ href, className = "", onClick }: BackArrowProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (!href) {
      router.back();
    }
  };

  const arrowSvg = (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={`h-6 w-6 ${className}`} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={1.5}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M10 19l-7-7m0 0l7-7m-7 7h18" 
      />
    </svg>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center justify-center w-8 h-8 text-gray-700 hover:text-black transition-all duration-200"
        aria-label="Go back"
      >
        {arrowSvg}
      </Link>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="cursor-pointer p-2"
      onClick={handleClick}
    >
      {arrowSvg}
    </motion.div>
  );
}
