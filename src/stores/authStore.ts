import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  name: string;
  role: UserRole;
  rating: number;
  totalSolved: number;
  streak: number;
  lastActive: string;
  joinedAt: string;
}

interface AuthState {
  // Current logged in user (null if not logged in)
  currentUser: AuthUser | null;
  isAuthenticated: boolean;

  // Database of all users (stored in localStorage for demo)
  registeredUsers: AuthUser[];

  // Auth actions
  login: (
    email: string,
    password: string
  ) => { success: boolean; error?: string };
  logout: () => void;
  register: (
    email: string,
    password: string,
    name: string,
    role?: UserRole
  ) => { success: boolean; error?: string };

  // Helpers
  isAdmin: () => boolean;
  getUserByEmail: (email: string) => AuthUser | undefined;
}

// Admin account only - regular users will register
const defaultUsers: AuthUser[] = [
  {
    id: "admin-1",
    email: "admin@dsa.com",
    password: "admin123",
    name: "Admin",
    role: "admin",
    rating: 0,
    totalSolved: 0,
    streak: 0,
    lastActive: new Date().toISOString().split("T")[0],
    joinedAt: "2024-01-01",
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      registeredUsers: defaultUsers,

      login: (email: string, password: string) => {
        const users = get().registeredUsers;
        const user = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (!user) {
          return { success: false, error: "User not found" };
        }

        if (user.password !== password) {
          return { success: false, error: "Invalid password" };
        }

        // Update last active
        const updatedUser = {
          ...user,
          lastActive: new Date().toISOString().split("T")[0],
        };

        set({
          currentUser: updatedUser,
          isAuthenticated: true,
          registeredUsers: users.map((u) =>
            u.id === user.id ? updatedUser : u
          ),
        });

        return { success: true };
      },

      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
        });
      },

      register: (
        email: string,
        password: string,
        name: string,
        role: UserRole = "user"
      ) => {
        const users = get().registeredUsers;

        // Check if email already exists
        if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
          return { success: false, error: "Email already registered" };
        }

        const newUser: AuthUser = {
          id: `user-${Date.now()}`,
          email,
          password,
          name,
          role,
          rating: 1000,
          totalSolved: 0,
          streak: 0,
          lastActive: new Date().toISOString().split("T")[0],
          joinedAt: new Date().toISOString().split("T")[0],
        };

        set({
          registeredUsers: [...users, newUser],
          currentUser: newUser,
          isAuthenticated: true,
        });

        return { success: true };
      },

      isAdmin: () => {
        const user = get().currentUser;
        return user?.role === "admin";
      },

      getUserByEmail: (email: string) => {
        return get().registeredUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
      },
    }),
    {
      name: "auth-storage",
      version: 2, // Increment to trigger migration
      migrate: (persistedState: unknown, version: number) => {
        if (version < 2) {
          // Clear old dummy users - only keep admin
          return {
            ...(persistedState as AuthState),
            registeredUsers: defaultUsers,
            currentUser: null,
            isAuthenticated: false,
          };
        }
        return persistedState as AuthState;
      },
    }
  )
);
