import { Metadata } from 'next';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

export async function generateMetadata({
  params
}: {
  params: { id: string; }
}): Promise<Metadata> {
  return {
    title: `Stock Product: ${params.id}`,
  };
}
