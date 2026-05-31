import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth, UserRole } from "@/contexts/auth-context";
import { LoadingScreen } from "@/components/loading-screen";

interface ProtectedRouteProps {
  children: ReactNode;
  /** If provided, the user must have this exact role. */
  requiredRole?: UserRole;
}

/**
 * Redirects unauthenticated users to /login.
 * If requiredRole is set, also redirects users whose role does not match.
 * Warga trying to access /portal/admin → redirected to /portal/warga.
 * Admin trying to access /portal/warga → redirected to /portal/admin (they can also view it, adjust if needed).
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Still restoring session from localStorage
  if (isLoading) return <LoadingScreen />;

  // Not authenticated at all
  if (!user) {
    return <Redirect to="/login" />;
  }

  // Role guard: warga cannot access admin, admin redirected to their portal
  if (requiredRole && user.role !== requiredRole) {
    const fallback = user.role === "admin" ? "/portal/admin" : "/portal/warga";
    return <Redirect to={fallback} />;
  }

  return <>{children}</>;
}