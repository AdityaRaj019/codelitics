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

// Dummy users for testing
const dummyUsers: AuthUser[] = [
  {
    id: "admin-1",
    email: "admin@dsa.com",
    password: "admin123",
    name: "Aditya Raj",
    role: "admin",
    rating: 1850,
    totalSolved: 187,
    streak: 12,
    lastActive: "2025-01-16",
    joinedAt: "2024-06-15",
  },
  {
    id: "user-1",
    email: "user@dsa.com",
    password: "user123",
    name: "Priya Sharma",
    role: "user",
    rating: 1620,
    totalSolved: 134,
    streak: 7,
    lastActive: "2025-01-15",
    joinedAt: "2024-08-20",
  },
  {
    id: "user-2",
    email: "rahul@dsa.com",
    password: "rahul123",
    name: "Rahul Verma",
    role: "user",
    rating: 1950,
    totalSolved: 256,
    streak: 21,
    lastActive: "2025-01-16",
    joinedAt: "2024-03-10",
  },
  {
    id: "user-3",
    email: "sneha@dsa.com",
    password: "sneha123",
    name: "Sneha Patel",
    role: "user",
    rating: 1420,
    totalSolved: 89,
    streak: 3,
    lastActive: "2025-01-14",
    joinedAt: "2024-10-05",
  },
  {
    id: "user-4",
    email: "vikram@dsa.com",
    password: "vikram123",
    name: "Vikram Singh",
    role: "user",
    rating: 2100,
    totalSolved: 312,
    streak: 45,
    lastActive: "2025-01-16",
    joinedAt: "2024-01-20",
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      registeredUsers: dummyUsers,

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
    }
  )
);
