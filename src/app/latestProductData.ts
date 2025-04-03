export interface Product {
  name: string;
  price: string;
  img: string;
  likeStatus: boolean;
  height?: string; // Add optional height property
}

const productData: Product[] = [
  // ...existing product data...
];

export default productData;
