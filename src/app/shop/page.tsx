"use client";

import { Suspense, useEffect } from 'react'
import ShopContent from './ShopContent'
import SpinningLoader from '../Components/SpinningLoader'

export default function ShopPage() {
  // Add effect to handle the category selection from URL hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if we have a hash parameter indicating we should select a category
      if (window.location.hash === '#select-category') {
        // Get the category from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = urlParams.get('category');

        if (categoryId) {
          console.log('Shop page: Found category in URL with select-category hash:', categoryId);

          // Find the category element by ID
          setTimeout(() => {
            const categorySelector = `.categories-section [data-category-id="${categoryId}"]`;
            const categoryElement = document.querySelector(categorySelector);
            if (categoryElement) {
              (categoryElement as HTMLElement).click();
            } else {
              console.log('Could not find category element with selector:', categorySelector);
            }
          }, 500); // Give time for the categories to load
        }
      }
    }
  }, []);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <SpinningLoader size="large" text="Loading shop..." />
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}