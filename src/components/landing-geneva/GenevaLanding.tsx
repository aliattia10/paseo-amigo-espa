import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CalendarCheck,
  Cat,
  ChevronDown,
  CreditCard,
  Dog,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  Menu,
  Rabbit,
  ShieldCheck,
  Smartphone,
  Star,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const dogHero =
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=85&w=1800';
const sitterPhone =
  'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=85&w=600';
const verifiedImage =
  'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=85&w=900';
const communityImage =
  'https://images.unsplash.com/photo-1558944351-c20d374d432d?auto=format&fit=crop&q=85&w=1200';

type LandingHandlers = {
  goSignup: () => void;
  goSignin: () => void;
  goRoute: (path: string) => void;
};

function PhoneMockup() {
  return (
    <div className="relative w-72 xl:w-80 rounded-[2rem] bg-[#e8f4e9] p-6 shadow-2xl shadow-sage-900/15">
      <div className="mx-auto w-44 rounded-[2rem] border-[9px] border-slate-950 bg-white p-2 shadow-xl">
        <div className="mx-auto mb-2 h-4 w-16 rounded-full bg-slate-950" />
        <div className="relative overflow-hidden rounded-2xl">
          <img src={sitterPhone} alt="PetFlik app swipe interface" className="h-56 w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
            <p className="text-sm font-semibold">Sophie, 22</p>
            <p className="text-xs">★ 4.9</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-8">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-red-400">×</div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-sage-50 text-sage-600">♥</div>
        </div>
      </div>
    </div>
  );
}

