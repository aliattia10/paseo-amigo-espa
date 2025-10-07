import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext';
import { 
  getUserSubscription, 
  cancelUserSubscription, 
  getSubscriptionStatus,
  getUserPaymentMethods 
} from '@/lib/payment-services';
import { useToast } from '@/hooks/use-toast';
import { formatPrice, getIntervalText } from '@/lib/stripe';
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Settings,
  Trash2
} from 'lucide-react';
import type { UserSubscription, PaymentMethod } from '@/types';

const SubscriptionManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;

      try {
        const [subscriptionData, paymentMethodsData] = await Promise.all([
          getUserSubscription(currentUser.id),
          getUserPaymentMethods(currentUser.id)
        ]);

        setSubscription(subscriptionData);
        setPaymentMethods(paymentMethodsData);
      } catch (error) {
        console.error('Error loading subscription data:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de suscripción.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, toast]);

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    setCanceling(true);
    try {
      await cancelUserSubscription(subscription.id);
      
      // Update local state
      setSubscription(prev => prev ? { ...prev, cancelAtPeriodEnd: true } : null);
      
      toast({
        title: "Suscripción cancelada",
        description: "Tu suscripción se cancelará al final del período actual.",
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la suscripción.",
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'canceled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'past_due':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'canceled':
        return 'Cancelada';
      case 'past_due':
        return 'Pago pendiente';
      case 'unpaid':
        return 'No pagada';
      case 'incomplete':
        return 'Incompleta';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'incomplete':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando suscripción...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tienes una suscripción activa</h3>
          <p className="text-muted-foreground mb-4">
            Suscríbete para acceder a todas las funciones premium
          </p>
          <Button onClick={() => window.location.href = '/subscription'}>
            Ver Planes
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(subscription.status)}
            Estado de la Suscripción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="font-semibold">{subscription.planId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <Badge className={getStatusColor(subscription.status)}>
                {getStatusText(subscription.status)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Próximo pago</p>
              <p className="font-semibold">
                {subscription.currentPeriodEnd.toLocaleDateString('es-ES')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cancelación</p>
              <p className="font-semibold">
                {subscription.cancelAtPeriodEnd ? 'Al final del período' : 'No programada'}
              </p>
            </div>
          </div>

          {subscription.cancelAtPeriodEnd && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Tu suscripción se cancelará el {subscription.currentPeriodEnd.toLocaleDateString('es-ES')}.
                Puedes reactivarla en cualquier momento.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Métodos de Pago
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <p className="text-muted-foreground">No hay métodos de pago guardados</p>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {method.card.brand.toUpperCase()} •••• {method.card.last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expira {method.card.expMonth}/{method.card.expYear}
                      </p>
                    </div>
                    {method.isDefault && (
                      <Badge variant="secondary">Predeterminado</Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Gestionar Suscripción</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1">
              <Settings className="mr-2 w-4 h-4" />
              Cambiar Plan
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {/* Navigate to payment methods */}}
            >
              <CreditCard className="mr-2 w-4 h-4" />
              Gestionar Pagos
            </Button>
            {!subscription.cancelAtPeriodEnd && (
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={handleCancelSubscription}
                disabled={canceling}
              >
                {canceling ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <XCircle className="mr-2 w-4 h-4" />
                )}
                Cancelar Suscripción
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;
