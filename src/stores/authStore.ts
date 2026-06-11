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
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
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

          // Store user in state (session cookie is set by the server)
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

      logout: async () => {
        try {
          // Clear the server-side session cookie
          await fetch("/api/auth/logout", { method: "POST" });
        } catch (error) {
          console.error("Logout API call failed:", error);
        }
        // Always clear client state regardless of API result
        set({
          currentUser: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // SECURITY: Role is never accepted from client — always assigned by server
      register: async (
        email: string,
        password: string,
        name: string,
      ) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
          });

          const data = await response.json();

          if (!data.success) {
            set({ isLoading: false, error: data.error });
            return { success: false, error: data.error };
          }

          // Auto-login after registration (session cookie set by server)
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
          // Session cookie is sent automatically by the browser
          const response = await fetch("/api/auth/me");
          const data = await response.json();

          if (data.success) {
            set({ currentUser: data.user, isAuthenticated: true });
          } else {
            // User not found or session expired, clear client state
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
      version: 4, // Incremented to trigger migration from old schema
      migrate: (persistedState: unknown, version: number) => {
        if (version < 4) {
          // Clear old auth data to use new cookie-based auth
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
