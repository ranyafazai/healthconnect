import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import type { User, UserRole } from "../types/state/user";
import React from "react";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  role: UserRole;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  role: UserRole;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthProvider = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (token && savedUser) {
          setState((prev) => ({
            ...prev,
            user: JSON.parse(savedUser),
            loading: false,
          }));
        } else {
          setState((prev) => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to initialize auth",
        }));
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to login");
      }

      const { user, token } = await response.json();

      // Store auth data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setState((prev) => ({
        ...prev,
        user,
        loading: false,
      }));
    } catch (error) {
      console.error("Login error:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      }));
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to register");
      }

      const { user, token } = await response.json();

      // Store auth data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setState((prev) => ({
        ...prev,
        user,
        loading: false,
      }));
    } catch (error) {
      console.error("Registration error:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      }));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Optional: Call logout endpoint if you need to invalidate the token on the server
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Reset state
      setState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Logout error:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    clearError,
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuthProvider();
  return React.createElement(AuthContext.Provider, { value: auth }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Helper hook for protected routes
export const useRequireAuth = () => {
  const auth = useAuth();

  if (!auth.user && !auth.loading) {
    throw new Error("Unauthorized access");
  }

  return auth;
};

export default useAuth;