function Navbar({ goSignup, goSignin }: LandingHandlers) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Why PetFlik', href: '#why-petflik' },
    { label: 'Community', href: '#community' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-sage-100/60 bg-ivory/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <a href="#top" className="group flex items-center gap-2.5">
          <img src="/app-logo.png?v=2" alt="PetFlik" className="h-9 w-9 rounded-full transition-transform group-hover:scale-105" />
          <span className="font-serif text-xl font-semibold tracking-tight text-sage-800">PetFlik</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-foreground/70 transition-colors hover:text-sage-600">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" className="text-sm font-medium text-sage-700 hover:bg-sage-50 hover:text-sage-800" onClick={goSignin}>
            Sign In
          </Button>
          <Button className="rounded-xl bg-sage-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-sage-700" onClick={goSignup}>
            Get Started
          </Button>
        </div>

        <button className="p-2 text-foreground/70 hover:text-foreground md:hidden" onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="overflow-hidden border-b border-sage-100 bg-ivory/95 backdrop-blur-xl md:hidden">
          <div className="container flex flex-col gap-3 py-4">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="py-2 text-base font-medium text-foreground/70 hover:text-sage-600" onClick={() => setMobileOpen(false)}>
                {link.label}
              </a>
            ))}
            <div className="flex gap-3 border-t border-sage-100 pt-3">
              <Button variant="ghost" className="flex-1 text-sage-700" onClick={goSignin}>Sign In</Button>
              <Button className="flex-1 rounded-xl bg-sage-600 text-white hover:bg-sage-700" onClick={goSignup}>Get Started</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function HeroSection({ goSignup }: LandingHandlers) {
  return (
    <section id="top" className="relative flex min-h-screen items-center overflow-hidden pt-16">
      <div className="absolute inset-0">
        <img src={dogHero} alt="Dog walking along Lake Geneva" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ivory/95 via-ivory/80 to-ivory/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ivory/60 via-transparent to-ivory/40" />
      </div>

      <div className="container relative z-10">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sage-200/60 bg-sage-50/80 px-4 py-1.5 backdrop-blur-sm">
              <MapPin size={14} className="text-sage-600" />
              <span className="text-xs font-semibold uppercase tracking-wide text-sage-700">Geneva, Switzerland</span>
            </div>
            <h1 className="mb-6 font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-sage-900 sm:text-5xl lg:text-6xl">
              Your Pet Deserves
              <br />
              <span className="text-sage-600">a Local Friend</span>
            </h1>
            <p className="mb-8 max-w-md text-lg leading-relaxed text-foreground/70">
              PetFlik connects Geneva dog and cat owners with verified local sitters - students, adults, and seniors who genuinely love pets. Swipe, match, and book in seconds.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="rounded-xl bg-sage-600 px-7 font-semibold text-white shadow-lg shadow-sage-600/20 transition-all hover:-translate-y-0.5 hover:bg-sage-700 hover:shadow-xl" onClick={goSignup}>
                Find a Sitter
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl border-sage-300 bg-white/60 px-7 font-semibold text-sage-700 backdrop-blur-sm hover:bg-sage-50" onClick={goSignup}>
                Become a Sitter
              </Button>
            </div>
            <div className="mt-10 flex gap-8 border-t border-sage-200/50 pt-8">
              {[
                { value: '1,000+', label: 'Happy Pets' },
                { value: '500+', label: 'Verified Sitters' },
                { value: '4.9★', label: 'Average Rating' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-serif text-2xl font-bold text-sage-800">{stat.value}</div>
                  <div className="mt-0.5 text-xs font-medium text-foreground/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden justify-center lg:flex">
            <div className="relative">
              <PhoneMockup />
              <div className="absolute -left-12 top-1/4 rounded-2xl border border-sage-100 bg-white p-3 shadow-lg shadow-sage-900/10">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-sm">🐾</div>
                  <div>
                    <div className="text-xs font-semibold text-sage-800">Swipe Right</div>
                    <div className="text-[10px] text-foreground/50">to match with sitters</div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-8 bottom-1/4 rounded-2xl border border-sage-100 bg-white p-3 shadow-lg shadow-sage-900/10">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terra-100 text-sm">✓</div>
                  <div>
                    <div className="text-xs font-semibold text-sage-800">Verified</div>
                    <div className="text-[10px] text-foreground/50">Local & trusted</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: UserPlus,
      title: 'Create Your Profile',
      description: 'Sign up as a pet owner or sitter. Add your dog or cat details, your location in Geneva, and your availability. It takes less than 2 minutes.',
    },
    {
      number: '02',
      icon: Heart,
      title: 'Swipe & Match',
      description: "Browse verified pet sitters near you. Like Tinder, swipe right on sitters you love, left to skip. When you both match - it's a connection!",
    },
    {
      number: '03',
      icon: CalendarCheck,
      title: 'Book & Enjoy',
      description: 'Chat with your match, agree on timing and rates, and book securely through the platform. Your pet is in trusted local hands.',
    },
  ];

  return (
    <section id="how-it-works" className="grain-overlay relative bg-warm-gray py-24 lg:py-32">
      <div className="container relative z-10">
        <div className="mb-16 text-center">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-terra-500">Simple as 1-2-3</span>
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-sage-900 sm:text-4xl lg:text-5xl">How PetFlik Works</h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-foreground/60">Finding the right sitter for your dog or cat in Geneva has never been easier.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
          {steps.map((step, i) => (
            <div key={step.number} className="group relative">
              <div className="h-full rounded-2xl border border-sage-100/60 bg-white p-8 shadow-sm transition-all hover:border-sage-200/80 hover:shadow-md">
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-serif text-5xl font-bold text-sage-100 transition-colors group-hover:text-sage-200">{step.number}</span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-50 transition-colors group-hover:bg-sage-100">
                    <step.icon size={22} className="text-sage-600" />
                  </div>
                </div>
                <h3 className="mb-3 font-serif text-xl font-semibold text-sage-800">{step.title}</h3>
                <p className="text-sm leading-relaxed text-foreground/60">{step.description}</p>
              </div>
              {i < steps.length - 1 && <div className="absolute top-1/2 hidden w-8 border-t-2 border-dashed border-sage-200 md:-right-6 md:block lg:-right-8 lg:w-12" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyPetFlik() {
  const features = [
    ['Verified & Trusted Sitters', 'Every sitter is identity-verified. Real reviews from real dog and cat owners in Geneva.', ShieldCheck],
    ['Locally Grown Community', "Not a faceless global platform. PetFlik is built by and for Geneva's pet-loving community.", MapPin],
    ['All Ages, One Passion', 'Students, adults with flexible schedules, and seniors - all united by a love of pets.', Users],
    ['Rated & Reviewed', "Transparent ratings and detailed reviews help you find the sitter that's the right fit for your pet.", Star],
    ['Flexible Scheduling', 'Book a one-time walk, regular visits, or overnight stays. Your schedule, your terms.', Calendar],
    ['Secure Payments', 'Pay securely through the platform with escrow protection until the service is complete.', CreditCard],
  ] as const;

  return (
    <section id="why-petflik" className="bg-ivory py-24 lg:py-32">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div className="mx-auto grid aspect-square w-full max-w-md place-items-center rounded-3xl bg-gradient-to-br from-sage-50 to-sage-100">
              <div className="relative">
                <div className="grid h-52 w-52 place-items-center rounded-[3rem] bg-white shadow-xl">
                  <ShieldCheck className="h-28 w-28 text-sage-500" />
                </div>
                <div className="absolute -left-12 top-6 grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-lg">
                  <Dog className="text-sage-500" />
                </div>
                <div className="absolute -right-10 top-20 grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-lg">
                  <Cat className="text-sage-500" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 right-4 rounded-2xl border border-sage-100 bg-white p-4 shadow-lg shadow-sage-900/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100">
                  <ShieldCheck size={20} className="text-sage-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-sage-800">100% Verified</div>
                  <div className="text-xs text-foreground/50">All sitters ID-checked</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-terra-500">Built for Trust</span>
            <h2 className="mb-4 font-serif text-3xl font-semibold tracking-tight text-sage-900 sm:text-4xl">
              Why Geneva Pet Owners
              <br />
              Choose PetFlik
            </h2>
            <p className="mb-10 max-w-md text-lg text-foreground/60">A platform designed with your pet's safety and happiness as the top priority.</p>
            <div className="grid gap-6 sm:grid-cols-2">
              {features.map(([title, description, Icon]) => (
                <div key={title} className="group flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-50 transition-colors group-hover:bg-sage-100">
                    <Icon size={18} className="text-sage-600" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-sage-800">{title}</h3>
                    <p className="text-xs leading-relaxed text-foreground/55">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SwipeDemo({ goSignup }: LandingHandlers) {
  return (
    <section className="relative overflow-hidden bg-sage-600 py-24 lg:py-32">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>
      <div className="container relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex justify-center">
            <PhoneMockup />
          </div>
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Smartphone size={16} className="text-sage-200" />
              <span className="text-xs font-semibold uppercase tracking-widest text-sage-200">The App Experience</span>
            </div>
            <h2 className="mb-6 font-serif text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              As Easy as
              <br />
              Swiping Left or Right
            </h2>
            <p className="mb-8 max-w-md text-lg leading-relaxed text-sage-100/80">
              Inspired by the simplicity of Tinder, PetFlik makes finding a pet sitter intuitive and fun. See a sitter you like? Swipe right. Not a match? Swipe left.
            </p>
            <div className="mb-10 space-y-4">
              {['Browse sitter profiles with photos, reviews & rates', 'Swipe right to express interest, left to pass', 'Match instantly and start chatting', 'Book securely with escrow-protected payments'].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <div className="h-2 w-2 rounded-full bg-sage-200" />
                  </div>
                  <span className="text-sm text-sage-100">{item}</span>
                </div>
              ))}
            </div>
            <Button size="lg" className="rounded-xl bg-white px-7 font-semibold text-sage-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-sage-50" onClick={goSignup}>
              Try PetFlik Now
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommunitySection() {
  const personas = [
    ['Students', 'University students earning extra income while doing what they love - spending time with pets between classes.', GraduationCap, 'bg-sage-50 text-sage-600'],
    ['Young Professionals', 'Flexible adults with a passion for animals, offering reliable care during your work hours or weekends away.', Briefcase, 'bg-terra-50 text-terra-500'],
    ['Senior Pet Lovers', 'Experienced, patient, and devoted. Seniors who bring a lifetime of love and care to every pet they meet.', Heart, 'bg-sage-50 text-sage-600'],
  ] as const;

  return (
    <section id="community" className="grain-overlay relative overflow-hidden bg-warm-gray py-24 lg:py-32">
      <div className="container relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-terra-500">Our Community</span>
            <h2 className="mb-4 font-serif text-3xl font-semibold tracking-tight text-sage-900 sm:text-4xl">
              Locally Grown,
              <br />
              <span className="text-sage-600">Genuinely Passionate</span>
            </h2>
            <p className="mb-10 max-w-md text-lg text-foreground/60">
              PetFlik is powered by Geneva's own pet lovers. From university campuses to retirement communities - united by one thing: a love for dogs and cats.
            </p>
            <div className="space-y-5">
              {personas.map(([title, description, Icon, color]) => (
                <div key={title} className="rounded-2xl border border-sage-100/60 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-sage-800">{title}</h3>
                      <p className="text-sm leading-relaxed text-foreground/55">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-3xl shadow-xl shadow-sage-900/10">
              <img src={communityImage} alt="Diverse community of pet lovers in Geneva" className="aspect-[4/3] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-sage-900/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="rounded-xl border border-white/50 bg-white/90 p-4 backdrop-blur-sm">
                  <p className="text-sm font-medium text-sage-800">"PetFlik brought our neighbourhood together through our shared love of pets."</p>
                  <p className="mt-1 text-xs text-foreground/50">- Marie, Pet Owner, Eaux-Vives</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PetsSection() {
  const pets = [
    ['Golden Retriever', 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&q=85&w=800'],
    ['French Bulldog', 'https://images.unsplash.com/photo-1583512603784-a8e3ea83534c?auto=format&fit=crop&q=85&w=800'],
    ['Border Collie', 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&q=85&w=800'],
    ['Labrador', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=85&w=800'],
    ['Cat Care', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=85&w=800'],
    ['Home Visits', 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&q=85&w=800'],
  ];

  return (
    <section className="bg-ivory py-24 lg:py-32">
      <div className="container">
        <div className="mb-14 text-center">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-terra-500">Dogs & Cats First</span>
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-sage-900 sm:text-4xl lg:text-5xl">
            Every Breed, Every Size,
            <br />
            <span className="text-sage-600">Every Personality</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-foreground/60">From playful dogs to independent cats - our sitters love them all.</p>
        </div>

        <div className="mb-16 grid overflow-hidden rounded-3xl shadow-lg shadow-sage-900/10 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map(([label, src]) => (
            <img key={label} src={src} alt={label} className="h-64 w-full object-cover" />
          ))}
        </div>

        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-terra-200/60 bg-terra-50 px-5 py-2">
            <span className="text-xs font-semibold tracking-wide text-terra-600">Dogs & Cats Supported</span>
          </div>
          <div className="mt-4 flex justify-center gap-6">
            {[
              { icon: Dog, label: 'Dogs', active: true },
              { icon: Cat, label: 'Cats', active: true },
              { icon: Rabbit, label: 'Rabbits', active: false },
            ].map((pet) => (
              <div key={pet.label} className={`flex flex-col items-center gap-2 ${pet.active ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${pet.active ? 'bg-sage-100 text-sage-600' : 'bg-gray-100 text-gray-400'}`}>
                  <pet.icon size={24} />
                </div>
                <span className={`text-xs font-medium ${pet.active ? 'text-sage-700' : 'text-gray-400'}`}>
                  {pet.label}
                  {!pet.active && <span className="block text-[10px] text-foreground/40">Soon</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EarnSection({ goSignup }: LandingHandlers) {
  return (
    <section className="bg-ivory py-24 lg:py-32">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-terra-50 via-terra-50/50 to-sage-50 p-8 sm:p-12 lg:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-terra-100/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-sage-100/40 blur-3xl" />
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-terra-500">For Sitters</span>
              <h2 className="mb-4 font-serif text-3xl font-semibold tracking-tight text-sage-900 sm:text-4xl">
                Love Pets?
                <br />
                <span className="text-terra-500">Earn While You Care</span>
              </h2>
              <p className="mb-8 max-w-md text-lg leading-relaxed text-foreground/60">
                Whether you're a student, a retiree, or anyone in between - PetFlik lets you earn money doing what you love.
              </p>
              <div className="mb-8 space-y-3">
                {['Set your own hourly rates', 'Choose your own schedule and availability', 'Get paid securely with Stripe Connect', 'Build your reputation with verified reviews'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-600 text-white">✓</div>
                    <span className="text-sm text-foreground/70">{item}</span>
                  </div>
                ))}
              </div>
              <Button size="lg" className="rounded-xl bg-terra-500 px-7 font-semibold text-white shadow-lg shadow-terra-500/20 transition-all hover:-translate-y-0.5 hover:bg-terra-600" onClick={goSignup}>
                Become a Sitter
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
            <div className="space-y-4">
              {[
                [Wallet, 'CHF 15-30/hr', 'Average hourly rate in Geneva', 'bg-sage-50', 'text-sage-600'],
                [Calendar, 'Flexible Hours', 'Work when it suits you - mornings, evenings, weekends', 'bg-terra-50', 'text-terra-500'],
                [TrendingUp, '80% Commission', 'You keep 80% of every booking', 'bg-sage-50', 'text-sage-600'],
              ].map(([Icon, title, subtitle, color, iconColor]) => (
                <div key={title as string} className="rounded-2xl border border-sage-100/60 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color as string}`}>
                      <Icon size={22} className={iconColor as string} />
                    </div>
                    <div>
                      <div className="font-serif text-lg font-bold text-sage-800">{title as string}</div>
                      <div className="text-xs text-foreground/50">{subtitle as string}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    ['What is PetFlik?', 'PetFlik is a platform that connects dog and cat owners in Geneva with verified, local pet sitters and walkers. Think of it as Tinder for pet sitting - swipe to find your perfect match, chat, and book securely.'],
    ['Is PetFlik free to use?', 'Creating an account and browsing sitters is completely free. You only pay when you book a service.'],
    ['How are sitters verified?', 'Every sitter on PetFlik goes through an identity verification process and builds reputation through verified reviews.'],
    ['How does the matching work?', "Browse sitter profiles with photos, reviews, and rates. Swipe right if you're interested, left to pass. When a sitter also likes your pet profile, it's a match."],
    ['What areas in Geneva do you cover?', 'PetFlik covers Geneva and surrounding areas, including Eaux-Vives, Carouge, Plainpalais, Champel, Paquis, and more.'],
    ['Can I become a sitter?', 'Absolutely. Whether you are a student, working professional, or retiree - if you love pets, you can sign up as a sitter.'],
    ['What about other pets?', 'PetFlik supports dogs and cats. Rabbits and other pets are planned for later.'],
  ];

  return (
    <section id="faq" className="grain-overlay relative bg-warm-gray py-24 lg:py-32">
      <div className="container relative z-10">
        <div className="mb-14 text-center">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-terra-500">Questions & Answers</span>
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-sage-900 sm:text-4xl lg:text-5xl">Frequently Asked Questions</h2>
        </div>
        <div className="mx-auto max-w-2xl">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map(([question, answer], i) => (
              <AccordionItem key={question} value={`item-${i}`} className="rounded-2xl border border-sage-100/60 bg-white px-6 shadow-sm transition-shadow data-[state=open]:shadow-md">
                <AccordionTrigger className="py-5 text-left text-sm font-semibold text-sage-800 hover:text-sage-600 hover:no-underline sm:text-base">
                  {question}
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-foreground/60">{answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ goSignup, goSignin }: LandingHandlers) {
  return (
    <section className="bg-ivory py-24 lg:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-6 font-serif text-3xl font-semibold tracking-tight text-sage-900 sm:text-4xl lg:text-5xl">
            Ready to Find Your Pet's
            <br />
            <span className="text-sage-600">Perfect Match?</span>
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-foreground/60">
            Join hundreds of Geneva pet owners who trust PetFlik to connect them with verified, local sitters.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="rounded-xl bg-sage-600 px-8 text-base font-semibold text-white shadow-lg shadow-sage-600/20 transition-all hover:-translate-y-0.5 hover:bg-sage-700 hover:shadow-xl" onClick={goSignup}>
              Get Started Free
              <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-xl border-sage-300 px-8 text-base font-semibold text-sage-700 hover:bg-sage-50" onClick={goSignin}>
              Learn More
            </Button>
          </div>
          <p className="mt-6 text-xs text-foreground/40">Free to sign up. No credit card required.</p>
        </div>
      </div>
    </section>
  );
}

function Footer({ goSignup, goRoute }: LandingHandlers) {
  const columns = [
    { title: 'Platform', links: [['For Owners', goSignup], ['For Sitters', goSignup], ['How It Works', () => { window.location.hash = 'how-it-works'; }], ['Pricing', goSignup]] },
    { title: 'Company', links: [['About', () => goRoute('/about')], ['Blog', () => goRoute('/blog')], ['Careers', goSignup], ['Contact', () => goRoute('/contact')]] },
    { title: 'Legal', links: [['Terms & Conditions', () => goRoute('/terms')], ['Privacy Policy', () => goRoute('/privacy')], ['Refund Policy', () => goRoute('/refund-policy')], ['Code of Conduct', () => goRoute('/code-of-conduct')]] },
  ] as const;

  return (
    <footer className="bg-sage-800 text-sage-100">
      <div className="container py-16 lg:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2.5">
              <img src="/app-logo.png?v=2" alt="PetFlik" className="h-9 w-9 rounded-full" />
              <span className="font-serif text-xl font-semibold tracking-tight text-white">PetFlik</span>
            </div>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-sage-300">
              The trusted platform connecting Geneva's dog and cat owners with verified local sitters. Built by pet lovers, for pet lovers.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-sage-300">
                <MapPin size={14} />
                <span>Geneva, Switzerland</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-sage-300">
                <Mail size={14} />
                <a href="mailto:hello@petflik.com" className="transition-colors hover:text-white">hello@petflik.com</a>
              </div>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-4 text-sm font-semibold text-white">{column.title}</h4>
              <ul className="space-y-2.5">
                {column.links.map(([label, onClick]) => (
                  <li key={label}>
                    <button onClick={onClick} className="text-sm text-sage-300 transition-colors hover:text-white">{label}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-sage-700/50 pt-8 sm:flex-row">
          <p className="text-xs text-sage-400">&copy; {new Date().getFullYear()} PetFlik. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function GenevaLanding() {
  const navigate = useNavigate();
  const goSignup = () => navigate('/auth?mode=signup');
  const goSignin = () => navigate('/auth');
  const goRoute = (path: string) => navigate(path);
  const handlers = { goSignup, goSignin, goRoute };

  return (
    <div className="flex min-h-screen flex-col bg-ivory font-display text-foreground">
      <Navbar {...handlers} />
      <main>
        <HeroSection {...handlers} />
        <HowItWorks />
        <WhyPetFlik />
        <SwipeDemo {...handlers} />
        <CommunitySection />
        <PetsSection />
        <EarnSection {...handlers} />
        <FAQSection />
        <FinalCTA {...handlers} />
      </main>
      <Footer {...handlers} />
    </div>
  );
}
