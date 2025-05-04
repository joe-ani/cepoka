'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  alt?: string;
}

interface MediaCarouselProps {
  items: MediaItem[];
  interval?: number; // Time in ms between transitions
  className?: string;
}

const MediaCarousel = ({ items, interval = 5000, className = '' }: MediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Set up the automatic rotation
  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
        setIsTransitioning(false);
      }, 500); // Half a second for the fade out effect
    }, interval);

    return () => clearInterval(timer);
  }, [items.length, interval]);

  // Handle video playback
  useEffect(() => {
    const currentItem = items[currentIndex];
    if (currentItem.type === 'video') {
      const videoElement = videoRefs.current[currentIndex];
      if (videoElement) {
        videoElement.currentTime = 0;
        videoElement.play().catch(error => {
          console.error('Error playing video:', error);
        });
      }
    }
  }, [currentIndex, items]);

  // Render nothing if no items
  if (items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div className={`relative overflow-hidden w-full h-full ${className}`}>
      {/* Dim overlay for transition */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 bg-black z-10"
          />
        )}
      </AnimatePresence>

      {/* Media items */}
      <div className="relative w-full h-full">
        {items.map((item, index) => (
          <div
            key={`${item.src}-${index}`}
            className={`absolute inset-0 transition-opacity duration-500 ${index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
          >
            {item.type === 'image' ? (
              <div className="relative w-full h-full overflow-hidden">
                <motion.div
                  className="absolute w-full h-[120%]" // Extra height for animation
                  initial={{ y: 0 }}
                  animate={index === currentIndex ? {
                    y: ['0%', '-10%', '0%'],
                    scale: [1, 1.05, 1],
                    transition: {
                      y: { duration: 15, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" },
                      scale: { duration: 15, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }
                    }
                  } : { y: 0, scale: 1 }}
                >
                  <Image
                    src={item.src}
                    alt={item.alt || `Slide ${index + 1}`}
                    fill
                    sizes="100vw"
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                    priority={index === 0}
                  />
                </motion.div>
              </div>
            ) : (
              <div className="relative w-full h-full overflow-hidden">
                <motion.div
                  className="absolute w-full h-[120%]" // Extra height for animation
                  initial={{ y: 0 }}
                  animate={index === currentIndex ? {
                    y: ['0%', '-10%', '0%'],
                    scale: [1, 1.05, 1],
                    transition: {
                      y: { duration: 15, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" },
                      scale: { duration: 15, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }
                    }
                  } : { y: 0, scale: 1 }}
                >
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={item.src}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center' }}
                    muted
                    playsInline
                    loop
                  />
                </motion.div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      {items.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsTransitioning(false);
                }, 500);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/50 hover:bg-white/70'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;
