import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Shield, Users } from 'lucide-react';

const AboutUsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-medium-jungle transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">About Petflik</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Connecting pet lovers and providing trusted care for every furry friend across Europe.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-ash-grey/10 rounded-2xl">
            <div className="bg-medium-jungle/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-medium-jungle w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Our Mission</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              To ensure every pet receives the love and care they deserve when their owners are away.
            </p>
          </div>
          <div className="text-center p-6 bg-ash-grey/10 rounded-2xl">
            <div className="bg-medium-jungle/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-medium-jungle w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Our Values</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Trust, safety, and community are at the heart of everything we do at Petflik.
            </p>
          </div>
          <div className="text-center p-6 bg-ash-grey/10 rounded-2xl">
            <div className="bg-medium-jungle/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-medium-jungle w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Our Community</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A growing network of verified sitters and happy pet owners across the continent.
            </p>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">The Story of Petflik</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Petflik was founded with a simple idea: making pet care accessible, reliable, and filled with love. 
            We understood the challenge of finding someone you can truly trust with your furry family members. 
            Whether it's a quick walk during a busy workday or overnight care during a vacation, 
            Petflik provides the platform to connect with local, verified sitters.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            We are dedicated to serving pet owners and sitters all over Europe, 
            bringing our high standards of pet safety and community trust to every neighborhood.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;

