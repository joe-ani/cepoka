'use client';

import { useState, useEffect } from 'react';

// Define types for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Declare the event for TypeScript
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    if (!isStandalone) {
      // Listen for the beforeinstallprompt event (works on Android/Chrome)
      const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        setDeferredPrompt(e);
        // Show the install prompt
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    return undefined;
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const closePrompt = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg z-50 flex justify-between items-center">
      <div>
        <p className="font-medium">Install Cepoka Beauty Hub</p>
        <p className="text-sm text-gray-600">
          {isIOS
            ? 'Tap the share button and select "Add to Home Screen"'
            : 'Install this app on your device for quick access'}
        </p>
      </div>
      <div className="flex gap-2">
        {!isIOS && (
          <button
            onClick={handleInstallClick}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Install
          </button>
        )}
        <button
          onClick={closePrompt}
          className="border border-gray-300 px-4 py-2 rounded-lg"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
