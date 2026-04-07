import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";
import OwnerDashboard from "./components/dashboard/OwnerDashboard";
import WalkerDashboard from "./components/dashboard/WalkerDashboard";
import MessagingPage from "./components/messaging/MessagingPage";
import SubscriptionPage from "./components/subscription/SubscriptionPage";
import Index from "./pages/Index";
import AuthNew from "./pages/AuthNew";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import WelcomeScreen from "./components/welcome/WelcomeScreen";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import NewHomePage from "./components/dashboard/NewHomePage";
import NewProfilePage from "./components/profile/NewProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfileEditPage from "./pages/ProfileEditPage";
import PersonalInfoPage from "./pages/PersonalInfoPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import PetProfilePage from "./pages/PetProfilePage";
import PetEditPage from "./pages/PetEditPage";
import DogOwnerProfileSetup from "./pages/DogOwnerProfileSetup";
import SitterProfileSetup from "./pages/SitterProfileSetup";
import SitterOnboardingWizard from "./components/onboarding/SitterOnboardingWizard";
import AvailabilityPage from "./pages/AvailabilityPage";
import BookingsPage from "./pages/BookingsPage";
import BookingRequestPage from "./pages/BookingRequestPage";
import PaymentPage from "./pages/PaymentPage";
import PayoutMethodsPage from "./pages/PayoutMethodsPage";
import AdminPayoutsPage from "./pages/AdminPayoutsPage";
import AdminVerificationsPage from "./pages/AdminVerificationsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminGuard from "./components/admin/AdminGuard";
import LandingPage from "./pages/LandingPage";
import AboutUsPage from "./pages/AboutUsPage";
import ContactPage from "./pages/ContactPage";
import UserAgreementPage from "./pages/UserAgreementPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import CodeOfConductPage from "./pages/CodeOfConductPage";
import VerifyIdentityPage from "./pages/VerifyIdentityPage";
import VerifyIdentityDonePage from "./pages/VerifyIdentityDonePage";
import BlogListPage from "./pages/BlogListPage";
import BlogPostPage from "./pages/BlogPostPage";
import AdminPage from "./pages/AdminPage";
import AdminBlogPage from "./pages/AdminBlogPage";
import SEO from "./components/SEO";
import { useLocation } from 'react-router-dom';
import { createUser } from "@/lib/supabase-services";
import { useToast } from "@/hooks/use-toast";
import { checkSupabaseConnectivity, logConnectivityResult } from "@/lib/supabase-connectivity";

const queryClient = new QueryClient();

// Run Supabase connectivity check only in development (avoids noisy console in production)
const SupabaseConnectivityCheck = () => {
  useEffect(() => {
    if (import.meta.env.DEV) {
      checkSupabaseConnectivity().then((result) => {
        logConnectivityResult(result);
      });
    }
  }, []);
  return null;
};

