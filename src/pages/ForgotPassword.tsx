import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

const ForgotPassword: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: t('common.error'),
        description: t('auth.enterEmailFirst'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: t('auth.resetPasswordSent'),
        description: t('auth.checkEmailForReset'),
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('auth.resetPasswordError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/auth?mode=login')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Button>
            <LanguageSwitcher />
          </div>
          <CardTitle className="text-2xl text-center">{t('auth.forgotPassword')}</CardTitle>
          <CardDescription className="text-center">
            {emailSent 
              ? t('auth.resetPasswordSent')
              : t('auth.sendResetLink')
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <p className="text-muted-foreground">
                {t('auth.checkEmailForReset')} <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                {t('auth.checkEmailForReset')}
              </p>
              <Button 
                onClick={() => navigate('/auth?mode=login')}
                className="w-full bg-terracotta hover:bg-terracotta/90"
              >
                {t('auth.login')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-terracotta hover:bg-terracotta/90"
                disabled={loading}
              >
                {loading ? t('common.loading') : t('auth.sendResetLink')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
