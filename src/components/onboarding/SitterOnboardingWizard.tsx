import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, PawPrint, Sparkles, ChevronRight, Check } from 'lucide-react';

const TOTAL_STEPS = 3;

const PREFERENCE_OPTIONS = [
  { id: 'big_dogs', label: 'Big Dogs', emoji: '🐕' },
  { id: 'small_dogs', label: 'Small Dogs', emoji: '🐩' },
  { id: 'cats', label: 'Cats', emoji: '🐱' },
  { id: 'puppies', label: 'Puppies', emoji: '🐶' },
] as const;

const HOBBY_OPTIONS = [
  'Jogging',
  'Hiking',
  'Reading',
  'Photography',
  'Yoga',
  'Cooking',
  'Gardening',
  'Travel',
  'Music',
  'Art',
  'Swimming',
  'Cycling',
];

interface SitterOnboardingWizardProps {
  onComplete: () => void;
}

const SitterOnboardingWizard: React.FC<SitterOnboardingWizardProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [hasExperience, setHasExperience] = useState<boolean | null>(null);
  const [yearsExperience, setYearsExperience] = useState<number>(0);
  const [petsCaredFor, setPetsCaredFor] = useState<number>(0);
  const [sitterAge, setSitterAge] = useState<number>(18);

  const [preferences, setPreferences] = useState<string[]>([]);
  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const [hobbies, setHobbies] = useState<string[]>([]);
  const toggleHobby = (h: string) => {
    setHobbies((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]
    );
  };

  const progress = (step / TOTAL_STEPS) * 100;

  const handleStep1Next = () => {
    if (hasExperience === null) {
      toast({ title: t('common.error'), description: 'Please select an option', variant: 'destructive' });
      return;
    }
    if (hasExperience && petsCaredFor < 1) {
      toast({ title: t('common.error'), description: 'Please enter how many pets', variant: 'destructive' });
      return;
    }
    if (sitterAge < 18 || sitterAge > 90) {
      toast({ title: t('common.error'), description: 'Sitter age must be between 18 and 90', variant: 'destructive' });
      return;
    }
    if (yearsExperience < 0 || yearsExperience > 60) {
      toast({ title: t('common.error'), description: 'Years of experience must be between 0 and 60', variant: 'destructive' });
      return;
    }
    setStep(2);
  };

  const handleStep2Next = () => {
    if (preferences.length === 0) {
      toast({ title: t('common.error'), description: 'Select at least one preference', variant: 'destructive' });
      return;
    }
    setStep(3);
  };

  const handleFinish = async () => {
    if (hobbies.length === 0) {
      toast({ title: t('common.error'), description: 'Select at least one hobby', variant: 'destructive' });
      return;
    }
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const prefsPayload: Record<string, string[]> = {
        type: preferences,
        size: preferences.includes('big_dogs') ? ['large'] : preferences.includes('small_dogs') ? ['small'] : [],
      };
      if (preferences.includes('puppies')) prefsPayload.type = [...(prefsPayload.type || []), 'puppy'];

      const { error } = await supabase
        .from('users')
        .update({
          has_pet_experience: hasExperience ?? false,
          years_experience: yearsExperience,
          pets_cared_for: hasExperience ? petsCaredFor : 0,
          sitter_age: sitterAge,
          preferences: prefsPayload,
          hobbies,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id);

      if (error) throw error;
      toast({ title: t('common.success'), description: "You're all set!" });
      onComplete?.();
      navigate('/sitter-profile-setup', { replace: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: t('common.error'), description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-white to-sage-green/10 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-6">
      {/* Progress bar */}
      <div className="w-full max-w-md absolute top-6 left-1/2 -translate-x-1/2">
        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-medium-jungle dark:bg-sage-green transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
          Step {step} of {TOTAL_STEPS}
        </p>
      </div>

      <div className="w-full max-w-md mt-16">
        {/* Step 1: Experience */}
        {step === 1 && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-sage-green/20 dark:bg-sage-green/30 flex items-center justify-center">
                <PawPrint className="w-8 h-8 text-medium-jungle dark:text-sage-green" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Have you cared for pets before?
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              This helps owners find the right match.
            </p>
            <div className="flex gap-4 justify-center mb-8">
              <button
                type="button"
                onClick={() => { setHasExperience(true); setPetsCaredFor(1); }}
                className={`flex-1 py-4 px-6 rounded-2xl border-2 font-medium transition-all ${
                  hasExperience === true
                    ? 'border-medium-jungle bg-medium-jungle/10 text-medium-jungle dark:border-sage-green dark:bg-sage-green/20 dark:text-sage-green'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => { setHasExperience(false); setPetsCaredFor(0); }}
                className={`flex-1 py-4 px-6 rounded-2xl border-2 font-medium transition-all ${
                  hasExperience === false
                    ? 'border-medium-jungle bg-medium-jungle/10 text-medium-jungle dark:border-sage-green dark:bg-sage-green/20 dark:text-sage-green'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                }`}
              >
                No
              </button>
            </div>
            {hasExperience === true && (
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  How many pets have you cared for?
                </label>
                <input
                  type="number"
                  min={1}
                  value={petsCaredFor || ''}
                  onChange={(e) => setPetsCaredFor(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                  placeholder="e.g. 10"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your age
              </label>
              <input
                type="number"
                min={18}
                max={90}
                value={sitterAge || ''}
                onChange={(e) => setSitterAge(Math.max(18, Math.min(90, parseInt(e.target.value, 10) || 18)))}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                placeholder="e.g. 28"
              />
            </div>
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Years of pet care experience
              </label>
              <input
                type="number"
                min={0}
                max={60}
                value={yearsExperience || 0}
                onChange={(e) => setYearsExperience(Math.max(0, Math.min(60, parseInt(e.target.value, 10) || 0)))}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-lg"
                placeholder="e.g. 3"
              />
            </div>
            <Button size="lg" className="w-full rounded-xl" onClick={handleStep1Next}>
              Continue <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-sage-green/20 dark:bg-sage-green/30 flex items-center justify-center">
                <Heart className="w-8 h-8 text-medium-jungle dark:text-sage-green" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Which pets do you love caring for?
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              Select all that apply.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {PREFERENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => togglePreference(opt.id)}
                  className={`inline-flex items-center gap-2 py-3 px-5 rounded-2xl border-2 font-medium transition-all ${
                    preferences.includes(opt.id)
                      ? 'border-medium-jungle bg-medium-jungle/10 text-medium-jungle dark:border-sage-green dark:bg-sage-green/20 dark:text-sage-green'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span>{opt.emoji}</span>
                  {opt.label}
                  {preferences.includes(opt.id) && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
            <Button size="lg" className="w-full rounded-xl" onClick={handleStep2Next}>
              Continue <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </>
        )}

        {/* Step 3: Hobbies */}
        {step === 3 && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-sage-green/20 dark:bg-sage-green/30 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-medium-jungle dark:text-sage-green" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
              What do you enjoy?
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              Hobbies like jogging or hiking show you can keep active dogs happy.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {HOBBY_OPTIONS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => toggleHobby(h)}
                  className={`py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    hobbies.includes(h)
                      ? 'border-medium-jungle bg-medium-jungle/10 text-medium-jungle dark:border-sage-green dark:bg-sage-green/20 dark:text-sage-green'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                  }`}
                >
                  {h}
                  {hobbies.includes(h) && ' ✓'}
                </button>
              ))}
            </div>
            <Button
              size="lg"
              className="w-full rounded-xl"
              onClick={handleFinish}
              disabled={loading}
            >
              {loading ? 'Saving...' : "I'm ready!"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default SitterOnboardingWizard;
