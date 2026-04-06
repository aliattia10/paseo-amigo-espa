import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ShieldX } from 'lucide-react';

interface VerifyIdentityOutcomeProps {
  status: string;
  sessionId: string;
  onContinue: () => void;
}

/**
 * Shown after Didit redirects back to `/verify-identity` with query params.
 */
const VerifyIdentityOutcome: React.FC<VerifyIdentityOutcomeProps> = ({ status, sessionId, onContinue }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => onContinue(), 3000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  const approved = status.toLowerCase() === 'approved';
  const declined = status.toLowerCase() === 'declined';
  const inReview = status.toLowerCase() === 'in review';

  return (
    <div className="min-h-screen bg-gradient-to-b from-ash-grey/20 via-white to-muted-olive/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
            approved ? 'bg-sage-green/20 dark:bg-sage-green/30' : declined ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
          }`}
        >
          {approved ? (
            <ShieldCheck className="w-10 h-10 text-medium-jungle dark:text-sage-green" />
          ) : (
            <ShieldX className={`w-10 h-10 ${declined ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
          )}
        </div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          {approved
            ? t('verifyIdentity.successTitle', 'Verification submitted')
            : declined
              ? t('verifyIdentity.declinedTitle', 'Verification declined')
              : inReview
                ? t('verifyIdentity.inReviewTitle', 'Under review')
                : t('verifyIdentity.completeTitle', 'Verification complete')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {approved
            ? t('verifyIdentity.successDesc', "Your identity is being verified. You'll be updated when it's approved.")
            : declined
              ? t('verifyIdentity.declinedDesc', 'Your verification was not approved. You can try again from your profile.')
              : inReview
                ? t('verifyIdentity.inReviewDesc', 'Your documents are being reviewed. We will notify you once complete.')
                : t('verifyIdentity.redirectDesc', 'Redirecting to dashboard...')}
        </p>
        {sessionId && (
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate max-w-full" title={sessionId}>
            ID: {sessionId}
          </p>
        )}
        <button
          type="button"
          onClick={() => onContinue()}
          className="text-primary font-medium hover:underline"
        >
          {t('verifyIdentity.goToDashboard', 'Go to dashboard')} →
        </button>
      </div>
    </div>
  );
};

export default VerifyIdentityOutcome;
