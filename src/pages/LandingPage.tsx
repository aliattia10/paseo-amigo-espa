import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <span 
                className="material-symbols-outlined text-6xl text-primary" 
                style={{ fontVariationSettings: '"FILL" 1, "wght" 600, "GRAD" 0, "opsz" 48' }}
              >
                pets
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold text-text-primary-light dark:text-text-primary-dark">
                Petflik
              </h1>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
              Trusted Sitters for Happy Pets 🐾
            </h2>
            
            <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark mb-4 max-w-2xl mx-auto">
              Connect with experienced pet sitters and walkers in your neighborhood. 
              Book services instantly, get real-time updates, and ensure your furry friends get the best care.
            </p>
            <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark mb-8 max-w-2xl mx-auto">
              The trusted platform connecting pet owners with verified sitters across Spain. 
              Secure payments, verified reviews, and peace of mind for you and your pets.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate('/select-role')}
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg font-semibold"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">1000+</div>
                <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Happy Pets</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Trusted Sitters</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">4.9★</div>
                <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-2xl md:text-3xl font-bold text-center text-text-primary-light dark:text-text-primary-dark mb-12">
          Why Choose Petflik?
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card-light dark:bg-card-dark p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-primary mb-4">{feature.icon}</div>
              <h4 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                {feature.title}
              </h4>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-card-light dark:bg-card-dark py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-text-primary-light dark:text-text-primary-dark mb-12">
            How It Works
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h4 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                Create Your Profile
              </h4>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Sign up as a pet owner or sitter. Add your pet's details or your service information.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h4 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                Browse & Match
              </h4>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Discover sitters in your area or find pet owners looking for services. Swipe and match!
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h4 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                Book & Enjoy
              </h4>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Book a service, chat with your match, and enjoy peace of mind knowing your pet is in good hands.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-2xl md:text-3xl font-bold text-center text-text-primary-light dark:text-text-primary-dark mb-12">
          Platform Features
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {platformFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-card-light dark:bg-card-dark p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-border-light dark:border-border-dark"
            >
              <div className="text-primary mb-3 flex items-center gap-2">
                {feature.icon}
                <h4 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
                  {feature.title}
                </h4>
              </div>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-text-primary-light dark:text-text-primary-dark mb-12">
            Why Pet Owners & Sitters Love Petflik
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-3 bg-card-light dark:bg-card-dark p-4 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* For Sitters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
                Earn Money as a Pet Sitter
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                Join our community of trusted pet sitters and start earning. Set your own rates, 
                choose your availability, and get paid securely through our platform.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
                    Set your own hourly rates
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
                    Flexible payout options (PayPal or Bank Transfer)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
                    Build your reputation with reviews
                  </span>
                </li>
              </ul>
              <Button
                size="lg"
                variant="outline"
                className="bg-white dark:bg-gray-800"
                onClick={() => navigate('/select-role')}
              >
                Become a Sitter
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            <div className="hidden md:block">
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">€15-30</div>
                  <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
                    Average hourly rate
                  </div>
                  <div className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                    80% Commission
                  </div>
                  <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    You keep 80% of every booking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-8 max-w-2xl mx-auto text-lg">
            Join thousands of pet owners and sitters who trust Petflik for their pet care needs. 
            Start connecting today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate('/select-role')}
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg font-semibold"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

