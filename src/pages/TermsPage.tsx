import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsPage: React.FC = () => {
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
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Terms and Conditions</h1>
          <p className="text-sm text-gray-500 mb-6">Last Updated: January 7, 2026</p>
          
          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the Petflik platform, you agree to be bound by these Terms and Conditions. 
                If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
              <p>
                Petflik is a marketplace platform that connects pet owners with independent pet care providers 
                ("Sitters" or "Walkers"). Petflik does not provide pet care services itself and is not responsible 
                for the actions or omissions of users on the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Accounts</h2>
              <p>
                You must be at least 18 years old to create an account. You are responsible for maintaining 
                the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Payments and Fees</h2>
              <p>
                Payments for services must be made through the Petflik platform. We use a secure escrow system 
                to protect both owners and sitters. Petflik charges a service fee for facilitating the match 
                and payment processing.
              </p>
              <p className="mt-3">
                Funds may be <strong>held</strong> until the scheduled service is completed and the owner has had the 
                opportunity to leave a review, after which release to the sitter can proceed according to our payment rules.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Cancellations and no-shows</h2>
              <p>
                If an owner cancels <strong>late</strong> (for example within a few hours of the scheduled start time), 
                the sitter may be entitled to payment for a <strong>minimum billable duration</strong> as shown at booking 
                or in your booking confirmation, unless applicable law requires otherwise.
              </p>
              <p className="mt-3">
                If a sitter <strong>does not show</strong> for a confirmed booking, the owner should not be charged for 
                that session; any amounts held may be released back to the owner in line with our refund process.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Communication and bookings</h2>
              <p>
                After you match with another user, you should use Petflik&apos;s <strong>in-app messaging</strong> for 
                coordination. Pet-sitting arrangements should be made <strong>through the platform</strong> so we can 
                support trust, safety, and dispute handling where appropriate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Veterinary and emergency costs</h2>
              <p>
                If a pet requires <strong>necessary</strong> veterinary care during a sitting and the sitter acted 
                <strong> reasonably and without negligence</strong>, the <strong>owner</strong> is responsible for 
                reimbursing documented, reasonable costs that were agreed or clearly required for the animal&apos;s 
                welfare. Sitters should seek owner contact when practicable; owners should provide emergency instructions 
                in the booking or profile where possible.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Referrals and promotions</h2>
              <p>
                Petflik may offer referral or promotional discounts (for example a percentage off eligible sitting hours). 
                Terms of each offer are shown at checkout or in the offer details and may change over time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Identity verification</h2>
              <p>
                We may require identity verification (for example via our partner <strong>Didit</strong>) to increase trust. 
                Verification is subject to the provider&apos;s process and acceptable use. See our verification screen and{' '}
                <a href="https://docs.didit.me/core-technology/id-verification/overview" className="text-medium-jungle underline" target="_blank" rel="noopener noreferrer">
                  Didit ID Verification overview
                </a>
                {' '}for how document and liveness checks work at a high level.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Support and Refund Contact</h2>
              <p>
                If you need billing help, a refund review, or assistance with a dispute, contact
                {' '}
                <a href="mailto:info@petflik.com" className="text-medium-jungle underline">info@petflik.com</a>.
                We will review requests according to this Terms page and our Refund Policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

