import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

const SUPABASE_URL = 'https://zxbfygofxxmfivddwdqt.supabase.co';

export const PayoutSetupPage: React.FC = () => {
  const { t } = useTranslation();
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
        title: t('payout.setup_complete'),
        description: t('payout.ready_to_receive'),
      });
      loadConnectAccount();
    }
    
    if (searchParams.get('refresh') === 'true') {
      toast({
        title: t('payout.session_expired'),
        description: t('payout.complete_again'),
        variant: 'destructive',
      });
    }
  }, [searchParams, t]);

  const loadConnectAccount = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('stripe_connect_accounts')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading account:', error);
      }

      setConnectAccount(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No session found');
      }

      console.log('Creating Connect account...');
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/create-connect-account`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const responseText = await response.text();
      console.log('Response:', response.status, responseText);

      if (!response.ok) {
        throw new Error(`Failed to create account: ${responseText}`);
      }

      const result = JSON.parse(responseText);
      console.log('Account created:', result);
      
      // Now create onboarding link
      await handleStartOnboarding();
      
    } catch (error: any) {
      console.error('Error creating Connect account:', error);
      toast({
        title: t('common.error'),
        description: error.message || t('payout.create_failed'),
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
      
      if (!session) {
        throw new Error('No session found');
      }

      console.log('Creating onboarding link...');
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/create-onboarding-link`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            returnUrl: `${window.location.origin}/payout-setup?success=true`,
            refreshUrl: `${window.location.origin}/payout-setup?refresh=true`,
          }),
        }
      );

      const responseText = await response.text();
      console.log('Onboarding response:', response.status, responseText);

      if (!response.ok) {
        throw new Error(`Failed to create onboarding link: ${responseText}`);
      }

      const { url } = JSON.parse(responseText);
      
      // Redirect to Stripe onboarding
      window.location.href = url;
      
    } catch (error: any) {
      console.error('Error starting onboarding:', error);
      toast({
        title: t('common.error'),
        description: error.message || t('payout.onboarding_failed'),
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
          <h1 className="text-2xl font-bold mb-2">{t('payout.account_ready')}</h1>
          <p className="text-gray-600 mb-6">
            {t('payout.ready_description')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-semibold">{t('payout.verified')}</p>
              <p className="text-xs text-gray-600">{t('payout.identity_confirmed')}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-semibold">{t('payout.payments_active')}</p>
              <p className="text-xs text-gray-600">{t('payout.can_receive')}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-semibold">{t('payout.transfers')}</p>
              <p className="text-xs text-gray-600">{t('payout.automatic_bank')}</p>
            </div>
          </div>

          <Button onClick={() => navigate('/profile')} className="w-full">
            {t('payout.back_to_profile')}
          </Button>
        </Card>
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
            {t('payout.complete_setup')}
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            {t('payout.complete_description')}
          </p>

          <Button
            onClick={handleStartOnboarding}
            disabled={creating}
            className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg"
          >
            {creating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              <>
                {t('payout.continue_setup')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
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
          {t('payout.setup_payouts')}
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          {t('payout.connect_bank')}
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-green-900">{t('payout.secure')}</h3>
              <p className="text-sm text-green-700">
                {t('payout.secure_description')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900">{t('payout.automatic_transfers')}</h3>
              <p className="text-sm text-blue-700">
                {t('payout.automatic_description')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-purple-900">{t('payout.quick_verification')}</h3>
              <p className="text-sm text-purple-700">
                {t('payout.quick_description')}
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
              {t('payout.creating_account')}
            </>
          ) : (
            <>
              {t('payout.start_setup')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-4">
          {t('payout.stripe_terms')}
        </p>
      </Card>
    </div>
  );
};
