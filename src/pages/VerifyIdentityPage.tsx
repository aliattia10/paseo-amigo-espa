import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Loader2, ArrowRight, AlertTriangle } from 'lucide-react';

const VerifyIdentityPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, userProfile, loading: authLoading, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [starting, setStarting] = useState(false);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/auth');
      return;
    }
  }, [authLoading, currentUser, navigate]);

  const handleStartVerification = async () => {
    if (!currentUser?.id || !userProfile) {
      toast({ title: t('common.error'), description: t('auth.pleaseLogInAgain', 'Please log in again'), variant: 'destructive' });
      return;
    }
    setStarting(true);
    setServiceUnavailable(false);
    try {
      const callbackUrl = `${window.location.origin}/verify-identity-done`;
      const { data, error } = await supabase.functions.invoke('create-didit-session', {
        body: { userType: userProfile.userType, callback_url: callbackUrl },
      });
      if (error) throw error;
      const url = data?.url;
      if (!url) throw new Error('No verification URL returned');
      setStarting(false);

      // Try the SDK first, fall back to opening the URL directly
      try {
        const { DiditSdk } = await import('@didit-protocol/sdk-web');

        DiditSdk.shared.onComplete = (result: any) => {
          if (result.type === 'completed') {
            toast({
              title: t('verifyIdentity.successTitle', 'Verification submitted'),
              description: t('verifyIdentity.successDesc', "Your identity is being verified. You'll be updated when it's approved."),
            });
            refreshUserProfile();
            navigate('/dashboard');
          } else if (result.type === 'cancelled') {
            toast({
              title: t('verifyIdentity.cancelled', 'Verification cancelled'),
              variant: 'default',
            });
          } else if (result.type === 'failed') {
            toast({
              title: t('common.error', 'Error'),
              description: result.error?.message || t('verifyIdentity.failed', 'Verification failed'),
              variant: 'destructive',
            });
          }
        };

        await DiditSdk.shared.startVerification({ url });
      } catch {
        // SDK failed to load — open URL in a new tab as fallback
        window.open(url, '_blank');
        toast({
          title: t('verifyIdentity.openedInTab', 'Verification opened'),
          description: t('verifyIdentity.openedInTabDesc', 'Complete the verification in the new tab, then come back.'),
        });
      }
    } catch (err: unknown) {
      setStarting(false);
      const raw = err instanceof Error ? err.message : String(err);
      const isConfigError = /non-2xx|400|500|server configuration|workflow|api key/i.test(raw);
      if (isConfigError) {
        setServiceUnavailable(true);
      } else {
        toast({
          title: t('common.error', 'Error'),
          description: raw || t('verifyIdentity.failed', 'Failed to start verification'),
          variant: 'destructive',
          duration: 8000,
        });
      }
    }
  };

  const handleSkip = () => {
    if (userProfile?.userType === 'owner') navigate('/pet-profile-setup');
    else if (userProfile?.userType === 'walker') navigate('/sitter-profile-setup');
    else navigate('/dashboard');
  };

  if (authLoading || !currentUser?.id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-ash-grey/20 via-white to-muted-olive/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-medium-jungle dark:text-sage-green mb-4" />
        <p className="text-gray-600 dark:text-gray-300">{t('common.loading', 'Loading...')}</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-ash-grey/20 via-white to-muted-olive/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-medium-jungle dark:text-sage-green mb-4" />
        <p className="text-gray-600 dark:text-gray-300">{t('common.loading', 'Loading profile...')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ash-grey/20 via-white to-muted-olive/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-sage-green/20 dark:bg-sage-green/30 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-10 h-10 text-medium-jungle dark:text-sage-green" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {t('verifyIdentity.title', 'Verify your identity')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('verifyIdentity.description', 'To keep our community safe, we ask you to verify your identity with a quick ID check. This only takes a minute.')}
        </p>

        {serviceUnavailable && (
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-left">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {t('verifyIdentity.unavailableTitle', 'Temporarily unavailable')}
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                {t('verifyIdentity.configError', 'ID verification is temporarily unavailable. Please try again later or skip for now.')}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4">
          <Button
            size="lg"
            className="w-full bg-medium-jungle hover:bg-medium-jungle/90 text-white"
            onClick={handleStartVerification}
            disabled={starting || !currentUser?.id || !userProfile}
          >
            {starting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t('verifyIdentity.starting', 'Starting...')}
              </>
            ) : (
              <>
                {t('verifyIdentity.start', 'Start verification')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          <Button variant="ghost" className="w-full text-gray-600 dark:text-gray-400" onClick={handleSkip}>
            {t('verifyIdentity.skip', 'Skip for now')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyIdentityPage;
