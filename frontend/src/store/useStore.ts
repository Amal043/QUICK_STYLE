import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, Size } from '../types';

interface AppState {
  cart: CartItem[];
  selectedSizes: { [productId: string]: Size };
  currentLocation: string;
  activeCategory: 'All' | 'Streetwear' | 'Formals' | 'Activewear' | 'Loungewear';
  sizingProduct: Product | null;
  cartOpen: boolean;
  fulfillmentOpen: boolean;
  originHub: string;
  couponApplied: boolean;
  couponDiscount: number;
  voiceSearching: boolean;
  adminMode: boolean;
  isLoggedIn: boolean;
  wishlist: string[];
  userProfile: any;
  activeOrderId: string | null;
  userCoords: { lat: number; lng: number } | null;
  orderHistory: any[];
  
  // Actions
  addToCart: (product: Product, size: Size) => void;
  updateQty: (productId: string | number, size: Size, delta: number) => void;
  removeItem: (productId: string | number, size: Size) => void;
  clearCart: () => void;
  setSize: (productId: string | number, size: Size) => void;
  setLocation: (loc: string) => void;
  setCategory: (cat: 'All' | 'Streetwear' | 'Formals' | 'Activewear' | 'Loungewear') => void;
  setSizingProduct: (prod: Product | null) => void;
  setCartOpen: (open: boolean) => void;
  setFulfillmentOpen: (open: boolean) => void;
  setOriginHub: (hub: string) => void;
  setCouponApplied: (applied: boolean) => void;
  setCouponDiscount: (discount: number) => void;
  setVoiceSearching: (searching: boolean) => void;
  setAdminMode: (mode: boolean) => void;
  setIsLoggedIn: (mode: boolean) => void;
  toggleWishlist: (productId: string) => void;
  setUserProfile: (profile: any) => void;
  setActiveOrderId: (orderId: string | null) => void;
  setUserCoords: (coords: { lat: number; lng: number } | null) => void;
  addOrderToHistory: (order: any) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      cart: [],
      selectedSizes: {},
      currentLocation: 'Select Location',
      activeCategory: 'All',
      sizingProduct: null,
      cartOpen: false,
      fulfillmentOpen: false,
      originHub: 'Boutique A Hub',
      couponApplied: false,
      couponDiscount: 0,
      voiceSearching: false,
      adminMode: false,
      isLoggedIn: false,
      wishlist: [],
      userProfile: null,
      activeOrderId: null,
      userCoords: null,
      orderHistory: [],

  addToCart: (product, size) => set((state) => {
    const existingIndex = state.cart.findIndex(
      (item) => item.product.id === product.id && item.size === size
    );
    
    let newCart = [...state.cart];
    if (existingIndex > -1) {
      newCart[existingIndex] = {
        ...newCart[existingIndex],
        quantity: newCart[existingIndex].quantity + 1
      };
    } else {
      newCart.push({ product, size, quantity: 1 });
    }
    
    return { cart: newCart, cartOpen: true };
  }),

  updateQty: (productId, size, delta) => set((state) => {
    const newCart = state.cart.map((item) => {
      if (item.product.id === productId && item.size === size) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter((item): item is CartItem => item !== null);
    
    return { cart: newCart };
  }),

  removeItem: (productId, size) => set((state) => ({
    cart: state.cart.filter((item) => !(item.product.id === productId && item.size === size))
  })),

  clearCart: () => set({ cart: [] }),

  setSize: (productId, size) => set((state) => ({
    selectedSizes: { ...state.selectedSizes, [productId]: size }
  })),

  setLocation: (loc) => set({ currentLocation: loc }),

  setCategory: (cat) => set({ activeCategory: cat }),

  setSizingProduct: (prod) => set({ sizingProduct: prod }),

  setCartOpen: (open) => set({ cartOpen: open }),

  setFulfillmentOpen: (open) => set({ fulfillmentOpen: open }),

  setOriginHub: (hub) => set({ originHub: hub }),

  setCouponApplied: (applied) => set({ couponApplied: applied }),

  setCouponDiscount: (discount) => set({ couponDiscount: discount }),

  setVoiceSearching: (searching) => set({ voiceSearching: searching }),

  setAdminMode: (mode) => set({ adminMode: mode }),

  setIsLoggedIn: (mode) => set({ isLoggedIn: mode }),

  toggleWishlist: (productId) => set((state) => {
    const isWished = state.wishlist.includes(productId);
    const newWishlist = isWished 
      ? state.wishlist.filter(id => id !== productId)
      : [...state.wishlist, productId];
    return { wishlist: newWishlist };
  }),

  setUserProfile: (profile) => set({ userProfile: profile }),

  setActiveOrderId: (orderId) => set({ activeOrderId: orderId }),

  setUserCoords: (coords) => set({ userCoords: coords }),

  addOrderToHistory: (order) => set((state) => {
    const updatedHistory = [order, ...state.orderHistory];
    return { orderHistory: updatedHistory };
  }),
    }),
    {
      name: 'quickstyle-store',
    }
  )
);
