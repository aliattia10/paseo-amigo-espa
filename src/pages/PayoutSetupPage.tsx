import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  CreditCard,
  Shield,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export const PayoutSetupPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [connectAccount, setConnectAccount] = useState<any>(null);

  useEffect(() => {
    loadConnectAccount();
    
    // Handle return from Stripe onboarding
    if (searchParams.get('success') === 'true') {
      toast({
        title: '¡Configuración completada!',
        description: 'Tu cuenta de pagos está lista para recibir fondos',
      });
      loadConnectAccount();
    }
    
    if (searchParams.get('refresh') === 'true') {
      toast({
        title: 'Sesión expirada',
        description: 'Por favor, completa la configuración nuevamente',
        variant: 'destructive',
      });
    }
  }, [searchParams]);

  const loadConnectAccount = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('stripe_connect_accounts')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setConnectAccount(data);
    } catch (error) {
      console.error('Error loading Connect account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-connect-account`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create Connect account');
      }

      const { accountId } = await response.json();
      
      // Now create onboarding link
      await handleStartOnboarding();
      
    } catch (error) {
      console.error('Error creating Connect account:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la cuenta de pagos',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleStartOnboarding = async () => {
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-onboarding-link`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
            'Origin': window.location.origin,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create onboarding link');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe onboarding
      window.location.href = url;
      
    } catch (error) {
      console.error('Error starting onboarding:', error);
      toast({
        title: 'Error',
        description: 'No se pudo iniciar la configuración',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Account is fully set up
  if (connectAccount?.payouts_enabled && connectAccount?.charges_enabled) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h1 className="text-2xl font-bold mb-2">¡Cuenta configurada!</h1>
          <p className="text-gray-600 mb-6">
            Tu cuenta está lista para recibir pagos de forma segura
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-semibold">Verificado</p>
              <p className="text-xs text-gray-600">Identidad confirmada</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-semibold">Pagos activos</p>
              <p className="text-xs text-gray-600">Puedes recibir fondos</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-semibold">Transferencias</p>
              <p className="text-xs text-gray-600">Automáticas a tu banco</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <h3 className="font-semibold mb-2">Detalles de la cuenta</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">País:</span>
                <span className="font-medium">{connectAccount.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Moneda:</span>
                <span className="font-medium">{connectAccount.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo de cuenta:</span>
                <span className="font-medium capitalize">{connectAccount.account_type}</span>
              </div>
            </div>
          </div>

          <Button onClick={() => navigate('/profile')} className="w-full">
            Volver al perfil
          </Button>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">💡 ¿Cómo funcionan los pagos?</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✅ Los clientes pagan a través de la plataforma</li>
            <li>✅ Retenemos el pago hasta que completes el servicio</li>
            <li>✅ Después del servicio, transferimos el dinero a tu cuenta</li>
            <li>✅ Comisión de plataforma: 20% (estándar del sector)</li>
            <li>✅ Transferencias automáticas cada 2-7 días</li>
          </ul>
        </div>
      </div>
    );
  }

  // Account exists but needs onboarding
  if (connectAccount && !connectAccount.onboarding_completed) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-2xl font-bold mb-2 text-center">
            Completa tu configuración
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Necesitas completar algunos pasos para recibir pagos
          </p>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Información requerida:</strong>
            </p>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
              <li>• Documento de identidad (DNI/NIE)</li>
              <li>• Datos bancarios (IBAN)</li>
              <li>• Dirección de residencia</li>
              <li>• Información fiscal</li>
            </ul>
          </div>

          <Button
            onClick={handleStartOnboarding}
            disabled={creating}
            className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg"
          >
            {creating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                Continuar configuración
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Serás redirigido a Stripe para completar la verificación de forma segura
          </p>
        </Card>
      </div>
    );
  }

  // No account yet - show welcome screen
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-8">
        <CreditCard className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h1 className="text-2xl font-bold mb-2 text-center">
          Configura tus pagos
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Conecta tu cuenta bancaria para recibir pagos de forma segura
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-green-900">100% Seguro</h3>
              <p className="text-sm text-green-700">
                Procesado por Stripe, líder mundial en pagos online. Tus datos bancarios nunca se almacenan en nuestra plataforma.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900">Transferencias automáticas</h3>
              <p className="text-sm text-blue-700">
                Recibe tus ganancias directamente en tu cuenta bancaria cada 2-7 días.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-purple-900">Verificación rápida</h3>
              <p className="text-sm text-purple-700">
                Solo toma 5 minutos. Necesitarás tu DNI/NIE y datos bancarios.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleCreateAccount}
          disabled={creating}
          className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg"
        >
          {creating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            <>
              Comenzar configuración
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Al continuar, aceptas los términos de servicio de Stripe
        </p>
      </Card>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">❓ Preguntas frecuentes</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-gray-900">¿Cuánto cobra la plataforma?</p>
            <p className="text-gray-600">20% de comisión por cada servicio completado.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">¿Cuándo recibo mi dinero?</p>
            <p className="text-gray-600">Automáticamente 2-7 días después de completar el servicio.</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">¿Es seguro?</p>
            <p className="text-gray-600">Sí, Stripe es usado por millones de empresas en todo el mundo.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
