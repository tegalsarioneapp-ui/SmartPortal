import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "admin" | "warga";

export interface AuthUser {
  username: string;
  name: string;
  role: UserRole;
  token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "smartportal_auth";

// Demo credentials – replace with real API call when backend auth is ready
const DEMO_USERS: Array<{ username: string; password: string; name: string; role: UserRole }> = [
  { username: "admin", password: "admin123", name: "Administrator RT", role: "admin" },
  { username: "warga", password: "warga123", name: "Ahmad Suherman", role: "warga" },
  // Allow simple "admin"/"admin" and "warga"/"warga" for convenience
  { username: "admin", password: "admin", name: "Administrator RT", role: "admin" },
  { username: "warga", password: "warga", name: "Ahmad Suherman", role: "warga" },
];

function findUser(username: string, password: string) {
  return DEMO_USERS.find(
    (u) => u.username === username.toLowerCase().trim() && u.password === password
  ) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: AuthUser = JSON.parse(stored);
        if (parsed?.token && parsed?.role) {
          setUser(parsed);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const match = findUser(username, password);
    if (!match) {
      return { success: false, error: "Username atau password salah." };
    }
    const authUser: AuthUser = {
      username: match.username,
      name: match.name,
      role: match.role,
      token: `demo-token-${match.role}-${Date.now()}`,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}