import { useQuery } from '@tanstack/react-query';
import type { Product } from '../types';

// User's location: Jadavpur, Kolkata
const USER_LAT = 22.4981;
const USER_LNG = 88.3653;

/**
 * Haversine distance in km between two lat/lng points
 */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Estimate delivery time based on distance (scooter avg 25 km/h + 5 min pickup)
 */
function estimateEta(distKm: number): number {
  return Math.max(8, Math.round((distKm / 25) * 60 + 5));
}

/**
 * Get best image URL from a product document returned by the API.
 */
function resolveImage(p: any): string {
  // Try the first color's main image
  const main = p.colors?.[0]?.images?.main;
  if (main && !main.includes('storage.googleapis.com')) return main;
  // Fallback: map by product name to our local photos
  const n = (p.name || '').toLowerCase();
  if (n.includes('hoodie')) return '/photos/hoodie_tech/main.png';
  if (n.includes('jacket')) return '/photos/jacket_utility/main.png';
  if (n.includes('sweater') || n.includes('knit')) return '/photos/sweater_knit/main.png';
  if (n.includes('tee') || n.includes('activewear')) return '/photos/tshirt_coral/main.png';
  if (n.includes('blazer')) return '/photos/blazer_formal/main.png';
  if (n.includes('black') || n.includes('flare')) return '/photos/dress_black_striped/main.jpg';
  if (n.includes('brown') || n.includes('midi')) return '/photos/dress_brown_midi/main.jpg';
  if (n.includes('blue') || n.includes('a-line')) return '/photos/dress_blue_aline/main.jpg';
  return '/photos/hoodie_tech/main.png';
}

function resolveGallery(p: any): string[] {
  const imgs = p.colors?.[0]?.images;
  if (imgs?.gallery?.length) {
    return imgs.gallery.filter((u: string) => !u.includes('storage.googleapis.com'));
  }
  return [];
}

function resolve360Frames(p: any): string[] {
  const imgs = p.colors?.[0]?.images;
  if (imgs?.frames_360?.length) {
    return imgs.frames_360.filter((u: string) => !u.includes('storage.googleapis.com'));
  }
  return [];
}

export const mapProduct = (p: any): Product => {
  // Calculate distance from user to store
  const coords = p.store_location?.coordinates || [88.36, 22.50];
  const distKm = haversineKm(USER_LAT, USER_LNG, coords[1], coords[0]);
  const eta = estimateEta(distKm);

  // Get total stock across all sizes
  const totalStock = p.stock
    ? Object.values(p.stock as Record<string, number>).reduce((a: number, b: number) => a + b, 0)
    : 0;

  return {
    id: p.id,
    name: p.name,
    price: p.price ?? { mrp: 0, selling_price: 0, discount_percent: 0 },
    image: resolveImage(p),
    gallery: resolveGallery(p),
    frames_360: resolve360Frames(p),
    has_360: p.colors?.[0]?.images?.has_360 || false,
    category: p.category || 'Streetwear',
    subcategory: p.subcategory || '',
    brand: p.brand || 'Local Boutique',
    gender: p.gender || 'unisex',
    boutique: p.store_name,
    store_name: p.store_name,
    store_location: p.store_location || { type: 'Point', coordinates: [88.36, 22.50] },
    distance: Math.round(distKm * 10) / 10,
    delivery_eta: eta,
    fitAccuracy: p.fit_confidence_avg ?? 95,
    stock: p.stock || {},
    description: p.description ?? '',
    rating: p.rating ?? { average: 4.5, count: 10 },
    colors: p.colors || [],
    sizes_available: p.sizes_available || ['S', 'M', 'L', 'XL'],
    tags: p.tags || [],
  } as Product;
};

export const fetchProducts = async (queryStr?: string): Promise<Product[]> => {
  const url = queryStr ? `/api/v1/products?${queryStr}` : '/api/v1/products';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const data = await response.json();
  
  return data.map(mapProduct);
};

export const useProducts = (queryStr?: string) => {
  return useQuery<Product[]>({
    queryKey: ['products', queryStr],
    queryFn: () => fetchProducts(queryStr),
    staleTime: 1000 * 60 * 5,
  });
};
