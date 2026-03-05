import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import RoleSelection from '@/components/auth/RoleSelection';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { playNotificationSound } from '@/lib/sounds';

const AuthNew = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const mode = searchParams.get('mode') || 'login';

  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<'owner' | 'walker' | 'both' | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Redirect if already logged in (initial session check with timeout)
  useEffect(() => {
    const SESSION_TIMEOUT_MS = 5000;
    const checkUser = async () => {
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null } }), SESSION_TIMEOUT_MS)
        );
        const { data } = await Promise.race([sessionPromise, timeoutPromise]);
        if (data?.session?.user && mode === 'login') {
          navigate('/dashboard');
        }
      } catch {
        // Ignore; show login form
      }
    };
    checkUser();
  }, [mode, navigate]);

  // When auth state arrives late (e.g. after loading timeout), redirect to dashboard if on login
  useEffect(() => {
    if (currentUser && mode === 'login') {
      navigate('/dashboard');
    }
  }, [currentUser, mode, navigate]);

  // Handle email confirmation redirect
  useEffect(() => {
    const checkConfirmation = async () => {
      const confirmed = searchParams.get('confirmed');
      if (confirmed === 'true') {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.email_confirmed_at) {
          const role = user.user_metadata?.role || user.user_metadata?.user_type;
          
          toast({
            title: "Email Confirmed!",
            description: "Let's complete your profile setup",
          });
          
          if (role === 'owner') {
            navigate('/pet-profile-setup');
          } else if (role === 'walker' || role === 'sitter') {
            navigate('/sitter-profile-setup');
          } else {
            navigate('/dashboard');
          }
        }
      }
    };
    
    checkConfirmation();
  }, [searchParams, navigate, toast]);

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
    setConnectionError(false);

    // Safety: always clear loading after 12s so button never stays stuck
    const safetyTimer = setTimeout(() => {
      setLoading(false);
      setConnectionError(true);
    }, 12000);

    try {
      if (mode === 'signup' && !agreed) {
        clearTimeout(safetyTimer);
        toast({
          title: "Agreement Required",
          description: "Please agree to the terms and privacy policy to continue.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (mode === 'login') {
        const LOGIN_TIMEOUT_MS = 8000;
        const timeoutMsg = (typeof t === 'function' ? t('auth.connectionTimeout') : null) || 'Connection timed out. Check your connection and try again.';
        const loginPromise = supabase.auth.signInWithPassword({ email, password });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(timeoutMsg)), LOGIN_TIMEOUT_MS)
        );
        const { data, error } = await Promise.race([loginPromise, timeoutPromise]);
        if (error) throw error;

        console.log('Login successful, user:', data.user?.id);

        toast({
          title: "Success!",
          description: "Logged in successfully!",
        });

        await new Promise(resolve => setTimeout(resolve, 300));
        window.location.href = '/dashboard';
        return;
      } else {
        // Signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?confirmed=true`,
            data: {
              name,
              city,
              postal_code: postalCode,
              phone,
              role: selectedRole || 'owner',
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
          navigate('/pet-profile-setup');
        } else if (selectedRole === 'walker') {
          navigate('/sitter-profile-setup');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      const msg = error?.message || '';
      const isOffline = /failed to fetch|network error|load failed|503|service unavailable/i.test(msg);
      const isTimeout = /timed out|timeout/i.test(msg) && !isOffline;
      const isConnection = isOffline || isTimeout || /connection/i.test(msg);
      if (isConnection) setConnectionError(true);
      const displayMsg = isOffline
        ? (t('auth.serviceUnavailable') || 'Service temporarily unavailable. Please try again in a moment.')
        : (msg || 'An error occurred');
      toast({
        title: "Error",
        description: displayMsg,
        variant: "destructive",
      });
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  };

  // Show role selection for signup (with header so back button works)
  if (step === 'role' && mode === 'signup') {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-role-background-light dark:bg-role-background-dark group/design-root overflow-x-hidden font-display">
        <div className="sticky top-0 z-10 flex items-center bg-role-background-light/80 dark:bg-role-background-dark/80 p-4 pb-2 justify-between backdrop-blur-sm">
          <div className="flex size-12 shrink-0 items-center justify-start">
            <button onClick={() => navigate('/home')}>
              <span className="material-symbols-outlined text-role-text-light dark:text-role-text-dark text-2xl">arrow_back</span>
            </button>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center text-role-text-light dark:text-role-text-dark">
            {t('auth.createAccount')}
          </h2>
          <div className="flex w-12 items-center justify-end">
            <LanguageSwitcher />
          </div>
        </div>
        <RoleSelection onSelectRole={handleRoleSelect} />
      </div>
    );
  }

  // Show login/signup form
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-role-background-light dark:bg-role-background-dark group/design-root overflow-x-hidden font-display">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 flex items-center bg-role-background-light/80 dark:bg-role-background-dark/80 p-4 pb-2 justify-between backdrop-blur-sm">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <button onClick={() => navigate('/home')}>
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

            {mode === 'signup' && (
              <div className="flex items-start gap-3 px-1 mt-4">
                <input
                  type="checkbox"
                  id="agreed"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-border-light text-role-primary focus:ring-role-primary"
                />
                <label htmlFor="agreed" className="text-sm text-role-text-light/80 dark:text-role-text-dark/80 leading-snug">
                  I agree to the{' '}
                  <button 
                    type="button" 
                    onClick={() => navigate('/user-agreement')}
                    className="font-bold underline text-role-primary hover:text-role-primary/80"
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button 
                    type="button" 
                    onClick={() => navigate('/user-agreement')}
                    className="font-bold underline text-role-primary hover:text-role-primary/80"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (mode === 'signup' && !agreed)}
              className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-role-primary text-role-background-dark text-base font-bold leading-normal tracking-[0.015em] mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : mode === 'login' ? t('auth.login') : t('auth.createAccount')}
            </button>

            {mode === 'login' && connectionError && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/15 dark:bg-amber-600/15 border border-amber-500/30 dark:border-amber-600/30">
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                  {typeof t === 'function' ? t('auth.connectionHint') : "Can't reach server. Try Wi‑Fi or another network, then tap Retry."}
                </p>
                <button
                  type="button"
                  onClick={() => setConnectionError(false)}
                  className="text-sm font-semibold text-amber-800 dark:text-amber-200 underline"
                >
                  {t('common.retry')}
                </button>
              </div>
            )}

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

