import { Metadata } from 'next';
import ProductPageClient from './ProductPageClient';

type PageProps = {
    params: Promise<{ slug: string }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    return {
        title: `Product Details: ${resolvedParams.slug}`,
        description: "Details for the product",
    };
}

export default async function ProductPage({ params }: PageProps) {
    const resolvedParams = await params;
    return <ProductPageClient params={resolvedParams} />;
}
