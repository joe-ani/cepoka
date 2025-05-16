import { Metadata } from 'next';

interface PageParams {
  id: string;
}

export interface StockProductLayoutProps {
  children: React.ReactNode;
  params: PageParams;
}

export default async function StockProductLayout({
  children,
}: StockProductLayoutProps) {
  return children;
}

// This is a server component that can handle the metadata
export async function generateMetadata(
  { params }: { params: PageParams }
): Promise<Metadata> {
  return {
    title: `Stock Product: ${params.id}`,
  };
}