// Onboarding Flow Component
const OnboardingFlow = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic profile data
    name: '',
    phone: '',
    city: '',
    postalCode: '',
    userType: 'owner' as 'owner' | 'walker',
    // Dog data (for owners)
    dogs: [] as Array<{
      name: string;
      age: string;
      breed: string;
      notes: string;
      imageFile?: File;
    }>,
    // Walker data (for walkers)
    bio: '',
    experience: '',
    hourlyRate: 15,
    availability: [] as string[],
    tags: [] as string[],
  });

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.phone || !formData.city) {
        toast({
          title: "Error",
          description: "Por favor, completa todos los campos obligatorios",
          variant: "destructive",
        });
        return;
      }
      // If user is an owner, add a default dog entry
      if (formData.userType === 'owner' && formData.dogs.length === 0) {
        setFormData({
          ...formData,
          dogs: [{ name: '', age: '', breed: '', notes: '' }]
        });
      }
    }
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const addDog = () => {
    setFormData({
      ...formData,
      dogs: [...formData.dogs, { name: '', age: '', breed: '', notes: '' }]
    });
  };

  const updateDog = (index: number, field: string, value: string | File) => {
    const updatedDogs = [...formData.dogs];
    if (field === 'imageFile') {
      updatedDogs[index].imageFile = value as File;
    } else {
      updatedDogs[index] = { ...updatedDogs[index], [field]: value };
    }
    setFormData({ ...formData, dogs: updatedDogs });
  };

  const removeDog = (index: number) => {
    setFormData({
      ...formData,
      dogs: formData.dogs.filter((_, i) => i !== index)
    });
  };

  const handleCreateProfile = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      // Create user profile
      await createUser(currentUser.id, {
        name: formData.name,
        email: currentUser.email || '',
        phone: formData.phone,
        city: formData.city,
        postalCode: formData.postalCode,
        userType: formData.userType,
      });

      // Create dogs for owners
      if (formData.userType === 'owner' && formData.dogs.length > 0) {
        for (const dog of formData.dogs) {
          if (dog.name && dog.age) {
            let imageUrl = '';
            if (dog.imageFile) {
              try {
                // Upload image to Supabase storage
                const { uploadImage } = await import('@/lib/supabase-services');
                imageUrl = await uploadImage(dog.imageFile, `dogs/${currentUser.id}/${Date.now()}-${dog.name}.jpg`);
              } catch (uploadError) {
                console.warn('Failed to upload image:', uploadError);
                // Continue without image if upload fails
                imageUrl = '';
              }
            }
            
            const { createDog } = await import('@/lib/supabase-services');
            await createDog({
              ownerId: currentUser.id,
              name: dog.name,
              age: dog.age,
              breed: dog.breed,
              notes: dog.notes,
              imageUrl,
            });
          }
        }
      }

      // Create walker profile for walkers
      if (formData.userType === 'walker') {
        const { createWalkerProfile } = await import('@/lib/supabase-services');
        await createWalkerProfile({
          userId: currentUser.id,
          bio: formData.bio,
          experience: formData.experience,
          hourlyRate: formData.hourlyRate,
          availability: formData.availability,
          rating: 0,
          totalWalks: 0,
          verified: false,
          tags: formData.tags,
        });
      }

      toast({
        title: "¡Perfil creado!",
        description: "Tu perfil se ha creado exitosamente",
      });

      // Refresh the page to reload auth context
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

  // Step 1: Basic Profile Information
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-20 h kasarangang0 bg-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl">🐾</span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-text mb-2">
                ¡Bienvenido a Petflik!
              </h1>
              <p className="text-muted-foreground">
                Completa tu perfil para comenzar a conectar con mascotas y cuidadores
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
                  ¿Qué quieres hacer en Petflik? *
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
                onClick={handleNext}
                disabled={!formData.name || !formData.phone || !formData.city}
                className="w-full bg-terracotta hover:bg-terracotta/90 text-white"
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Dog Information (for owners)
  if (step === 2 && formData.userType === 'owner') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-neutral-text mb-2">
                Cuéntanos sobre tu perro
              </h1>
              <p className="text-muted-foreground">
                Añade la información de tu perro para encontrar el paseador perfecto
              </p>
            </div>

            <div className="space-y-6">
              {formData.dogs.map((dog, index) => (
                <div key={index} className="border rounded-lg p-6 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Perro {index + 1}</h3>
                    {formData.dogs.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeDog(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-text mb-2">
                        Nombre del perro *
                      </label>
                      <input
                        type="text"
                        value={dog.name}
                        onChange={(e) => updateDog(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
                        placeholder="Nombre de tu perro"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-text mb-2">
                        Edad *
                      </label>
                      <input
                        type="text"
                        value={dog.age}
                        onChange={(e) => updateDog(index, 'age', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
                        placeholder="Ej: 2 años, 6 meses"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-text mb-2">
                        Raza
                      </label>
                      <input
                        type="text"
                        value={dog.breed}
                        onChange={(e) => updateDog(index, 'breed', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
                        placeholder="Labrador, Golden Retriever..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-text mb-2">
                        Foto del perro
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) updateDog(index, 'imageFile', file);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-text mb-2">
                        Notas especiales
                      </label>
                      <textarea
                        value={dog.notes}
                        onChange={(e) => updateDog(index, 'notes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
                        placeholder="Información importante sobre el comportamiento, necesidades especiales, etc."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                onClick={addDog}
                className="w-full bg-white text-gray-800 border-2 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
              >
                + Añadir otro perro
              </Button>

              <div className="flex gap-4">
                <Button
                  onClick={handlePrev}
                  className="flex-1 bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                >
                  Anterior
                </Button>
                <Button
                  onClick={handleCreateProfile}
                  disabled={loading || formData.dogs.length === 0 || formData.dogs.some(dog => !dog.name || !dog.age)}
                  className="flex-1 bg-terracotta hover:bg-terracotta/90 text-white"
                >
                  {loading ? "Creando perfil..." : "Finalizar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Walker Profile (for walkers)
  if (step === 2 && formData.userType === 'walker') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-neutral-text mb-2">
                Crea tu perfil de paseador
              </h1>
              <p className="text-muted-foreground">
                Cuéntanos sobre tu experiencia para conectar con dueños de perros
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Biografía *
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
                  placeholder="Cuéntanos sobre ti, tu amor por los perros y por qué serías un gran paseador..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Experiencia *
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
                  placeholder="Describe tu experiencia con perros, cursos, certificaciones, etc."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Tarifa por hora (€) *
                </label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({...formData, hourlyRate: parseInt(e.target.value) || 15})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-terracotta"
                  min="5"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Disponibilidad *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.availability.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, availability: [...formData.availability, day]});
                          } else {
                            setFormData({...formData, availability: formData.availability.filter(d => d !== day)});
                          }
                        }}
                        className="mr-2"
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Especialidades
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Perros grandes', 'Perros pequeños', 'Cachorros', 'Perros mayores', 'Entrenamiento básico', 'Ejercicio intenso'].map((tag) => (
                    <label key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.tags.includes(tag)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, tags: [...formData.tags, tag]});
                          } else {
                            setFormData({...formData, tags: formData.tags.filter(t => t !== tag)});
                          }
                        }}
                        className="mr-2"
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handlePrev}
                  className="flex-1 bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                >
                  Anterior
                </Button>
                <Button
                  onClick={handleCreateProfile}
                  disabled={loading || !formData.bio || !formData.experience || formData.availability.length === 0}
                  className="flex-1 bg-terracotta hover:bg-terracotta/90 text-white"
                >
                  {loading ? "Creando perfil..." : "Finalizar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Protected Route Component – never show loading longer than 5s
const PROTECTED_ROUTE_MAX_LOADING_MS = 5000;
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  const [giveUpLoading, setGiveUpLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setGiveUpLoading(true), PROTECTED_ROUTE_MAX_LOADING_MS);
    return () => clearTimeout(t);
  }, [loading]);

  useEffect(() => {
    if (!loading) setGiveUpLoading(false);
  }, [loading]);

  const showSpinner = loading && !giveUpLoading;
  if (showSpinner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
  const location = useLocation();

  React.useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const mode = params.get('mode');
      setIsLogin(mode !== 'signup');
    } catch (e) {
      // ignore
    }
  }, [location.search]);

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
    <ThemeProvider>
    <LanguageProvider>
      <AuthProvider>
        <LocationProvider>
          <SubscriptionProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <SupabaseConnectivityCheck />
              <SEO />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<LandingPage />} />
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/user-agreement" element={<UserAgreementPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />
                <Route path="/code-of-conduct" element={<CodeOfConductPage />} />
                <Route path="/blog" element={<BlogListPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/welcome" element={<WelcomeScreen />} />
                <Route path="/select-role" element={<RoleSelectionPage />} />
                <Route path="/auth" element={<AuthNew />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* Admin Login (no guard) */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                {/* Admin Routes (password-protected via AdminGuard) */}
                <Route path="/admin" element={<AdminGuard><AdminPage /></AdminGuard>} />
                <Route path="/admin/blog/new" element={<AdminGuard><AdminBlogPage /></AdminGuard>} />
                <Route path="/admin/blog/edit/:id" element={<AdminGuard><AdminBlogPage /></AdminGuard>} />
                
                {/* Protected Routes */}
                <Route path="/verify-identity" element={<ProtectedRoute><VerifyIdentityPage /></ProtectedRoute>} />
                <Route path="/verify-identity-done" element={<ProtectedRoute><VerifyIdentityDonePage /></ProtectedRoute>} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <NewHomePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <NewProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile/edit" 
                  element={
                    <ProtectedRoute>
                      <ProfileEditPage />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/profile/personal-info" 
                  element={
                    <ProtectedRoute>
                      <PersonalInfoPage />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/profile/public" 
                  element={
                    <ProtectedRoute>
                      <PublicProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/u/:userId" 
                  element={
                    <ProtectedRoute>
                      <UserProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/pet/:petId" 
                  element={
                    <ProtectedRoute>
                      <PetProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/pet/:petId/edit" 
                  element={
                    <ProtectedRoute>
                      <PetEditPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/pet-profile-setup" 
                  element={
                    <ProtectedRoute>
                      <DogOwnerProfileSetup />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/sitter-onboarding" 
                  element={
                    <ProtectedRoute>
                      <SitterOnboardingWizard onComplete={() => {}} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/sitter-profile-setup" 
                  element={
                    <ProtectedRoute>
                      <SitterProfileSetup />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/availability" 
                  element={
                    <ProtectedRoute>
                      <AvailabilityPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/notifications" 
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/bookings" 
                  element={
                    <ProtectedRoute>
                      <BookingsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/payment" 
                  element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/booking/request" 
                  element={
                    <ProtectedRoute>
                      <BookingRequestPage />
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
                <Route 
                  path="/payout-methods" 
                  element={
                    <ProtectedRoute>
                      <PayoutMethodsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/admin/payouts"
                  element={
                    <AdminGuard>
                      <AdminPayoutsPage />
                    </AdminGuard>
                  }
                />
                <Route 
                  path="/admin/verifications" 
                  element={
                    <AdminGuard>
                      <AdminVerificationsPage />
                    </AdminGuard>
                  } 
                />
                
                {/* Catch-all route - must be last */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </TooltipProvider>
          </SubscriptionProvider>
        </LocationProvider>
      </AuthProvider>
    </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
