import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2 } from 'lucide-react';
import KycUploadForm from '@/components/kyc/KycUploadForm';

const VerifyIdentityPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, userProfile, loading: authLoading, refreshUserProfile } = useAuth();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/auth');
      return;
    }
  }, [authLoading, currentUser, navigate]);

  const handleSuccess = () => {
    refreshUserProfile();
    navigate('/dashboard');
  };

  const handleSkip = () => {
    if (userProfile?.userType === 'owner') navigate('/pet-profile-setup');
    else if (userProfile?.userType === 'walker') navigate('/sitter-profile-setup');
    else navigate('/dashboard');
  };

  if (authLoading || !currentUser?.id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-ash-grey/20 via-white to-muted-olive/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-medium-jungle dark:text-sage-green mb-4" />
        <p className="text-gray-600 dark:text-gray-300">{t('common.loading', 'Loading...')}</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-ash-grey/20 via-white to-muted-olive/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-medium-jungle dark:text-sage-green mb-4" />
        <p className="text-gray-600 dark:text-gray-300">{t('common.loading', 'Loading profile...')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ash-grey/20 via-white to-muted-olive/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-sage-green/20 dark:bg-sage-green/30 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-10 h-10 text-medium-jungle dark:text-sage-green" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {t('verifyIdentity.title', 'Verify your identity')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('verifyIdentity.description', 'To keep our community safe, we ask you to verify your identity with a quick ID check. This only takes a minute.')}
        </p>

        <div className="pt-4 text-left">
          <KycUploadForm
            userId={currentUser.id}
            onSuccess={handleSuccess}
          />
        </div>

        <Button variant="ghost" className="w-full text-gray-600 dark:text-gray-400" onClick={handleSkip}>
          {t('verifyIdentity.skip', 'Skip for now')}
        </Button>
      </div>
    </div>
  );
};

export default VerifyIdentityPage;
