export default function StockProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

// This is a server component that can handle the metadata
export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Stock Product: ${params.id}`,
  };
}
