import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import LoginPage from "@/pages/login";
import PortalWargaPage from "@/pages/portal-warga/index";
import PortalAdminPage from "@/pages/portal-admin/index";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

/** Root redirect: authenticated users go to their portal, others go to login. */
function HomeRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-sm">Memuat...</div>
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;
  return <Redirect to={user.role === "admin" ? "/portal/admin" : "/portal/warga"} />;
}

function Router() {
  return (
    <Switch>
      {/* Root: redirect based on auth state */}
      <Route path="/" component={HomeRedirect} />

      {/* Auth */}
      <Route path="/login" component={LoginPage} />

      {/* Portal Warga – only accessible by role "warga" */}
      <Route path="/portal/warga">
        <ProtectedRoute requiredRole="warga">
          <PortalWargaPage />
        </ProtectedRoute>
      </Route>

      {/* Portal Admin – only accessible by role "admin" */}
      <Route path="/portal/admin">
        <ProtectedRoute requiredRole="admin">
          <PortalAdminPage />
        </ProtectedRoute>
      </Route>

      {/* Catch-all */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
