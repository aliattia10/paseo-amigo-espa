import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CodeOfConductPage: React.FC = () => {
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

        <div className="prose dark:prose-invert max-w-none">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Code of Conduct</h1>
          <p className="text-sm text-gray-500 mb-6">Last Updated: January 7, 2026</p>
          
          <div className="space-y-8 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Commitment</h2>
              <p>
                Petflik is dedicated to providing a safe, respectful, and inclusive community for pet lovers. 
                All users are expected to adhere to this Code of Conduct.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Owner Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate descriptions of your pet's behavior and needs.</li>
                <li>Ensure your pet is healthy and up-to-date on vaccinations.</li>
                <li>Communicate clearly and timely with your sitter.</li>
                <li>Treat sitters with respect and provide a safe environment.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sitter Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Follow all care instructions provided by the owner.</li>
                <li>Provide regular updates and photos during the service.</li>
                <li>Prioritize the safety and well-being of the pet at all times.</li>
                <li>Be punctual and professional in all interactions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Prohibited Behaviors</h2>
              <p>
                Harassment, discrimination, animal neglect, or fraudulent activity will not be tolerated 
                and will result in immediate removal from the platform.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeOfConductPage;

