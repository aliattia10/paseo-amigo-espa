import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import OnboardingRouter from './OnboardingRouter';

const Index = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  return <OnboardingRouter />;
};

export default Index;