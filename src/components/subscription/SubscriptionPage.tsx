import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { getUserSubscription, getSubscriptionStatus } from '@/lib/payment-services';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Crown, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SubscriptionPlans from './SubscriptionPlans';
import PaymentForm from './PaymentForm';
import SubscriptionManagement from './SubscriptionManagement';
import type { SubscriptionPlan, UserSubscription } from '@/types';

const SubscriptionPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    const loadSubscription = async () => {
      if (!currentUser) return;

      try {
        const subscription = await getUserSubscription(currentUser.id);
        setCurrentSubscription(subscription);
      } catch (error) {
        console.error('Error loading subscription:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información de suscripción.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [currentUser, toast]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
    // Reload subscription data
    window.location.reload();
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (showPaymentForm && selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handlePaymentCancel}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a los planes
            </Button>
          </div>
          <PaymentForm
            selectedPlan={selectedPlan}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-terracotta" />
              <h1 className="text-xl font-semibold">Suscripciones</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plans">Planes</TabsTrigger>
            <TabsTrigger value="management">Mi Suscripción</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-12">
              <h2 className="text-4xl font-bold text-warm-text mb-4">
                Elige tu Plan Perfecto
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Desbloquea todas las funciones premium para conectar mejor con compañeros de paseo
                y cuidar a tu perro como se merece.
              </p>
              
              {currentSubscription && (
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Tienes una suscripción activa</span>
                </div>
              )}
            </div>

            {/* Features Overview */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-center">¿Qué incluye cada plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Acceso Ilimitado</h3>
                    <p className="text-sm text-muted-foreground">
                      Conecta con todos los compañeros verificados de tu zona
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-mediterranean rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Chat en Tiempo Real</h3>
                    <p className="text-sm text-muted-foreground">
                      Comunícate instantáneamente con compañeros y dueños
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-sunny rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">Soporte Prioritario</h3>
                    <p className="text-sm text-muted-foreground">
                      Ayuda rápida cuando más la necesites
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Plans */}
            <SubscriptionPlans
              onSelectPlan={handleSelectPlan}
              currentSubscription={currentSubscription}
            />
          </TabsContent>

          <TabsContent value="management">
            <SubscriptionManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SubscriptionPage;
