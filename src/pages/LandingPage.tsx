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
              <h1 className="text-5xl md:text-6xl font-extrabold text-medium-jungle">
                PETFLIK
              </h1>
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
              The trusted platform connecting pet owners with verified sitters across Spain. 
              Secure payments, verified reviews, and peace of mind for you and your pets.
            </p>

            {/* Hero Image - Dogs and Cats */}
            <div className="mb-12 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=400&fit=crop" 
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
                  src="https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=400&h=300&fit=crop" 
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
                  src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop" 
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
                  src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop" 
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
              src="https://images.unsplash.com/photo-1551717743-49959800b1f6?w=600&h=400&fit=crop" 
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
              src="https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=400&fit=crop" 
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
                    src="https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop" 
                    alt="Happy dog owner"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-medium-jungle/30 to-transparent"></div>
                </div>
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop" 
                    alt="Happy cat owner"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-medium-jungle/30 to-transparent"></div>
                </div>
                <div className="relative rounded-xl overflow-hidden shadow-lg col-span-2">
                  <img 
                    src="https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=300&fit=crop" 
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
                    src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop" 
                    alt="Dog sitter"
                    className="rounded-lg shadow-lg w-full h-32 object-cover"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=200&fit=crop" 
                    alt="Cat sitter"
                    className="rounded-lg shadow-lg w-full h-32 object-cover"
                  />
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=200&fit=crop" 
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

      {/* Final CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="relative bg-gradient-to-br from-medium-jungle to-sage-green rounded-2xl p-12 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto text-lg">
              Join thousands of pet owners and sitters who trust Petflik for their pet care needs. 
              Start connecting today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white hover:bg-gray-100 text-medium-jungle px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate('/select-role')}
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg font-semibold border-2 border-white text-white hover:bg-white/10"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

