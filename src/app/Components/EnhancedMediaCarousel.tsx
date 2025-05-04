'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  alt?: string;
  title?: string;
  description?: string;
}

interface EnhancedMediaCarouselProps {
  items: MediaItem[];
  interval?: number; // Time in ms between transitions
  className?: string;
  showControls?: boolean;
  showCaptions?: boolean;
  autoPlay?: boolean;
  dimOpacity?: number; // 0 to 1
}

const EnhancedMediaCarousel = ({
  items,
  interval = 5000,
  className = '',
  showControls = true,
  showCaptions = true,
  autoPlay = true,
  dimOpacity = 0.7
}: EnhancedMediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to go to next slide
  const goToNextSlide = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
      setIsTransitioning(false);
    }, 500); // Half a second for the fade out effect
  };

  // Function to go to previous slide
  const goToPrevSlide = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
      setIsTransitioning(false);
    }, 500);
  };

  // Function to go to a specific slide
  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 500);
  };

  // Set up the automatic rotation
  useEffect(() => {
    if (items.length <= 1 || !autoPlay || isPaused) return;

    timerRef.current = setInterval(goToNextSlide, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [items.length, interval, autoPlay, isPaused, isTransitioning, goToNextSlide]);

  // Handle video playback
  useEffect(() => {
    const currentItem = items[currentIndex];

    // Pause all videos first
    videoRefs.current.forEach(video => {
      if (video) {
        video.pause();
      }
    });

    // Play the current video if it's a video
    if (currentItem && currentItem.type === 'video') {
      const videoElement = videoRefs.current[currentIndex];
      if (videoElement) {
        videoElement.currentTime = 0;
        videoElement.play().catch(error => {
          console.error('Error playing video:', error);
        });
      }
    }
  }, [currentIndex, items]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevSlide();
      } else if (e.key === 'ArrowRight') {
        goToNextSlide();
      } else if (e.key === ' ') {
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToPrevSlide, goToNextSlide]);

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
            animate={{ opacity: dimOpacity }}
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
                    ref={(el) => {
                      if (videoRefs.current) {
                        videoRefs.current[index] = el;
                      }
                      return undefined;
                    }}
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

      {/* Captions */}
      {showCaptions && currentItem.title && (
        <div className="absolute bottom-16 left-0 right-0 px-6 py-4 bg-gradient-to-t from-black/70 to-transparent z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-white text-xl font-bold mb-2">{currentItem.title}</h3>
            {currentItem.description && (
              <p className="text-white/90 text-sm">{currentItem.description}</p>
            )}
          </motion.div>
        </div>
      )}

      {/* Navigation arrows */}
      {showControls && items.length > 1 && (
        <>
          <button
            onClick={goToPrevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 z-20 transition-all duration-300"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 z-20 transition-all duration-300"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Play/Pause button */}
      {showControls && autoPlay && items.length > 1 && (
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 z-20 transition-all duration-300"
          aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
        >
          {isPaused ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>
      )}

      {/* Navigation dots */}
      {showControls && items.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
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

export default EnhancedMediaCarousel;
