import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const UserAgreementPage: React.FC = () => {
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
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">Legal Documentation</h1>
          
          <div className="space-y-12">
            {/* Terms and Conditions Section */}
            <section id="terms" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Terms and Conditions</h2>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 mb-4">Last Updated: January 7, 2026</p>
                <p className="text-gray-700 dark:text-gray-300">
                  Welcome to Petflik. These Terms and Conditions govern your use of our platform. By using our services, you agree to these terms.
                </p>
                <h3 className="text-lg font-semibold mt-4">Platform Usage</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Petflik connects pet owners with sitters. We facilitate the marketplace and payments but are not the service providers.
                </p>
              </div>
            </section>

            {/* Privacy Policy Section */}
            <section id="privacy" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Privacy Policy</h2>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300">
                  We respect your privacy. We collect data necessary for creating your account, facilitating bookings, and improving our services. We do not sell your personal data.
                </p>
              </div>
            </section>

            {/* Refund and Payment Policy Section */}
            <section id="refund" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Refund and Payment Policy</h2>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300">
                  Payments are held in escrow until the service is completed. Refunds are subject to cancellation terms and must be requested through our support channel.
                </p>
              </div>
            </section>

            {/* Code of Conduct Section */}
            <section id="conduct" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Code of Conduct</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50/50 dark:bg-green-900/10 p-6 rounded-xl border border-green-100 dark:border-green-900/20">
                  <h3 className="text-lg font-bold text-green-800 dark:text-green-400 mb-2">Pet Owner Conduct</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Expected behaviors for pet owners, including accurate pet descriptions and timely communication.
                  </p>
                </div>
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/20">
                  <h3 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-2">Petsitter Conduct</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Professional standards for sitters, including safety protocols and care reporting.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <section className="mt-16 text-center py-12 border-t border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 italic">
              Note: Full legal documents are available upon request. Please contact legal@petflik.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserAgreementPage;
