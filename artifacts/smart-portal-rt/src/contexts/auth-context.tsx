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
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;

const DEMO_USERS = [
  { username: "admin", password: import.meta.env.VITE_PASSWORD_ADMIN ?? "", name: "Administrator RT", role: "admin" as const },
  { username: "warga", password: import.meta.env.VITE_PASSWORD_WARGA ?? "", name: "Ahmad Suherman", role: "warga" as const },
];

function generateToken(role: string): string {
  const rand = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(rand).map(b => b.toString(16).padStart(2, "0")).join("");
  return `spt-${role}-${Date.now()}-${hex}`;
}

function findUser(username: string, password: string) {
  if (!password) return null;
  return DEMO_USERS.find(
    u => u.username === username.toLowerCase().trim() && u.password !== "" && u.password === password
  ) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: AuthUser = JSON.parse(stored);
        const validRoles: UserRole[] = ["admin", "warga"];
        if (
          parsed?.token &&
          parsed.token.length > 20 &&
          validRoles.includes(parsed.role) &&
          typeof parsed.expiresAt === "number" &&
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
    await new Promise(r => setTimeout(r, 300));
    const match = findUser(username, password);
    if (!match) return { success: false, error: "Username atau password salah." };
    const authUser: AuthUser = {
      username: match.username,
      name: match.name,
      role: match.role,
      token: generateToken(match.role),
      expiresAt: Date.now() + TOKEN_TTL_MS,
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
