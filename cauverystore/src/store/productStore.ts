import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
};

type Store = {
  products: Product[];
  loadProducts: () => Promise<void>;
};

export const useProductStore = create<Store>((set) => ({
  products: [],
  loadProducts: async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("Error fetching products:", error);
      return;
    }
    set({ products: data || [] });
  },
}));
