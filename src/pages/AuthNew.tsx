import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import RoleSelection from '@/components/auth/RoleSelection';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { playNotificationSound } from '@/lib/sounds';

const AuthNew = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const mode = searchParams.get('mode') || 'login';

  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<'owner' | 'walker' | 'both' | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');

  // If mode is login or role is provided in URL, skip role selection
  useEffect(() => {
    const roleFromUrl = searchParams.get('role') as 'owner' | 'walker' | null;
    
    if (mode === 'login') {
      setStep('form');
    } else if (mode === 'signup' && roleFromUrl) {
      // Role already selected from RoleSelectionPage
      setSelectedRole(roleFromUrl);
      setStep('form');
    }
  }, [mode, searchParams]);

  const handleRoleSelect = (role: 'owner' | 'walker' | 'both') => {
    setSelectedRole(role);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/');
      } else {
        // Signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              name,
              city,
              postal_code: postalCode,
              phone,
              user_type: selectedRole || 'owner'
            }
          }
        });
        if (error) throw error;
        
        // Create user profile in database
        if (data.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              name,
              email,
              phone,
              city,
              postal_code: postalCode,
              user_type: selectedRole || 'owner',
            });
          
          if (profileError) {
            // Log error but don't block signup if table doesn't exist
            if (profileError.message.includes('does not exist') || profileError.message.includes('not find')) {
              console.warn('Users table not found. Profile will be created on first login. Please run database migrations.');
            } else {
              console.error('Profile creation error:', profileError);
            }
          }
          
          // Send welcome notification
          try {
            await supabase
              .from('notifications')
              .insert({
                user_id: data.user.id,
                type: 'welcome',
                title: '🎉 Welcome to Petflik!',
                message: `Hi ${name}! We're excited to have you join our community. ${selectedRole === 'owner' ? 'Start browsing sitters for your furry friend!' : 'Start connecting with pet owners in your area!'}`,
                read: false
              });
            
            // Play welcome sound
            setTimeout(() => playNotificationSound(), 500);
          } catch (notifError) {
            console.warn('Could not create welcome notification:', notifError);
          }
        }
        
        toast({
          title: "Success!",
          description: "Account created successfully!",
        });
        
        // Redirect to appropriate profile setup
        if (selectedRole === 'owner') {
          navigate('/dog-profile-setup');
        } else if (selectedRole === 'walker') {
          navigate('/sitter-profile-setup');
        } else {
          navigate('/');
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'An error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show role selection for signup
  if (step === 'role' && mode === 'signup') {
    return <RoleSelection onSelectRole={handleRoleSelect} />;
  }

  // Show login/signup form
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-role-background-light dark:bg-role-background-dark group/design-root overflow-x-hidden font-display">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 flex items-center bg-role-background-light/80 dark:bg-role-background-dark/80 p-4 pb-2 justify-between backdrop-blur-sm">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <button onClick={() => mode === 'signup' && step === 'form' ? setStep('role') : navigate('/')}>
            <span className="material-symbols-outlined text-role-text-light dark:text-role-text-dark text-2xl">arrow_back</span>
          </button>
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center text-role-text-light dark:text-role-text-dark">
          {mode === 'login' ? t('auth.login') : t('auth.createAccount')}
        </h2>
        <div className="flex w-12 items-center justify-end">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Form Content */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-[480px] mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="rounded-xl bg-card-light dark:bg-card-dark shadow-sm overflow-hidden">
                  <div className="p-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-role-text-light dark:text-role-text-dark">{t('auth.name')}</span>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="rounded-lg border-border-light dark:border-border-dark"
                        placeholder={t('auth.name')}
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-xl bg-card-light dark:bg-card-dark shadow-sm overflow-hidden">
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-role-text-light dark:text-role-text-dark">{t('auth.city')}</span>
                      <Input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="rounded-lg border-border-light dark:border-border-dark"
                        placeholder={t('auth.city')}
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-role-text-light dark:text-role-text-dark">{t('auth.postalCode')}</span>
                      <Input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required
                        className="rounded-lg border-border-light dark:border-border-dark"
                        placeholder={t('auth.postalCode')}
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-xl bg-card-light dark:bg-card-dark shadow-sm overflow-hidden">
                  <div className="p-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-role-text-light dark:text-role-text-dark">{t('auth.phone')}</span>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="rounded-lg border-border-light dark:border-border-dark"
                        placeholder={t('auth.phone')}
                      />
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="rounded-xl bg-card-light dark:bg-card-dark shadow-sm overflow-hidden">
              <div className="p-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-role-text-light dark:text-role-text-dark">{t('auth.email')}</span>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-lg border-border-light dark:border-border-dark"
                    placeholder="your@email.com"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-xl bg-card-light dark:bg-card-dark shadow-sm overflow-hidden">
              <div className="p-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-role-text-light dark:text-role-text-dark">{t('auth.password')}</span>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-lg border-border-light dark:border-border-dark"
                    placeholder="••••••••"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-role-primary text-role-background-dark text-base font-bold leading-normal tracking-[0.015em] mt-6"
            >
              {loading ? t('common.loading') : mode === 'login' ? t('auth.login') : t('auth.createAccount')}
            </button>

            <div className="space-y-2 mt-4">
              <p className="text-role-text-light/70 dark:text-role-text-dark/70 text-sm text-center">
                {mode === 'login' ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
                <button
                  type="button"
                  onClick={() => navigate(`/auth?mode=${mode === 'login' ? 'signup' : 'login'}`)}
                  className="font-bold underline text-role-primary ml-1"
                >
                  {mode === 'login' ? t('auth.signup') : t('auth.login')}
                </button>
              </p>

              {mode === 'login' && (
                <p className="text-role-text-light/70 dark:text-role-text-dark/70 text-sm text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="font-bold underline text-role-primary"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AuthNew;

