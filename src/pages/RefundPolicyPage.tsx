import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const RefundPolicyPage: React.FC = () => {
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
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Refund Policy</h1>
          <p className="text-sm text-gray-500 mb-6">Last Updated: January 7, 2026</p>
          
          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Cancellation by Owners</h2>
              <p>
                Owners can cancel a booking. Refund eligibility depends on how far in advance the cancellation 
                is made. Full refunds are typically available for cancellations made more than 48 hours before 
                 the service start time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Cancellation by Sitters</h2>
              <p>
                If a sitter cancels a booking, the owner will receive a full refund of the booking amount. 
                Sitters who cancel frequently may be subject to penalties or account suspension.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Disputes</h2>
              <p>
                If a service is not provided as described, owners must report the issue within 24 hours 
                of the scheduled completion time. Petflik will investigate and facilitate a resolution, 
                which may include a partial or full refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. How to Request a Refund</h2>
              <p>
                Send refund requests to
                {' '}
                <a href="mailto:info@petflik.com" className="text-medium-jungle underline">info@petflik.com</a>
                {' '}
                with your booking reference and a short description of the issue. Our support team will respond with
                next steps and eligibility details.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;

