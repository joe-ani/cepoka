'use client';

import { useState, useEffect } from 'react';
import MediaCarousel from './MediaCarousel';

const ShowcaseCarousel = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Define the media items for the carousel
  const mediaItems = [
    {
      type: 'image' as const,
      src: '/images/sho1.jpg',
      alt: 'Showcase 1'
    },
    {
      type: 'image' as const,
      src: '/images/sho2.jpg',
      alt: 'Showcase 2'
    },
    {
      type: 'image' as const,
      src: '/images/sho3.jpg',
      alt: 'Showcase 3'
    }
  ];
  
  // Set loaded state after component mounts
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  return (
    <div className="w-full relative overflow-hidden rounded-lg shadow-lg">
      {/* Carousel container with fixed aspect ratio */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
        <div className="absolute inset-0">
          {isLoaded && (
            <MediaCarousel 
              items={mediaItems} 
              interval={5000} 
            />
          )}
        </div>
      </div>
      
      {/* Optional overlay content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-black/30 p-6 rounded-lg max-w-md text-center pointer-events-auto">
          <h2 className="text-white text-2xl font-bold mb-2">Cepoka Beauty Hub</h2>
          <p className="text-white/90">
            Discover our premium collection of beauty equipment and supplies
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShowcaseCarousel;
