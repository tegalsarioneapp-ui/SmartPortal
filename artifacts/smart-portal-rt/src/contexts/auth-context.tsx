import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "admin" | "warga";

export interface AuthUser {
  username: string;
  name: string;
  role: UserRole;
  token: string;
  expiresAt: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "smartportal_auth";

// Demo credentials – replace with real API call when backend auth is ready
const DEMO_USERS: Array<{ username: string; password: string; name: string; role: UserRole }> = [
  { username: "admin", password: import.meta.env.VITE_PASSWORD_ADMIN ?? "rt005admin", name: "Administrator RT", role: "admin" },
  { username: "warga", password: import.meta.env.VITE_PASSWORD_WARGA ?? "rt005warga", name: "Ahmad Suherman", role: "warga" },
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
        const validRoles: UserRole[] = ["admin", "warga"];
        if (
          parsed?.token &&
          parsed.token.length > 10 &&
          validRoles.includes(parsed.role) &&
          parsed.expiresAt > Date.now()
        ) {
          setUser(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
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
      expiresAt: Date.now() + 28800000,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return { success: true, user: authUser };
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