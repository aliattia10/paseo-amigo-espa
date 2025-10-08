import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Starting callback handling...');
        
        // Wait a moment for URL to be fully loaded
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the current URL hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('AuthCallback: URL params:', { error, errorDescription, type, hasTokens: !!(accessToken && refreshToken) });

        if (error) {
          // Handle error cases
          console.error('Auth callback error:', error, errorDescription);
          
          let errorMessage = t('auth.confirmationError');
          if (error === 'access_denied') {
            if (errorDescription?.includes('expired')) {
              errorMessage = t('auth.emailExpired');
            } else {
              errorMessage = t('auth.accessDenied');
            }
          } else if (errorDescription) {
            errorMessage = errorDescription;
          }
          
          setStatus('error');
          setMessage(errorMessage);
          
          // Show error toast
          toast({
            title: t('auth.confirmationError'),
            description: errorMessage,
            variant: "destructive",
          });
          
          // Redirect to home after showing error
          setTimeout(() => {
            navigate('/');
          }, 3000);
          return;
        }

        // Handle email confirmation or password reset
        if (type === 'signup' || type === 'recovery' || accessToken) {
          console.log('AuthCallback: Handling email confirmation/password reset...');
          
          if (accessToken && refreshToken) {
            // Set the session with the tokens
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error('Session error:', sessionError);
              setStatus('error');
              setMessage(t('auth.sessionError'));
              
              toast({
                title: t('auth.confirmationError'),
                description: sessionError.message,
                variant: "destructive",
              });
              
              setTimeout(() => {
                navigate('/');
              }, 3000);
              return;
            }

            // Check if this is a password reset or email confirmation
            if (type === 'recovery') {
              // This is a password reset, redirect to reset password page
              console.log('AuthCallback: Password reset detected, redirecting to reset page...');
              navigate('/auth/reset-password');
              return;
            } else {
              // This is email confirmation
              setStatus('success');
              setMessage(t('auth.emailConfirmed'));
              
              toast({
                title: t('auth.emailConfirmed'),
                description: t('auth.welcomeToApp'),
              });
              
              // Redirect to home page after successful confirmation
              setTimeout(() => {
                navigate('/');
              }, 2000);
            }
          } else {
            // No tokens in URL, try to get current session
            console.log('AuthCallback: No tokens in URL, checking current session...');
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('Get session error:', error);
              setStatus('error');
              setMessage(t('auth.sessionError'));
              
              setTimeout(() => {
                navigate('/');
              }, 3000);
              return;
            }
            
            if (data.session) {
              // Session exists, success!
              console.log('AuthCallback: Session found, success!');
              setStatus('success');
              setMessage(t('auth.emailConfirmed'));
              
              toast({
                title: t('auth.emailConfirmed'),
                description: t('auth.welcomeToApp'),
              });
              
              setTimeout(() => {
                navigate('/');
              }, 2000);
            } else {
              // No session found
              console.log('AuthCallback: No session found');
              setStatus('error');
              setMessage(t('auth.noSession'));
              
              setTimeout(() => {
                navigate('/');
              }, 3000);
            }
          }
        } else {
          // Unknown callback type
          console.log('AuthCallback: Unknown callback type, redirecting to home...');
          setStatus('success');
          setMessage('Redirecting...');
          setTimeout(() => {
            navigate('/');
          }, 1000);
        }
      } catch (error: any) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage(t('auth.confirmationError'));
        
        toast({
          title: t('auth.confirmationError'),
          description: error.message || t('auth.tryAgain'),
          variant: "destructive",
        });
        
        setTimeout(() => {
          navigate('/');
        }, 3000);
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
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-lg font-medium text-green-700">{message}</p>
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
        <CardContent className="pt-6">
          {renderStatus()}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
