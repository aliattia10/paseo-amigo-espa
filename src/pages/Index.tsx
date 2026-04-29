import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import OnboardingRouter from './OnboardingRouter';

const Index = () => {
  const { currentUser, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading', { lng: 'en' })}</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Use a simpler mobile-first landing when running inside native shell.
    const landingPath = Capacitor.isNativePlatform() ? "/app-home" : "/home";
    return <Navigate to={landingPath} replace />;
  }

  // If user is logged in, redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default Index;