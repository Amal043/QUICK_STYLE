// QUICK_STYLE Global TypeScript Interfaces

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface Product {
  id: string | number;
  name: string;
  price: { mrp: number; selling_price: number; discount_percent: number; };
  image: string;
  gallery: string[];
  frames_360: string[];
  has_360: boolean;
  category: string;
  subcategory: string;
  brand: string;
  gender: 'men' | 'women' | 'unisex';
  boutique: string;
  store_name: string;
  store_location: { type: string; coordinates: number[] };
  distance: number;
  delivery_eta: number;
  fitAccuracy: number;
  stock: Record<string, number>;
  description: string;
  rating: { average: number; count: number };
  colors: any[];
  sizes_available: string[];
  tags: string[];
}

export interface CartItem {
  product: Product;
  size: Size;
  quantity: number;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: Date;
}

export interface SizingResult {
  size: Size;
  confidence: number;
  details: string;
}
