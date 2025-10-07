import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { useAuthWithRetry } from '@/hooks/useAuthWithRetry';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Loader2 } from 'lucide-react';
import type { User } from '@/types';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    postalCode: '',
    userType: 'owner' as 'owner' | 'walker'
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { signUpWithRetry, loading: retryLoading } = useAuthWithRetry();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t('common.error'),
        description: t('auth.passwordsDontMatch'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        postalCode: formData.postalCode,
        userType: formData.userType
      };

      // Try the retry approach first
      try {
        await signUpWithRetry(formData.email, formData.password, userData);
        
        toast({
          title: t('auth.accountCreated'),
          description: t('auth.accountCreatedSuccess'),
        });
      } catch (retryError: any) {
        // If retry fails, fall back to original method
        console.log('Retry method failed, trying original method:', retryError);
        await signUp(formData.email, formData.password, userData);
        
        toast({
          title: t('auth.accountCreated'),
          description: t('auth.accountCreatedSuccess'),
        });
      }
    } catch (error: any) {
      // Handle specific error types
      let errorTitle = t('auth.signupError');
      let errorDescription = error.message || t('auth.tryAgain');
      
      if (error.message.includes('rate limit') || error.message.includes('For security purposes')) {
        errorTitle = t('auth.rateLimitTitle');
        errorDescription = t('auth.rateLimitMessage');
      } else if (error.message.includes('already registered')) {
        errorTitle = t('auth.emailExistsTitle');
        errorDescription = t('auth.emailExistsMessage');
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-center flex-1">{t('auth.createAccount')}</h2>
          <LanguageSelector />
        </div>
        <p className="text-center text-muted-foreground">
          {t('app.description')}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t('auth.name')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('auth.name')}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={t('auth.email')}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">{t('auth.phone')}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder={t('auth.phone')}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="city">{t('auth.city')}</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder={t('auth.city')}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="postalCode">{t('auth.postalCode')}</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              placeholder={t('auth.postalCode')}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="userType">{t('auth.userType')}</Label>
            <Select
              value={formData.userType}
              onValueChange={(value) => handleInputChange('userType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('auth.userType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">{t('auth.dogOwner')}</SelectItem>
                <SelectItem value="walker">{t('auth.wantToWalk')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder={t('auth.password')}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder={t('auth.confirmPassword')}
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading || retryLoading}
          >
            {(loading || retryLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('auth.createAccount')}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.alreadyHaveAccount')}{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-terracotta hover:underline"
            >
              {t('auth.login')}
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignupForm; 