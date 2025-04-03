import { Metadata } from "next";

interface Props {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Product Details: ${params.slug}`,
    description: "Details for the product",
  };
}
