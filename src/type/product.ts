export interface ColorVariant {
  name: string;
  color: string; // CSS color or hex
  image: string;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  preview: string;
  images?: string[];
  description: string;
  isAccessory: boolean;
  category: "clothing" | "shoes" | "accessories";
  gender: "men" | "women" | "unisex";
  subcategory?: string;
  colorVariants?: ColorVariant[];
}

export interface CartItem extends Product {
  count: number;
}
