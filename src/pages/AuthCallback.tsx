import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const OAUTH_SIGNUP_ROLE_KEY = 'oauth_signup_role';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const applySignupRoleFromStorage = async (userId: string) => {
      const raw = sessionStorage.getItem(OAUTH_SIGNUP_ROLE_KEY);
      sessionStorage.removeItem(OAUTH_SIGNUP_ROLE_KEY);
      if (!raw) return;
      const dbRole = raw === 'both' ? 'owner' : raw === 'walker' || raw === 'owner' ? raw : 'owner';
      try {
        await supabase.from('users').update({ user_type: dbRole, updated_at: new Date().toISOString() }).eq('id', userId);
        await supabase.auth.updateUser({ data: { user_type: dbRole, role: dbRole } });
      } catch (e) {
        console.warn('OAuth signup role update:', e);
      }
    };

    const isOAuthUser = (user: { identities?: { provider: string }[] } | null) =>
      Boolean(user?.identities?.some((i) => i.provider === 'google' || i.provider === 'apple'));

    const handleAuthCallback = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        // PKCE OAuth (Google, etc.): ?code=...
        if (code) {
          const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (exchangeErr) {
            console.error('exchangeCodeForSession:', exchangeErr);
            setStatus('error');
            setMessage(exchangeErr.message || t('auth.sessionError'));
            toast({
              title: t('auth.confirmationError'),
              description: exchangeErr.message,
              variant: 'destructive',
            });
            setTimeout(() => navigate('/auth?mode=login'), 3000);
            return;
          }
          window.history.replaceState({}, '', url.pathname);
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user?.id) {
            await applySignupRoleFromStorage(user.id);
          }
          // PKCE: Google OAuth uses ?code=; email magic links may also use ?code= (no OAuth identity)
          if (isOAuthUser(user)) {
            toast({
              title: t('auth.welcome', 'Welcome!'),
              description: t('auth.loginSuccess', 'You have successfully logged in.'),
            });
            navigate('/dashboard', { replace: true });
            return;
          }
          setStatus('success');
          setMessage(t('auth.emailConfirmed'));
          toast({
            title: t('auth.emailConfirmed'),
            description: t('auth.welcomeToApp'),
          });
          setTimeout(() => navigate('/profile/edit?prompt=complete'), 1500);
          return;
        }

        // Implicit / hash (email confirmation, some flows)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (error) {
          let errorMessage = t('auth.confirmationError');
          if (error === 'access_denied') {
            errorMessage = errorDescription?.includes('expired') ? t('auth.emailExpired') : t('auth.accessDenied');
          } else if (errorDescription) {
            errorMessage = errorDescription;
          }
          setStatus('error');
          setMessage(errorMessage);
          toast({
            title: t('auth.confirmationError'),
            description: errorMessage,
            variant: 'destructive',
          });
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            setStatus('error');
            setMessage(t('auth.sessionError'));
            toast({
              title: t('auth.confirmationError'),
              description: sessionError.message,
              variant: 'destructive',
            });
            setTimeout(() => navigate('/'), 3000);
            return;
          }

          window.history.replaceState(null, '', window.location.pathname + window.location.search);

          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (type === 'recovery') {
            navigate('/auth/reset-password');
            return;
          }

          if (user?.id) {
            await applySignupRoleFromStorage(user.id);
          }

          if (isOAuthUser(user)) {
            toast({
              title: t('auth.welcome', 'Welcome!'),
              description: t('auth.loginSuccess', 'You have successfully logged in.'),
            });
            navigate('/dashboard', { replace: true });
            return;
          }

          setStatus('success');
          setMessage(t('auth.emailConfirmed'));
          toast({
            title: t('auth.emailConfirmed'),
            description: t('auth.welcomeToApp'),
          });
          setTimeout(() => navigate('/profile/edit?prompt=complete'), 1500);
          return;
        }

        const { data, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) {
          setStatus('error');
          setMessage(t('auth.sessionError'));
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (data.session?.user) {
          const u = data.session.user;
          if (isOAuthUser(u)) {
            await applySignupRoleFromStorage(u.id);
            navigate('/dashboard', { replace: true });
            return;
          }
          setStatus('success');
          setMessage(t('auth.emailConfirmed'));
          setTimeout(() => navigate('/profile/edit?prompt=complete'), 1500);
          return;
        }

        setStatus('error');
        setMessage(t('auth.noSession'));
        setTimeout(() => navigate('/'), 3000);
      } catch (error: unknown) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage(t('auth.confirmationError'));
        const msg = error instanceof Error ? error.message : t('auth.tryAgain');
        toast({
          title: t('auth.confirmationError'),
          description: msg,
          variant: 'destructive',
        });
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, toast, t]);

  const renderStatus = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">{t('auth.confirmingEmail')}</p>
            <p className="text-sm text-muted-foreground">{t('auth.pleaseWait')}</p>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-12 w-12 text-medium-jungle" />
            <p className="text-lg font-medium text-medium-jungle">{message}</p>
            <p className="text-sm text-muted-foreground">{t('auth.redirectingHome')}</p>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500" />
            <p className="text-lg font-medium text-red-700">{message}</p>
            <p className="text-sm text-muted-foreground">{t('auth.redirectingHome')}</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">{renderStatus()}</CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
