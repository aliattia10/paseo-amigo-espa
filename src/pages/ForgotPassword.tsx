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
      console.log('Sending password reset email to:', email);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out. Please try again.')), 15000)
      );
      
      // Use production domain for password reset
      const redirectUrl = window.location.hostname === 'localhost' 
        ? `${window.location.origin}/reset-password`
        : 'https://petflik.com/reset-password';
      
      const resetPromise = supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      const { error } = await Promise.race([resetPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Password reset error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('rate limit')) {
          throw new Error('Too many attempts. Please wait an hour and try again, or use a different email address.');
        }
        
        throw error;
      }

      console.log('Password reset email sent successfully');
      setEmailSent(true);
      
      toast({
        title: t('auth.emailSent'),
        description: t('auth.checkEmailForReset'),
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = error.message || t('auth.emailSendError');
      
      // User-friendly error messages
      if (errorMessage.includes('rate limit')) {
        errorMessage = t('auth.rateLimitError');
      } else if (errorMessage.includes('timeout')) {
        errorMessage = t('auth.timeoutError');
      } else if (errorMessage.includes('Invalid email')) {
        errorMessage = t('auth.invalidEmail');
      }
      
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/auth?mode=login')}
              className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Button>
            <LanguageSwitcher />
          </div>
          
          {/* Logo and Branding */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-4xl">pets</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Petflik</h1>
          </div>
          
          <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
            {t('auth.forgotPassword')}
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            {emailSent 
              ? t('auth.resetPasswordSent')
              : t('auth.sendResetLink')
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
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
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                {t('auth.login')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t('auth.email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      {t('common.loading')}
                    </span>
                  ) : (
                    t('auth.sendResetLink')
                  )}
                </Button>
                
                {loading && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setLoading(false);
                      toast({
                        title: t('common.cancelled'),
                        description: t('common.requestCancelled'),
                      });
                    }}
                    className="w-full"
                  >
                    {t('common.cancel')}
                  </Button>
                )}
                
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 px-4">
                  {loading 
                    ? t('auth.pleaseWaitMoment')
                    : t('auth.resetPasswordEmailInfo')
                  }
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
