import { create } from "zustand";

type CartItem = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
};

interface CartStore {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  updateQuantity: (id: number, newQuantity: number) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cartItems: [],
  addToCart: (item) =>
    set((state) => {
      const existing = state.cartItems.find((i) => i.id === item.id);
      if (existing) {
        return {
          cartItems: state.cartItems.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      } else {
        return { cartItems: [...state.cartItems, item] };
      }
    }),
  removeFromCart: (id) =>
    set((state) => ({
      cartItems: state.cartItems.filter((i) => i.id !== id),
    })),
  clearCart: () => set({ cartItems: [] }),
  updateQuantity: (id, newQuantity) =>
    set((state) => ({
      cartItems: state.cartItems.map((i) =>
        i.id === id ? { ...i, quantity: newQuantity } : i
      ),
    })),
}));
