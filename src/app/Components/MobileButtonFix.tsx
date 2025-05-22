"use client";

import { useEffect } from 'react';

/**
 * This component fixes mobile button clickability issues by adding
 * appropriate touch event handling to all interactive elements.
 */
export default function MobileButtonFix() {
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Add global CSS for mobile touch feedback
    const style = document.createElement('style');
    style.innerHTML = `
      @media (max-width: 768px) {
        a, button, [role="button"], .cursor-pointer {
          cursor: pointer !important;
          -webkit-tap-highlight-color: rgba(0,0,0,0.1) !important;
          touch-action: manipulation !important;
        }

        a:active, button:active, [role="button"]:active, .cursor-pointer:active {
          opacity: 0.7 !important;
          transform: scale(0.98) !important;
          transition: transform 0.1s, opacity 0.1s !important;
        }

        /* Fix for back buttons */
        a[href^="/"], a[href^="../"], a[href^="./"] {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          position: relative !important;
          z-index: 10 !important;
        }

        /* Fix for mobile menu */
        #mobile-menu-container:not(.open) {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }

        /* Fix for nav z-index */
        nav.fixed {
          z-index: 1000 !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Function to add touch-friendly attributes to interactive elements
    const enhanceInteractiveElements = () => {
      // Target all buttons, links, and elements with onClick handlers
      const interactiveElements = document.querySelectorAll('button, a, [role="button"], .cursor-pointer');

      interactiveElements.forEach(element => {
        // Add touch-action manipulation to make elements more responsive on touch devices
        element.setAttribute('style', `${element.getAttribute('style') || ''} touch-action: manipulation !important; -webkit-tap-highlight-color: rgba(0,0,0,0.1) !important;`);

        // Add tabindex if not present to ensure focusability
        if (!element.hasAttribute('tabindex')) {
          element.setAttribute('tabindex', '0');
        }

        // Add specific fixes for back buttons
        if (element.tagName.toLowerCase() === 'a' &&
          (element.textContent?.includes('Back') ||
            element.innerHTML?.includes('svg') && element.getAttribute('href')?.includes('/'))) {

          // Force the element to be clickable
          element.style.pointerEvents = 'auto !important';
          element.style.position = 'relative !important';
          element.style.zIndex = '10 !important';

          // Add click event listener as a fallback
          element.addEventListener('click', (e) => {
            const href = element.getAttribute('href');
            if (href) {
              e.preventDefault();
              window.location.href = href;
            }
          });
        }
      });
    };

    // Run initially
    enhanceInteractiveElements();

    // Set up a mutation observer to handle dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          enhanceInteractiveElements();
        }
      });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });

    // Add global touch event handlers
    document.addEventListener('touchstart', function (e) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('cursor-pointer')) {
        target.style.opacity = '0.7';
        target.style.transform = 'scale(0.98)';
      }
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('cursor-pointer')) {
        target.style.opacity = '1';
        target.style.transform = 'scale(1)';
      }
    }, { passive: true });

    // Cleanup
    return () => {
      observer.disconnect();
      document.head.removeChild(style);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
