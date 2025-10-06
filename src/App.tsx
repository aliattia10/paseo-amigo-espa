import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";
import OwnerDashboard from "./components/dashboard/OwnerDashboard";
import WalkerDashboard from "./components/dashboard/WalkerDashboard";
import MessagingPage from "./components/messaging/MessagingPage";
import SubscriptionPage from "./components/subscription/SubscriptionPage";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import { useState } from "react";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  
  console.log('ProtectedRoute:', { currentUser: !!currentUser, loading });
  
  if (loading) {
    console.log('ProtectedRoute: Still loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }
  
  console.log('ProtectedRoute: Loading complete, currentUser:', !!currentUser);
  return currentUser ? <>{children}</> : <Navigate to="/auth" />;
};

// Dashboard Router Component
const DashboardRouter = () => {
  const { userProfile, currentUser, logout } = useAuth();
  
  // If user is authenticated but doesn't have a profile, show a message
  if (currentUser && !userProfile) {
    const handleLogout = async () => {
      try {
        await logout();
        window.location.href = '/auth';
      } catch (error) {
        console.error('Error logging out:', error);
        window.location.href = '/auth';
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-text mb-4">Perfil Incompleto</h2>
          <p className="text-muted-foreground mb-6">
            Tu cuenta existe pero no se pudo cargar tu perfil. Por favor, cierra sesión e inicia sesión nuevamente.
          </p>
          <Button 
            onClick={handleLogout}
            className="bg-terracotta hover:bg-terracotta/90"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    );
  }
  
  // If no user at all, redirect to auth
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }
  
  return userProfile.userType === 'owner' ? <OwnerDashboard /> : <WalkerDashboard />;
};

// Auth Component
const AuthComponent = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
        ) : (
          <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthComponent />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/messages" 
                  element={
                    <ProtectedRoute>
                      <MessagingPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/subscription" 
                  element={
                    <ProtectedRoute>
                      <SubscriptionPage />
                    </ProtectedRoute>
                  } 
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
