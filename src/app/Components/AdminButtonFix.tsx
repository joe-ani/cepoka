"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * This component specifically fixes button clickability issues in the admin pages
 */
export default function AdminButtonFix() {
  const pathname = usePathname();

  // Only run on admin pages
  const isAdminPage = pathname?.includes('/admin');

  useEffect(() => {
    if (!isAdminPage || typeof window === 'undefined') return;

    console.log('AdminButtonFix: Applying fixes to admin buttons');

    // Add special CSS for admin pages
    const style = document.createElement('style');
    style.innerHTML = `
      /* Fix for admin pages */
      body {
        /* Ensure the body doesn't have any properties that might interfere with clicking */
        touch-action: manipulation !important;
      }

      /* Make sure all buttons in admin pages are clickable */
      .admin-page a[href^="/admin"],
      .admin-page a[href="/"],
      .admin-page button[type="submit"],
      .admin-page button[type="button"],
      a[href^="/admin"],
      a[href="/admin"] {
        position: relative !important;
        z-index: 200 !important;
        pointer-events: auto !important;
        touch-action: manipulation !important;
        -webkit-tap-highlight-color: rgba(0,0,0,0.2) !important;
        cursor: pointer !important;
      }

      /* Add visual feedback for touch */
      .admin-page a:active,
      .admin-page button:active,
      .admin-page [role="button"]:active,
      .admin-page .cursor-pointer:active,
      a[href^="/admin"]:active,
      a[href="/admin"]:active {
        opacity: 0.7 !important;
        transform: scale(0.97) !important;
        transition: transform 0.1s, opacity 0.1s !important;
      }

      /* Fix for back buttons */
      .admin-page a[href^="/"],
      .admin-page a[href^="../"],
      .admin-page a[href^="./"] {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      /* Fix for the nav bar blocking clicks */
      nav.fixed {
        z-index: 9999 !important;
      }
    `;
    document.head.appendChild(style);

    // Add admin-page class to body when on admin pages
    document.body.classList.add('admin-page');

    // Function to fix admin buttons
    const fixAdminButtons = () => {
      // Fix back buttons
      const backButtons = document.querySelectorAll('a[href^="/admin"], a[href="/"]');
      backButtons.forEach(button => {
        const href = button.getAttribute('href');
        if (!href) return;

        // Add click event listener as a fallback
        button.addEventListener('click', (e) => {
          if (window.innerWidth < 768) {
            e.preventDefault();
            e.stopPropagation();
            console.log('AdminButtonFix: Redirecting to', href);
            window.location.href = href;
          }
        });
      });
    };

    // Run initially
    fixAdminButtons();

    // Set up a mutation observer to handle dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          fixAdminButtons();
        }
      });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup
    return () => {
      observer.disconnect();
      document.head.removeChild(style);
      document.body.classList.remove('admin-page');
    };
  }, [isAdminPage]);

  return null;
}
