'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Offline() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check if the user is offline
    setIsOffline(!navigator.onLine);

    // Add event listeners for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-4">
      <div className="w-24 h-24 mb-6 relative">
        <Image 
          src="/icons/sitelogo.png" 
          alt="Cepoka Logo" 
          fill
          style={{ objectFit: 'contain' }}
        />
      </div>
      <h1 className="text-2xl font-bold mb-2">You're offline</h1>
      <p className="text-gray-600 mb-6 text-center">
        Please check your internet connection and try again.
      </p>
      <Link 
        href="/"
        className="bg-black text-white px-6 py-3 rounded-lg font-medium"
      >
        Retry
      </Link>
    </div>
  );
}
