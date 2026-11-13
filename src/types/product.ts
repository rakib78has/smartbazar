export interface ProductVariant {
  id: string;
  name: string; // e.g. "Red / XL"
  size?: string;
  color?: string;
  colorCode?: string; // hex like #000000
  price: number;
  costPrice?: number;
  stock: number;
  sku?: string;
  image?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  description: string;
  category: string;
  brand?: string;
  basePrice: number;
  discountPrice?: number;
  costPrice?: number; // for profit analytics
  images: string[];
  variants: ProductVariant[];
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  stock: number;
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
}
