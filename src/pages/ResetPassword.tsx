import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Lock } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'loading' | 'form' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Check if we have a valid session for password reset
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setStatus('error');
          setMessage(t('auth.sessionError'));
          return;
        }

        if (!session) {
          // No session, redirect to login
          toast({
            title: t('auth.resetPasswordError'),
            description: t('auth.noValidSession'),
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        // Session exists, show reset form
        setStatus('form');
      } catch (error: any) {
        console.error('Reset password error:', error);
        setStatus('error');
        setMessage(error.message || t('auth.resetPasswordError'));
      }
    };

    handlePasswordReset();
  }, [navigate, toast, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: t('auth.resetPasswordError'),
        description: t('auth.passwordsDontMatch'),
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: t('auth.resetPasswordError'),
        description: t('auth.passwordTooShort'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      setStatus('success');
      setMessage(t('auth.passwordUpdatedSuccess'));
      
      toast({
        title: t('auth.passwordUpdated'),
        description: t('auth.passwordUpdatedSuccess'),
      });

      // Redirect to home page after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        title: t('auth.resetPasswordError'),
        description: error.message || t('auth.tryAgain'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">{t('auth.validatingResetLink')}</p>
            <p className="text-sm text-muted-foreground">{t('auth.pleaseWait')}</p>
          </div>
        );

      case 'form':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-text mb-2">
                {t('auth.setNewPassword')}
              </h2>
              <p className="text-muted-foreground">
                {t('auth.enterNewPassword')}
              </p>
            </div>

            <div>
              <Label htmlFor="password">{t('auth.newPassword')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.newPassword')}
                required
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">{t('auth.confirmNewPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirmNewPassword')}
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.updatePassword')}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate('/auth')}
            >
              {t('common.back')}
            </Button>
          </form>
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
            <Button
              onClick={() => navigate('/auth')}
              className="mt-4"
            >
              {t('common.back')}
            </Button>
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
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
