import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OnboardingRouter from './OnboardingRouter';

const Index = () => {
  const { currentUser, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect unauthenticated users to signup by default
    return <Navigate to="/auth?mode=signup" replace />;
  }

  return <OnboardingRouter />;
};

export default Index;