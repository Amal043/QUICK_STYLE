import { useQuery } from '@tanstack/react-query';
import type { Product } from '../types';

const mapImage = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("hoodie")) return "/src/assets/lavender_hoodie.png";
  if (n.includes("jacket")) return "/src/assets/techwear_jacket.png";
  if (n.includes("sweater")) return "/src/assets/knit_sweater.png";
  if (n.includes("tee") || n.includes("shirt")) return "/src/assets/activewear_shirt.png";
  if (n.includes("blazer")) return "/src/assets/techwear_jacket.png";
  return "/src/assets/lavender_hoodie.png";
};

const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch('/api/v1/products');
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const data = await response.json();
  
  return data.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price?.selling_price ?? 0,
    image: mapImage(p.name),
    category: p.category as any,
    boutique: p.store_name,
    distance: p.name.includes("Hoodie") ? 0.8 : p.name.includes("Jacket") ? 1.2 : p.name.includes("Sweater") ? 0.5 : p.name.includes("Blazer") ? 0.8 : 1.9,
    fitAccuracy: p.fit_confidence_avg ?? 95,
    stock: p.stock ? Object.values(p.stock).reduce((sum: number, qty: any) => sum + (Number(qty) || 0), 0) : 0,
    description: p.description ?? "",
    rating: p.rating?.average ?? 4.5,
    reviewsCount: p.rating?.count ?? 10,
  }));
};

export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};
