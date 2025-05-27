import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Cepoka Beauty Hub - Get in Touch for Premium Beauty Equipment",
  description: "Contact Cepoka Beauty Hub for premium spa equipment, salon furniture, and beauty equipment. Located in Lagos, Nigeria. Call +2348038683235 or visit our showroom. Open Monday-Saturday 8AM-1PM.",
  keywords: [
    "contact Cepoka Beauty Hub",
    "beauty equipment Lagos",
    "spa equipment contact",
    "salon furniture Nigeria",
    "beauty equipment showroom",
    "Cepoka Beauty Hub location",
    "beauty equipment supplier contact",
    "spa equipment Lagos contact"
  ],
  openGraph: {
    title: "Contact Cepoka Beauty Hub - Premium Beauty Equipment Supplier",
    description: "Get in touch with Cepoka Beauty Hub for premium spa equipment, salon furniture, and beauty equipment. Located in Lagos, Nigeria.",
    url: "https://cepokabeautyhub.com/contact",
    images: [
      {
        url: "https://cepokabeautyhub.com/icons/sitelogo.png",
        width: 512,
        height: 512,
        alt: "Contact Cepoka Beauty Hub",
      },
    ],
  },
  twitter: {
    title: "Contact Cepoka Beauty Hub - Premium Beauty Equipment Supplier",
    description: "Get in touch with Cepoka Beauty Hub for premium spa equipment, salon furniture, and beauty equipment.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contactStructuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@type": "LocalBusiness",
      "name": "Cepoka Beauty Hub",
      "description": "Premium spa equipment, salon furniture, and beauty equipment supplier",
      "telephone": "+2348038683235",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Lagos",
        "addressCountry": "NG"
      },
      "openingHours": "Mo-Sa 08:00-13:00",
      "url": "https://cepokabeautyhub.com",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+2348038683235",
        "contactType": "customer service",
        "availableLanguage": "English"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactStructuredData) }}
      />
      {children}
    </>
  );
}
