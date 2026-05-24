// QUICK_STYLE Global TypeScript Interfaces

export type Size = 'S' | 'M' | 'L' | 'XL';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: 'Streetwear' | 'Formals' | 'Activewear' | 'Loungewear';
  boutique: string;
  distance: number;
  fitAccuracy: number;
  stock: number;
  description: string;
  rating: number;
  reviewsCount: number;
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
