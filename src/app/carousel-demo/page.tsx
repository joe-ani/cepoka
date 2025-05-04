'use client';

import MediaCarousel from '../Components/MediaCarousel';
import EnhancedMediaCarousel from '../Components/EnhancedMediaCarousel';
import Link from 'next/link';

export default function CarouselDemo() {
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
    },
    // You can add videos like this:
    // {
    //   type: 'video' as const,
    //   src: '/videos/sample.mp4'
    // }
  ];

  // Enhanced media items with titles and descriptions
  const enhancedMediaItems = [
    {
      type: 'image' as const,
      src: '/images/sho1.jpg',
      alt: 'Showcase 1',
      title: 'Premium Beauty Equipment',
      description: 'High-quality salon and spa equipment for professionals'
    },
    {
      type: 'image' as const,
      src: '/images/sho2.jpg',
      alt: 'Showcase 2',
      title: 'Modern Designs',
      description: 'Contemporary aesthetics that elevate your space'
    },
    {
      type: 'image' as const,
      src: '/images/sho3.jpg',
      alt: 'Showcase 3',
      title: 'Complete Solutions',
      description: 'Everything you need for your beauty business'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 pt-32 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 flex items-center">
          <Link
            href="/"
            className="inline-flex items-center text-gray-700 hover:text-black transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-gray-900">Media Carousel Demo</h1>

        {/* Basic Carousel */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-12">
          {/* Carousel container with fixed aspect ratio */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
            <div className="absolute inset-0">
              <MediaCarousel
                items={mediaItems}
                interval={5000}
                className="rounded-t-lg"
              />
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Basic Dim Fade Carousel</h2>
            <p className="text-gray-600">
              This carousel features a smooth dim fade transition between images and videos.
              Images and videos have a subtle panning animation that adds visual interest.
            </p>

            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="text-md font-medium mb-2">Features:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>Smooth dim fade transitions between media</li>
                <li>Ken Burns-style panning and zooming animation</li>
                <li>Support for both images and videos</li>
                <li>Automatic rotation with configurable interval</li>
                <li>Navigation dots for manual control</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Enhanced Carousel */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Carousel container with fixed aspect ratio */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
            <div className="absolute inset-0">
              <EnhancedMediaCarousel
                items={enhancedMediaItems}
                interval={6000}
                className="rounded-t-lg"
                showCaptions={true}
                showControls={true}
                autoPlay={true}
                dimOpacity={0.7}
              />
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Enhanced Media Carousel</h2>
            <p className="text-gray-600">
              This enhanced version adds captions, navigation arrows, and play/pause controls.
              It maintains the same smooth transitions and animations as the basic version.
            </p>

            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="text-md font-medium mb-2">Additional Features:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>Title and description captions</li>
                <li>Navigation arrows for easier browsing</li>
                <li>Play/pause button to control the slideshow</li>
                <li>Keyboard navigation support (arrow keys and spacebar)</li>
                <li>Configurable dim opacity for transitions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
