import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { requiresEmailVerification } from '@/lib/auth-email-verification';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useToast } from '@/hooks/use-toast';

const VerifyEmailPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, logout } = useAuth();
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth', { replace: true });
      return;
    }
    if (!requiresEmailVerification(currentUser)) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const refresh = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        navigate('/dashboard', { replace: true });
      }
    };
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener('focus', onFocus);
    const id = window.setInterval(refresh, 8000);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.clearInterval(id);
    };
  }, [navigate]);

  const handleResend = async () => {
    const email = currentUser?.email;
    if (!email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?confirmed=true`,
        },
      });
      if (error) throw error;
      toast({
        title: t('auth.checkEmailTitle', 'Check your email'),
        description: t('auth.resendVerificationSent', 'Verification email sent. Check your inbox.'),
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({
        title: t('common.error', 'Error'),
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-role-background-light dark:bg-role-background-dark px-4 py-6">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-role-text-light dark:text-role-text-dark">
            {t('auth.verifyEmailTitle', 'Confirm your email')}
          </h1>
          <LanguageSwitcher />
        </div>

        <div className="rounded-2xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-6 shadow-sm">
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
            {t(
              'auth.verifyEmailBody',
              'We sent a link to {{email}}. Open it to verify your account before using Petflik.',
              { email: currentUser?.email ?? '' }
            )}
          </p>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-6">
            {t('auth.verifyEmailHint', 'After you verify, return here — we will redirect you automatically.')}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              className="flex-1"
              disabled={resending}
              onClick={() => void handleResend()}
            >
              {resending
                ? t('common.loading', 'Loading...')
                : t('auth.resendVerificationEmail', 'Resend email')}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => void logout()}>
              {t('auth.verifyEmailSignOut', 'Sign out')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
