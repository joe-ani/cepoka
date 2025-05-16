import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Stock Product Details',
  description: 'View and manage stock product details',
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
