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
    icon: "/icons/sitelogo.png",
    apple: "/icons/sitelogo.png",
  },
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cepoka Beauty Hub",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  applicationName: "Cepoka Beauty Hub",
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
