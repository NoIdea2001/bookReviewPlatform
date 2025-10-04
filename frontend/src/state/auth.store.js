import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuth = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setCredentials: ({ user, token }) =>
        set({ user, token, isAuthenticated: Boolean(token) }),
      clearCredentials: () =>
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "book-review-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
