import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "user" | "admin";
export type AuthProvider = "credentials" | "google" | "github";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  authProvider: AuthProvider;
  role: UserRole;
  createdAt: string;
}

interface AuthState {
  // Current logged in user (null if not logged in)
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth actions
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (
    email: string,
    password: string,
    name: string,
    role?: UserRole,
  ) => Promise<{ success: boolean; error?: string }>;

  // Session management
  refreshUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  clearError: () => void;

  // Helpers
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!data.success) {
            set({ isLoading: false, error: data.error });
            return { success: false, error: data.error };
          }

          // Store user in state
          set({
            currentUser: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : "Login failed";
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
          error: null,
        });
      },

      register: async (
        email: string,
        password: string,
        name: string,
        role: UserRole = "user",
      ) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name, role }),
          });

          const data = await response.json();

          if (!data.success) {
            set({ isLoading: false, error: data.error });
            return { success: false, error: data.error };
          }

          // Auto-login after registration
          set({
            currentUser: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : "Registration failed";
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      refreshUser: async () => {
        const { currentUser } = get();
        if (!currentUser?.id) return;

        try {
          const response = await fetch(`/api/auth/me?userId=${currentUser.id}`);
          const data = await response.json();

          if (data.success) {
            set({ currentUser: data.user, isAuthenticated: true });
          } else {
            // User not found in database, clear session
            set({ currentUser: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error("Failed to refresh user:", error);
        }
      },

      setUser: (user: AuthUser | null) => {
        set({
          currentUser: user,
          isAuthenticated: !!user,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      isAdmin: () => {
        const user = get().currentUser;
        return user?.role === "admin";
      },
    }),
    {
      name: "auth-storage",
      version: 3, // Increment to trigger migration from old schema
      migrate: (persistedState: unknown, version: number) => {
        if (version < 3) {
          // Clear old local-only auth data
          return {
            currentUser: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          };
        }
        return persistedState as AuthState;
      },
      // Only persist these fields
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
