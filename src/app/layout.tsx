import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./Components/Nav";
import { ActiveLinkProvider } from "./context/ActiveLinkContext";
import { Toaster } from 'react-hot-toast';
import PWA from './pwa';
import InstallPrompt from './Components/InstallPrompt';
import Offline from './offline';

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cepoka Beauty Hub",
  description: "Your one-stop shop for beauty equipment and supplies",
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      }
    ],
    apple: [
      {
        url: "/favicon.svg",
        sizes: "180x180",
        type: "image/svg+xml",
      }
    ],
    shortcut: [
      {
        url: "/favicon.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      }
    ],
  },
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cepoka Beauty Hub",
    startupImage: [
      {
        url: "/favicon.svg",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    minimumScale: 1,
  },
  applicationName: "Cepoka Beauty Hub",
  formatDetection: {
    telephone: false,
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#ffffff",
    "msapplication-tap-highlight": "no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} font-[600] antialiased`}>
        <ActiveLinkProvider>
          {/* Nav */}
          <Nav />
          {children}
          {/* Footer */}
          <Toaster />
          <PWA />
          <InstallPrompt />
          <Offline />
        </ActiveLinkProvider>
      </body>
    </html>
  );
}
