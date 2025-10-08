import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: t('auth.welcome'),
        description: t('auth.loginSuccess'),
      });
    } catch (error: any) {
      console.error('Login error:', error); // <-- Add this line for debugging
      toast({
        title: t('auth.loginError'),
        description: error?.message ? String(error.message) : t('auth.tryAgain'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: t('auth.resetPassword'),
        description: t('auth.enterEmailFirst'),
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: t('auth.resetPasswordSent'),
        description: t('auth.checkEmailForReset'),
      });
      
      setShowResetForm(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: t('auth.resetPasswordError'),
        description: error?.message || t('auth.tryAgain'),
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-center flex-1">{t('auth.login')}</h2>
          <LanguageSelector />
        </div>
        <p className="text-center text-muted-foreground">
          {t('app.description')}
        </p>
      </CardHeader>
      <CardContent>
        {showResetForm ? (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <Label htmlFor="resetEmail">{t('auth.email')}</Label>
              <Input
                id="resetEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.email')}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={resetLoading}
            >
              {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.sendResetLink')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowResetForm(false)}
            >
              {t('common.back')}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.email')}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.password')}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.login')}
            </Button>
          </form>
        )}
        
        <div className="mt-4 space-y-2">
          {!showResetForm && (
            <div className="text-center">
              <button
                onClick={() => setShowResetForm(true)}
                className="text-sm text-primary hover:underline"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>
          )}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth.alreadyHaveAccount')}{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-terracotta hover:underline"
              >
                {t('auth.signup')}
              </button>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;