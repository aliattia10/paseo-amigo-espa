import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import RoleSelection from '@/components/auth/RoleSelection';

const AuthNew = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
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

  // If mode is login, skip role selection
  useEffect(() => {
    if (mode === 'login') {
      setStep('form');
    }
  }, [mode]);

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
        const { error } = await supabase.auth.signUp({
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
        toast({
          title: "Success!",
          description: "Check your email to confirm your account.",
        });
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
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h2>
        <div className="flex w-12 items-center justify-end"></div>
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
                      <span className="text-sm font-medium text-role-text-light dark:text-role-text-dark">Name</span>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="rounded-lg border-border-light dark:border-border-dark"
                        placeholder="Your full name"
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-xl bg-card-light dark:bg-card-dark shadow-sm overflow-hidden">
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-role-text-light dark:text-role-text-dark">City</span>
                      <Input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="rounded-lg border-border-light dark:border-border-dark"
                        placeholder="Your city"
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-role-text-light dark:text-role-text-dark">Postal Code</span>
                      <Input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required
                        className="rounded-lg border-border-light dark:border-border-dark"
                        placeholder="Postal code"
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-xl bg-card-light dark:bg-card-dark shadow-sm overflow-hidden">
                  <div className="p-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-role-text-light dark:text-role-text-dark">Phone</span>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="rounded-lg border-border-light dark:border-border-dark"
                        placeholder="Your phone number"
                      />
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="rounded-xl bg-card-light dark:bg-card-dark shadow-sm overflow-hidden">
              <div className="p-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-role-text-light dark:text-role-text-dark">Email</span>
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
                  <span className="text-sm font-medium text-role-text-light dark:text-role-text-dark">Password</span>
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
              {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            <p className="text-role-text-light/70 dark:text-role-text-dark/70 text-sm text-center mt-4">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => navigate(`/auth?mode=${mode === 'login' ? 'signup' : 'login'}`)}
                className="font-bold underline text-role-primary"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AuthNew;

