import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Heart, Shield, Clock, Star, Users, ArrowRight, CheckCircle, MessageCircle, DollarSign, MapPin, Calendar } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Trusted Sitters',
      description: 'Connect with verified, experienced pet sitters in your area',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Payments',
      description: 'Safe escrow system ensures your money is protected until service is complete',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Flexible Scheduling',
      description: 'Book walks and services that fit your schedule',
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Verified Reviews',
      description: 'Read real reviews from pet owners and sitters',
    },
  ];

  const platformFeatures = [
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: 'Instant Messaging',
      description: 'Chat with your matches in real-time to coordinate services',
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: 'Location-Based Matching',
      description: 'Find sitters and pet owners near you',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: 'Easy Booking',
      description: 'Schedule services with just a few taps',
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: 'Fair Pricing',
      description: 'Transparent pricing with secure payment processing',
    },
  ];

  const benefits = [
    'Verified sitter profiles with reviews and ratings',
    'Secure payment system with escrow protection',
    'Real-time chat and booking coordination',
    'Flexible scheduling to fit your needs',
    'Support for both dogs and cats',
    '24/7 customer support',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-ash-grey/20 via-white to-muted-olive/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-sage-green/30 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-muted-olive/40 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-sage-green/30 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
          <div className="text-center">
            {/* Logo */}
            <div className="flex flex-col items-center justify-center gap-4 mb-6">
              <img 
                src="/app-logo.png?v=2" 
                alt="Petflik Logo" 
                className="w-24 h-24 md:w-32 md:h-32"
              />
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Trusted Sitters for Happy Pets 🐾
            </h2>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
              Connect with experienced pet sitters and walkers in your neighborhood. 
              Book services instantly, get real-time updates, and ensure your furry friends get the best care.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              The trusted platform connecting pet owners with verified sitters across Europe. 
              Secure payments, verified reviews, and peace of mind for you and your pets.
            </p>

            {/* Hero Image - Dogs and Cats */}
            <div className="mb-12 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=400&fit=crop" 
                    alt="Happy dog with sitter"
                    className="w-full h-64 md:h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-medium-jungle/20 to-transparent"></div>
                </div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=400&fit=crop" 
                    alt="Happy cat with sitter"
                    className="w-full h-64 md:h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-medium-jungle/20 to-transparent"></div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                className="bg-medium-jungle hover:bg-medium-jungle/90 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate('/select-role')}
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg font-semibold border-medium-jungle text-medium-jungle hover:bg-sage-green/10 dark:hover:bg-sage-green/20"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-16">
              <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="text-3xl font-bold text-medium-jungle mb-1">1000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Happy Pets</div>
              </div>
              <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="text-3xl font-bold text-medium-jungle mb-1">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Trusted Sitters</div>
              </div>
              <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="text-3xl font-bold text-medium-jungle mb-1">4.9★</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Average Rating</div>
              </div>
              <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="text-3xl font-bold text-medium-jungle mb-1">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
          Why Choose Petflik?
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-ash-grey dark:border-gray-700"
            >
              <div className="text-medium-jungle mb-4">{feature.icon}</div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {feature.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-ash-grey/30 dark:bg-gray-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
            How It Works
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop" 
                  alt="Create profile with dog and cat"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              </div>
              <div className="w-16 h-16 bg-sage-green/20 dark:bg-sage-green/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-medium-jungle dark:text-sage-green">1</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Create Your Profile
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Sign up as a pet owner or sitter. Add your pet's details (dogs or cats) or your service information.
              </p>
            </div>
            
            <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1548199973-03cce0b5a855?w=400&h=300&fit=crop" 
                  alt="Browse and match cats and dogs"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              </div>
              <div className="w-16 h-16 bg-sage-green/20 dark:bg-sage-green/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-medium-jungle dark:text-sage-green">2</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Browse & Match
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Discover sitters in your area or find pet owners looking for services. Swipe and match!
              </p>
            </div>
            
            <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1544568100-847a948585b9?w=400&h=300&fit=crop" 
                  alt="Book and enjoy with pets"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              </div>
              <div className="w-16 h-16 bg-sage-green/20 dark:bg-sage-green/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-medium-jungle dark:text-sage-green">3</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Book & Enjoy
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Book a service, chat with your match, and enjoy peace of mind knowing your pet is in good hands.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
          Platform Features
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {platformFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-all border border-ash-grey dark:border-gray-700"
            >
              <div className="text-medium-jungle mb-3 flex items-center gap-2">
                {feature.icon}
                <h4 className="text-base font-semibold text-gray-800 dark:text-white">
                  {feature.title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Feature Images Grid - Dogs and Cats */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="relative rounded-xl overflow-hidden shadow-lg group">
            <img 
              src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&h=400&fit=crop" 
              alt="Pet owner with dog"
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-medium-jungle/60 to-transparent flex items-end p-6">
              <p className="text-white font-semibold text-lg">Find Your Perfect Match</p>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden shadow-lg group">
            <img 
              src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=400&fit=crop" 
              alt="Cat care"
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-medium-jungle/60 to-transparent flex items-end p-6">
              <p className="text-white font-semibold text-lg">Trusted Care</p>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden shadow-lg group">
            <img 
              src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&h=400&fit=crop" 
              alt="Happy dogs and cats"
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-medium-jungle/60 to-transparent flex items-end p-6">
              <p className="text-white font-semibold text-lg">Happy Pets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-ash-grey/20 to-white dark:from-gray-800 dark:to-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">
                Why Pet Owners & Sitters Love Petflik
              </h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
                  >
                    <CheckCircle className="w-5 h-5 text-medium-jungle flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:block">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop" 
                    alt="Happy dog owner"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-medium-jungle/30 to-transparent"></div>
                </div>
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=400&h=300&fit=crop" 
                    alt="Happy cat owner"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-medium-jungle/30 to-transparent"></div>
                </div>
                <div className="relative rounded-xl overflow-hidden shadow-lg col-span-2">
                  <img 
                    src="https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?w=800&h=300&fit=crop" 
                    alt="Dogs and cats together"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-medium-jungle/30 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* For Sitters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-sage-green/20 to-muted-olive/20 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 md:p-12 border border-ash-grey dark:border-gray-600">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Earn Money as a Pet Sitter
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Join our community of trusted pet sitters and start earning. Set your own rates, 
                choose your availability, and get paid securely through our platform.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-medium-jungle flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Set your own hourly rates
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-medium-jungle flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Flexible payout options (PayPal or Bank Transfer)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-medium-jungle flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Build your reputation with reviews
                  </span>
                </li>
              </ul>
              <Button
                size="lg"
                className="bg-medium-jungle hover:bg-medium-jungle/90 text-white"
                onClick={() => navigate('/select-role')}
              >
                Become a Sitter
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <img 
                    src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=300" 
                    alt="Dog sitter"
                    className="rounded-lg shadow-lg w-full h-32 object-cover"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400" 
                    alt="Cat sitter"
                    className="rounded-lg shadow-lg w-full h-32 object-cover"
                  />
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600" 
                  alt="Pet sitter with dogs and cats"
                  className="rounded-xl shadow-2xl w-full h-40 object-cover"
                />
                <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border border-ash-grey dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-medium-jungle dark:text-sage-green mb-2">€15-30</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Average hourly rate
                    </div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                      80% Commission
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      You keep 80% of every booking
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
          {t('faq.title')}
        </h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left font-semibold">{t('faq.q1')}</AccordionTrigger>
            <AccordionContent>{t('faq.a1')}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left font-semibold">{t('faq.q2')}</AccordionTrigger>
            <AccordionContent>{t('faq.a2')}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left font-semibold">{t('faq.q3')}</AccordionTrigger>
            <AccordionContent>{t('faq.a3')}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left font-semibold">{t('faq.q4')}</AccordionTrigger>
            <AccordionContent>{t('faq.a4')}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger className="text-left font-semibold">{t('faq.q5')}</AccordionTrigger>
            <AccordionContent>{t('faq.a5')}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <Footer />
    </div>
  );
};

const Footer: React.FC = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <img src="/app-logo.png?v=2" alt="Petflik" className="h-12 w-auto" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
              Trusted Sitters for Happy Pets. The leading platform for pet care services in Europe.
            </p>
          </div>
          
          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-6">Our apps</h4>
            <ul className="space-y-4">
              <li><button onClick={() => navigate('/select-role')} className="text-gray-500 dark:text-gray-400 hover:text-medium-jungle transition-colors">Petflik for Owners</button></li>
              <li><button onClick={() => navigate('/select-role')} className="text-gray-500 dark:text-gray-400 hover:text-medium-jungle transition-colors">Petflik for Sitters</button></li>
            </ul>
          </div>

                   <div>
                     <h4 className="text-gray-900 dark:text-white font-bold mb-6">Company</h4>
                     <ul className="space-y-4">
                       <li><button onClick={() => navigate('/about')} className="text-gray-500 dark:text-gray-400 hover:text-medium-jungle transition-colors">About</button></li>
                       <li><button onClick={() => navigate('/blog')} className="text-gray-500 dark:text-gray-400 hover:text-medium-jungle transition-colors">Blog</button></li>
                       <li><button onClick={() => navigate('/contact')} className="text-gray-500 dark:text-gray-400 hover:text-medium-jungle transition-colors">Contact us</button></li>
                       <li><button onClick={() => navigate('/select-role')} className="text-gray-500 dark:text-gray-400 hover:text-medium-jungle transition-colors">Careers</button></li>
                     </ul>
                   </div>

          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><button onClick={() => navigate('/terms')} className="text-gray-500 dark:text-gray-400 hover:text-medium-jungle transition-colors">Terms and conditions</button></li>
              <li><button onClick={() => navigate('/privacy')} className="text-gray-500 dark:text-gray-400 hover:text-medium-jungle transition-colors">Privacy policy</button></li>
              <li><button onClick={() => navigate('/refund-policy')} className="text-gray-500 dark:text-gray-400 hover:text-medium-jungle transition-colors">Refund policy</button></li>
              <li><button onClick={() => navigate('/code-of-conduct')} className="text-gray-500 dark:text-gray-400 hover:text-medium-jungle transition-colors">Code of Conduct</button></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-100 dark:border-gray-800">
          <div className="flex gap-6 mb-4 md:mb-0">
            <span className="text-gray-400 hover:text-medium-jungle cursor-pointer transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.355 2.618 6.778 6.98 6.977 1.28.058 1.688.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.058-1.28.072-1.688.072-4.947 0-3.259-.014-3.668-.072-4.949-.2-4.354-2.62-6.78-6.98-6.981-1.28-.058-1.687-.072-4.947-.072zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4.162 4.162 0 110-8.324 4.162 4.162 0 010 8.324zM18.406 4.137a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/></svg>
            </span>
            <span className="text-gray-400 hover:text-medium-jungle cursor-pointer transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </span>
            <span className="text-gray-400 hover:text-medium-jungle cursor-pointer transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.904 0 01-2.212.085 4.936 4.923 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400">
              <span className="material-symbols-outlined text-base">language</span>
              <span>English (International)</span>
              <span className="material-symbols-outlined text-base">expand_more</span>
            </div>
            <div className="text-gray-400 text-xs">
              © {new Date().getFullYear()} Petflik. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingPage;

