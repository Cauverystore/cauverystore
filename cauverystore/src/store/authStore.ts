import { create } from "zustand";

interface AuthState {
  userId: number | null;
  role: string | null;
  isLoggedIn: boolean;
  login: (userId: number, role: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  role: null,
  isLoggedIn: false,
  login: (userId, role) =>
    set({ userId, role, isLoggedIn: true }),
  logout: () =>
    set({ userId: null, role: null, isLoggedIn: false }),
}));
