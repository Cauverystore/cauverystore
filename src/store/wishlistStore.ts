import { create } from 'zustand';

interface Product {
  id: string;
  [key: string]: any;
}

interface WishlistState {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: [],
  toggleWishlist: (product) => {
    const current = get().wishlist;
    const exists = current.find((p) => p.id === product.id);
    const updated = exists
      ? current.filter((p) => p.id !== product.id)
      : [...current, product];
    set({ wishlist: updated });
  },
}));
