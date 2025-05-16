import { Metadata } from 'next';

type LayoutProps = {
  children: React.ReactNode;
  params: {
    id: string;
  };
};

export default function StockProductLayout({ children }: LayoutProps) {
  return children;
}

// This is a server component that can handle the metadata
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  return {
    title: `Stock Product: ${params.id}`,
  };
}
