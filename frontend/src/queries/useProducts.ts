import { useQuery } from '@tanstack/react-query';
import type { Product } from '../types';

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Apex Tech Hoodie",
    price: 79.00,
    image: "lavender_hoodie.png",
    category: "Streetwear",
    boutique: "Boutique A",
    distance: 0.8,
    fitAccuracy: 94,
    stock: 2,
    rating: 4.8,
    reviewsCount: 128,
    description: "Heavyweight drop-shoulder street hoodie in pastel lavender color."
  },
  {
    id: 2,
    name: "Vanguard Utility Jacket",
    price: 149.00,
    image: "techwear_jacket.png",
    category: "Streetwear",
    boutique: "Boutique B",
    distance: 1.2,
    fitAccuracy: 91,
    stock: 3,
    rating: 4.7,
    reviewsCount: 92,
    description: "Waterproof obsidian-black cargo utility techwear jacket."
  },
  {
    id: 3,
    name: "Amethyst Knit Sweater",
    price: 95.00,
    image: "knit_sweater.png",
    category: "Formals",
    boutique: "Boutique C",
    distance: 0.5,
    fitAccuracy: 96,
    stock: 1,
    rating: 4.9,
    reviewsCount: 114,
    description: "Luxury minimalist cream/lavender wool knit sweater."
  },
  {
    id: 4,
    name: "Aero-Knit Activewear Tee",
    price: 45.00,
    image: "activewear_shirt.png",
    category: "Activewear",
    boutique: "Boutique D",
    distance: 1.9,
    fitAccuracy: 89,
    stock: 8,
    rating: 4.5,
    reviewsCount: 67,
    description: "Contrasting seam stitch active tee in electric coral."
  }
];

const fetchProducts = async (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(initialProducts);
    }, 450);
  });
};

export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};
