'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccess: (key: string) => void;
}

export default function AdminAccessModal({ isOpen, onClose, onAccess }: AdminAccessModalProps) {
  const [adminKey, setAdminKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset admin key when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setAdminKey('');
    }
  }, [isOpen]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      // Store the current scroll position
      const scrollPos = window.scrollY;

      // Prevent background scrolling in a less intrusive way
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      // Add a high z-index to the modal container
      const modalContainer = document.getElementById('admin-modal-container');
      if (modalContainer) {
        modalContainer.style.zIndex = '9999';
      }

      return () => {
        // Restore background scrolling
        document.body.style.overflow = originalStyle || '';

        // Restore scroll position to prevent jumping
        setTimeout(() => {
          window.scrollTo(0, scrollPos);
        }, 0);
      };
    }

    return undefined;
  }, [isOpen]);

  const handleSubmit = useCallback(() => {
    // Pass the admin key to the parent component
    if (adminKey.trim() !== '') {
      setIsLoading(true);

      // Directly check if the key is correct
      if (adminKey === 'cepoka101') {
        console.log("Correct admin key entered in modal:", adminKey);
      }

      // Simulate a slight delay for authentication
      setTimeout(() => {
        onAccess(adminKey);
        // Note: We don't set isLoading to false here because the modal will be closed
        // or the parent component will handle the error state
      }, 800);
    }
  }, [adminKey, onAccess]);

  // Function to cancel verification process
  const handleCancel = useCallback(() => {
    if (isLoading) {
      setIsLoading(false);
      console.log("Verification process cancelled");
    } else {
      onClose();
    }
  }, [isLoading, onClose]);

  // Focus the input field when the modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Short delay to ensure the modal is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle Enter key press
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleSubmit();
      }
    };

    if (isOpen && typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, handleSubmit]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="admin-modal-container"
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          style={{
            height: '100%',
            width: '100%',
            position: 'fixed',
            top: 0,
            left: 0,
            touchAction: 'manipulation', // Better touch handling
            userSelect: 'none', // Prevent text selection
            pointerEvents: 'auto' // Ensure pointer events are enabled
          }}
        >
          <motion.div
            className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-[320px] sm:max-w-md relative"
            initial={{ scale: 0.8, y: 0 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 0 }}
            style={{
              position: 'relative',
              pointerEvents: 'auto',
              touchAction: 'manipulation',
              zIndex: 10000
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <h3 className="text-gray-800 font-bold text-lg mb-3 sm:mb-4">Admin Access</h3>

            <input
              ref={inputRef}
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter admin key"
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg mb-3 sm:mb-4 font-[500] text-black ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              disabled={isLoading}
              style={{ touchAction: 'manipulation' }}
            />

            <div className="flex justify-end space-x-2 sm:space-x-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCancel();
                }}
                className={`px-3 sm:px-4 py-2 font-[500] ${isLoading
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'text-gray-600 hover:text-gray-800'}
                  transition-colors duration-200 rounded-lg`}
                style={{ touchAction: 'manipulation' }}
              >
                {isLoading ? 'Stop Verification' : 'Cancel'}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit();
                }}
                disabled={isLoading}
                className={`px-3 sm:px-4 py-2 font-[500] bg-[#333333] text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 ${isLoading ? 'opacity-90' : ''
                  }`}
                style={{ touchAction: 'manipulation' }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Access'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
