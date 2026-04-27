import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  ArrowRight,
  CalendarCheck,
  CreditCard,
  Heart,
  Mail,
  MapPin,
  ShieldCheck,
  Star,
  UserPlus,
  Users,
} from 'lucide-react';

const LandingPageGeneva: React.FC = () => {
  const navigate = useNavigate();
  const { changeLanguage, currentLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const languageCycle = ['en', 'es', 'fr'] as const;

  React.useEffect(() => {
    if (theme === 'dark') toggleTheme();
  }, [theme, toggleTheme]);

  const cycleLanguage = () => {
    const idx = languageCycle.indexOf((currentLanguage as 'en' | 'es' | 'fr') || 'en');
    changeLanguage(languageCycle[(idx + 1) % languageCycle.length]);
  };

  const goSignup = () => navigate('/auth?mode=signup');
  const goSignin = () => navigate('/auth');

  return (
    <div className="min-h-screen bg-ivory text-foreground">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="h-10 w-10 rounded-full bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-xl">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
        <button
          onClick={cycleLanguage}
          className="h-10 rounded-full px-3 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm transition-colors text-sm font-semibold"
        >
          {String(currentLanguage || 'en').toUpperCase()}
        </button>
      </div>

      <nav className="fixed top-0 left-0 right-0 z-40 bg-ivory/80 backdrop-blur-xl border-b border-sage-100/60">
        <div className="container flex items-center justify-between h-16">
          <a href="#top" className="flex items-center gap-2.5">
            <img src="/app-logo.png?v=2" alt="PetFlik" className="h-9 w-9 rounded-full" />
            <span className="font-serif font-semibold text-xl text-sage-800 tracking-tight">PetFlik</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-foreground/70 hover:text-sage-600">How It Works</a>
            <a href="#why-petflik" className="text-sm font-medium text-foreground/70 hover:text-sage-600">Why PetFlik</a>
            <a href="#community" className="text-sm font-medium text-foreground/70 hover:text-sage-600">Community</a>
            <a href="#faq" className="text-sm font-medium text-foreground/70 hover:text-sage-600">FAQ</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="text-sm font-medium text-sage-700 hover:bg-sage-50" onClick={goSignin}>
              Sign In
            </Button>
            <Button className="bg-sage-600 hover:bg-sage-700 text-white font-medium text-sm px-5 rounded-xl" onClick={goSignup}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <section id="top" className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1800"
            alt="Dog walking along Lake Geneva"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ivory/95 via-ivory/80 to-ivory/30" />
        </div>
        <div className="container relative z-10 grid lg:grid-cols-2 gap-8 items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-sage-50/80 border border-sage-200/60 rounded-full px-4 py-1.5 mb-6">
              <MapPin size={14} className="text-sage-600" />
              <span className="text-xs font-semibold text-sage-700 tracking-wide uppercase">Geneva, Switzerland</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-sage-900 leading-[1.1] mb-6">
              Your Dog Deserves
              <br />
              <span className="text-sage-600">a Local Friend</span>
            </h1>
            <p className="text-lg text-foreground/70 leading-relaxed mb-8 max-w-md">
              PetFlik connects Geneva dog owners with verified local sitters - students, adults, and seniors who genuinely love dogs. Swipe, match, and book in seconds.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="bg-sage-600 hover:bg-sage-700 text-white font-semibold px-7 rounded-xl" onClick={goSignup}>
                Find a Sitter
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-sage-300 text-sage-700 hover:bg-sage-50 font-semibold px-7 rounded-xl bg-white/60" onClick={goSignup}>
                Become a Sitter
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-warm-gray">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-terra-500 tracking-widest uppercase mb-3 block">Simple as 1-2-3</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-sage-900">How PetFlik Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              ['01', UserPlus, 'Create Your Profile', "Sign up as a dog owner or sitter. Add your dog's details, your location in Geneva, and your availability."],
              ['02', Heart, 'Swipe & Match', 'Browse verified sitters near you. Swipe right on sitters you love, left to skip.'],
              ['03', CalendarCheck, 'Book & Enjoy', "Chat with your match, agree on timing and rates, and book securely through the platform."],
            ].map(([number, Icon, title, description]) => (
              <div key={String(number)} className="bg-white rounded-2xl p-8 shadow-sm border border-sage-100/60">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-serif text-5xl font-bold text-sage-100">{number as string}</span>
                  <div className="w-12 h-12 rounded-xl bg-sage-50 flex items-center justify-center">
                    <Icon size={22} className="text-sage-600" />
                  </div>
                </div>
                <h3 className="font-serif text-xl font-semibold text-sage-800 mb-3">{title as string}</h3>
                <p className="text-foreground/60 leading-relaxed text-sm">{description as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="why-petflik" className="py-24 bg-ivory">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <img
              src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=1200"
              alt="Verified and trusted platform"
              className="w-full max-w-md mx-auto rounded-3xl"
            />
            <div>
              <span className="text-xs font-semibold text-terra-500 tracking-widest uppercase mb-3 block">Built for Trust</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-sage-900 tracking-tight mb-4">
                Why Geneva Dog Owners
                <br />
                Choose PetFlik
              </h2>
              <p className="text-foreground/60 mb-10 text-lg max-w-md">
                A platform designed with your dog's safety and happiness as the top priority.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  [ShieldCheck, 'Verified & Trusted Sitters'],
                  [MapPin, 'Locally Grown Community'],
                  [Users, 'All Ages, One Passion'],
                  [Star, 'Rated & Reviewed'],
                  [CalendarCheck, 'Flexible Scheduling'],
                  [CreditCard, 'Secure Payments'],
                ].map(([Icon, label]) => (
                  <div key={label as string} className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sage-50 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-sage-600" />
                    </div>
                    <h3 className="font-semibold text-sage-800 text-sm">{label as string}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="community" className="py-24 bg-sage-600 text-white">
        <div className="container text-center max-w-3xl">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold mb-6">Join the PetFlik Community</h2>
          <p className="text-sage-100/85 text-lg mb-8">
            Trusted by pet owners and sitters across Geneva. Find the right match and book with confidence.
          </p>
          <Button size="lg" className="bg-white text-sage-700 hover:bg-sage-50 font-semibold px-7 rounded-xl" onClick={goSignup}>
            Get Started
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </section>

      <section id="faq" className="py-24 bg-ivory">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-sage-900">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I know a sitter is trustworthy?</AccordionTrigger>
              <AccordionContent>Every sitter is verified and reviewed by real pet owners before you book.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How does payment work?</AccordionTrigger>
              <AccordionContent>Payments are processed securely through the platform and protected until service completion.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Can I book recurring walks?</AccordionTrigger>
              <AccordionContent>Yes, you can coordinate one-time or recurring services directly with your sitter.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-ivory border-t border-sage-100/60">
        <div className="container text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-sage-900 tracking-tight mb-6">
            Ready to Find Your Dog's
            <br />
            <span className="text-sage-600">Perfect Match?</span>
          </h2>
          <p className="text-foreground/60 text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Join hundreds of Geneva dog owners who trust PetFlik to connect them with verified, local sitters.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-sage-600 hover:bg-sage-700 text-white font-semibold px-8 rounded-xl text-base" onClick={goSignup}>
              Get Started Free
              <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-sage-300 text-sage-700 hover:bg-sage-50 font-semibold px-8 rounded-xl text-base" onClick={goSignin}>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-sage-800 text-sage-100">
        <div className="container py-16 lg:py-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/app-logo.png?v=2" alt="PetFlik" className="h-9 w-9 rounded-full" />
                <span className="font-serif font-semibold text-xl text-white tracking-tight">PetFlik</span>
              </div>
              <p className="text-sage-300 text-sm leading-relaxed max-w-xs mb-6">
                The trusted platform connecting Geneva's dog owners with verified local sitters.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sage-300 text-sm">
                  <MapPin size={14} />
                  <span>Geneva, Switzerland</span>
                </div>
                <div className="flex items-center gap-2 text-sage-300 text-sm">
                  <Mail size={14} />
                  <span>hello@petflik.com</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Platform</h4>
              <ul className="space-y-2.5">
                <li><button onClick={goSignup} className="text-sage-300 text-sm hover:text-white">For Owners</button></li>
                <li><button onClick={goSignup} className="text-sage-300 text-sm hover:text-white">For Sitters</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Company</h4>
              <ul className="space-y-2.5">
                <li><button onClick={() => navigate('/about')} className="text-sage-300 text-sm hover:text-white">About</button></li>
                <li><button onClick={() => navigate('/blog')} className="text-sage-300 text-sm hover:text-white">Blog</button></li>
                <li><button onClick={() => navigate('/contact')} className="text-sage-300 text-sm hover:text-white">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li><button onClick={() => navigate('/terms')} className="text-sage-300 text-sm hover:text-white">Terms & Conditions</button></li>
                <li><button onClick={() => navigate('/privacy')} className="text-sage-300 text-sm hover:text-white">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/refund-policy')} className="text-sage-300 text-sm hover:text-white">Refund Policy</button></li>
              </ul>
            </div>
          </div>
          <div className="mt-14 pt-8 border-t border-sage-700/50">
            <p className="text-sage-400 text-xs">&copy; {new Date().getFullYear()} PetFlik. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageGeneva;
