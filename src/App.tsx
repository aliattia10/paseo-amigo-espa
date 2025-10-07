import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/contexts/AuthContext";
import { createUser } from "@/lib/supabase-services";
import { useToast } from "@/hooks/use-toast";

const queryClient = new QueryClient();

// Onboarding Flow Component
const OnboardingFlow = () => {
  const { currentUser, signIn } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    postalCode: '',
    userType: 'owner' as 'owner' | 'walker'
  });

  const handleCreateProfile = async () => {
    if (!currentUser || !formData.name || !formData.phone || !formData.city) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating profile for user:', currentUser.id);
      console.log('Profile data:', formData);
      
      await createUser(currentUser.id, {
        name: formData.name,
        email: currentUser.email || '',
        phone: formData.phone,
        city: formData.city,
        postalCode: formData.postalCode,
        userType: formData.userType,
      });
      
      console.log('Profile created successfully');
      
      toast({
        title: "¡Perfil creado!",
        description: "Tu perfil se ha creado exitosamente",
      });
      
      // Wait a moment for the database to update, then refresh auth context
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: `No se pudo crear el perfil: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl">🐕</span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-text mb-2">
                ¡Bienvenido a Paseo!
              </h1>
              <p className="text-muted-foreground">
                Completa tu perfil para comenzar a conectar con perros y paseadores
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
                  placeholder="+34 123 456 789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Ciudad *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
                  placeholder="Madrid, Barcelona, Valencia..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Código postal
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
                  placeholder="28001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-text mb-3">
                  ¿Qué quieres hacer en Paseo? *
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="userType"
                      value="owner"
                      checked={formData.userType === 'owner'}
                      onChange={(e) => setFormData({...formData, userType: e.target.value as 'owner' | 'walker'})}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">🐕 Dueño de perro</div>
                      <div className="text-sm text-muted-foreground">Buscar paseadores para mi perro</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="userType"
                      value="walker"
                      checked={formData.userType === 'walker'}
                      onChange={(e) => setFormData({...formData, userType: e.target.value as 'owner' | 'walker'})}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">🚶‍♀️ Paseador</div>
                      <div className="text-sm text-muted-foreground">Ofrecer servicios de paseo</div>
                    </div>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleCreateProfile}
                disabled={loading || !formData.name || !formData.phone || !formData.city}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {loading ? "Creando perfil..." : "Crear perfil"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

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
  const { userProfile, currentUser } = useAuth();
  
  // If no user at all, redirect to auth
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }
  
  // If user exists but no profile, show onboarding flow
  if (!userProfile) {
    return <OnboardingFlow />;
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
