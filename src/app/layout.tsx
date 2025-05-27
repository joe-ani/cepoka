import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./Components/Nav";
import { ActiveLinkProvider } from "./context/ActiveLinkContext";
import { Toaster } from 'react-hot-toast';
import PWA from './pwa';
import InstallPrompt from './Components/InstallPrompt';

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Cepoka Beauty Hub - Premium Spa, Salon & Beauty Equipment",
    template: "%s | Cepoka Beauty Hub"
  },
  description: "Cepoka Beauty Hub - Your trusted source for premium spa equipment, salon furniture, beauty equipment, facial machines, pedicure chairs, and skincare products. Quality beauty solutions for professionals.",
  keywords: [
    "spa equipment",
    "salon furniture",
    "beauty equipment",
    "facial machines",
    "pedicure chairs",
    "manicure equipment",
    "skincare products",
    "beauty accessories",
    "salon chairs",
    "spa furniture",
    "professional beauty equipment",
    "Cepoka Beauty Hub",
    "beauty supplies Nigeria",
    "spa equipment Lagos"
  ],
  authors: [{ name: "Cepoka Beauty Hub" }],
  creator: "Cepoka Beauty Hub",
  publisher: "Cepoka Beauty Hub",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/sitelogo.png",
  },
  themeColor: "#ffffff",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cepoka.vercel.app",
    siteName: "Cepoka Beauty Hub",
    title: "Cepoka Beauty Hub - Premium Spa, Salon & Beauty Equipment",
    description: "Your trusted source for premium spa equipment, salon furniture, beauty equipment, and professional beauty solutions. Quality products for beauty professionals.",
    images: [
      {
        url: "/icons/sitelogo.png",
        width: 512,
        height: 512,
        alt: "Cepoka Beauty Hub Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cepoka Beauty Hub - Premium Spa, Salon & Beauty Equipment",
    description: "Your trusted source for premium spa equipment, salon furniture, beauty equipment, and professional beauty solutions.",
    images: ["/icons/sitelogo.png"],
    creator: "@cepokabeauty",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // You'll need to add this from Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Cepoka Beauty Hub",
    "description": "Premium spa equipment, salon furniture, beauty equipment, facial machines, pedicure chairs, and skincare products for beauty professionals.",
    "url": "https://cepoka.vercel.app",
    "telephone": "+2348038683235",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Lagos, Nigeria",
      "addressLocality": "Lagos",
      "addressCountry": "NG"
    },
    "openingHours": [
      "Mo-Sa 08:00-13:00"
    ],
    "priceRange": "$$",
    "image": "https://cepoka.vercel.app/icons/sitelogo.png",
    "logo": "https://cepoka.vercel.app/icons/sitelogo.png",
    "sameAs": [
      "https://www.instagram.com/cepokabeauty",
      "https://wa.me/2348038683235"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Beauty Equipment & Supplies",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Spa Equipment",
            "category": "Beauty Equipment"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Salon Furniture",
            "category": "Beauty Equipment"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Facial Machines",
            "category": "Beauty Equipment"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Pedicure Chairs",
            "category": "Beauty Equipment"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Skincare Products",
            "category": "Beauty Products"
          }
        }
      ]
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${geistMono.variable} font-[600] antialiased`}>
        <ActiveLinkProvider>
          {/* Nav */}
          <Nav />
          {children}
          {/* Footer */}
          <Toaster />
          <PWA />
          <InstallPrompt />
          {/* <Offline /> */}
        </ActiveLinkProvider>
      </body>
    </html>
  );
}
