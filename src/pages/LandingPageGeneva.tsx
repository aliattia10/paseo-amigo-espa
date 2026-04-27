import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowRight, CheckCircle, Heart, MapPin, Shield, Star, Users } from 'lucide-react';

const LandingPageGeneva: React.FC = () => {
  const navigate = useNavigate();
  const { changeLanguage, currentLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const languageCycle = ['en', 'es', 'fr'] as const;

  React.useEffect(() => {
    if (theme === 'dark') {
      toggleTheme();
    }
  }, [theme, toggleTheme]);

  const cycleLanguage = () => {
    const idx = languageCycle.indexOf((currentLanguage as 'en' | 'es' | 'fr') || 'en');
    const next = languageCycle[(idx + 1) % languageCycle.length];
    changeLanguage(next);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ash-grey/20 via-white to-muted-olive/20 text-gray-900">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="h-10 w-10 rounded-full bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm transition-colors flex items-center justify-center"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          <span className="material-symbols-outlined text-xl">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
        <button
          onClick={cycleLanguage}
          className="h-10 rounded-full px-3 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm transition-colors text-sm font-semibold"
          title="Change language"
          aria-label="Change language"
        >
          {String(currentLanguage || 'en').toUpperCase()}
        </button>
      </div>

      <section className="relative overflow-hidden pt-24 pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 left-10 w-64 h-64 bg-sage-green/25 rounded-full blur-3xl" />
          <div className="absolute top-24 right-10 w-64 h-64 bg-muted-olive/25 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-sage-green/15 border border-sage-green/30 px-4 py-1.5 mb-5">
                <MapPin className="w-4 h-4 text-medium-jungle" />
                <span className="text-xs font-semibold uppercase tracking-wide">PetFlik - Dogs & Cats</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
                Find trusted care for your
                <span className="text-medium-jungle"> dogs and cats</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl">
                Swipe, match, and book verified pet sitters in minutes. PetFlik is built for pet parents and sitters who care for both dogs and cats.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="bg-medium-jungle hover:bg-medium-jungle/90 text-white px-8 py-6 text-lg font-semibold"
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg font-semibold border-medium-jungle text-medium-jungle"
                  onClick={() => navigate('/auth')}
                >
                  Sign in
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=700"
                alt="Happy dog portrait"
                className="rounded-2xl shadow-xl h-56 md:h-72 w-full object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&q=80&w=700"
                alt="Happy cat portrait"
                className="rounded-2xl shadow-xl h-56 md:h-72 w-full object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=700"
                alt="Dog with owner"
                className="rounded-2xl shadow-xl h-56 md:h-72 w-full object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&q=80&w=700"
                alt="Cat relaxing at home"
                className="rounded-2xl shadow-xl h-56 md:h-72 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 border-y border-ash-grey/40 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['1000+', 'Happy pets'],
            ['500+', 'Verified sitters'],
            ['4.9', 'Average rating'],
            ['24/7', 'Support'],
          ].map(([value, label]) => (
            <div key={label} className="bg-white rounded-xl p-5 text-center shadow-sm border border-ash-grey/40">
              <div className="text-3xl font-bold text-medium-jungle">{value}</div>
              <div className="text-sm text-gray-600">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              ['1', 'Create your profile', 'Tell us about your dogs, cats, and care preferences.'],
              ['2', 'Swipe and match', 'Browse local sitters and connect with the best fit.'],
              ['3', 'Book with confidence', 'Chat, schedule, and pay securely in one place.'],
            ].map(([step, title, desc]) => (
              <div key={step} className="bg-white rounded-2xl p-6 shadow-sm border border-ash-grey/40">
                <div className="w-12 h-12 rounded-full bg-sage-green/20 text-medium-jungle font-bold flex items-center justify-center mb-4">
                  {step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-ash-grey/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10">Why PetFlik</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              [Heart, 'Trusted community', 'Pet owners and sitters who genuinely love dogs and cats.'],
              [Shield, 'Secure payments', 'Safe checkout and protected payouts.'],
              [Users, 'Local matching', 'Find sitters near your neighborhood.'],
              [Star, 'Verified reviews', 'Real feedback after each completed booking.'],
            ].map(([Icon, title, desc]) => (
              <div key={title as string} className="bg-white rounded-xl p-6 shadow-sm border border-ash-grey/40">
                <Icon className="w-6 h-6 text-medium-jungle mb-3" />
                <h3 className="font-semibold mb-2">{title as string}</h3>
                <p className="text-sm text-gray-600">{desc as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-2xl p-8 border border-ash-grey/40 shadow-sm">
            <div>
              <h2 className="text-3xl font-bold mb-4">Earn as a dog and cat sitter</h2>
              <p className="text-gray-600 mb-5">
                Set your own rates, choose your availability, and build a trusted profile in your city.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'Flexible schedule',
                  'Transparent earnings',
                  'Grow your repeat clients',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-medium-jungle mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                className="bg-medium-jungle hover:bg-medium-jungle/90 text-white"
                onClick={() => navigate('/auth?mode=signup')}
              >
                Become a sitter
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            <img
              src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=900"
              alt="Pet sitter with dogs and cats"
              className="rounded-xl w-full h-72 object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Do you support both dogs and cats?</AccordionTrigger>
              <AccordionContent>Yes. PetFlik supports care requests for dogs and cats across onboarding, matching, and booking.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How do I know a sitter is trustworthy?</AccordionTrigger>
              <AccordionContent>We combine profile verification, ratings, reviews, and transparent booking history.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How fast can I find a sitter?</AccordionTrigger>
              <AccordionContent>Most users can discover and message multiple local sitters in a few minutes.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="py-16 bg-medium-jungle text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to find your perfect pet match?</h2>
          <p className="text-white/90 mb-8">
            Join pet owners and sitters already using PetFlik for safe, flexible dog and cat care.
          </p>
          <Button
            size="lg"
            className="bg-white text-medium-jungle hover:bg-white/90 px-8 py-6 text-lg font-semibold"
            onClick={() => navigate('/auth?mode=signup')}
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPageGeneva;
