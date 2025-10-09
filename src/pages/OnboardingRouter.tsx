import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDogsByOwner, getWalkerProfile } from '@/lib/supabase-services';
import DogProfileForm from '@/components/onboarding/DogProfileForm';
import WalkerProfileForm from '@/components/onboarding/WalkerProfileForm';
import HomePage from '@/components/dashboard/HomePage';
import WalkerDashboard from '@/components/dashboard/WalkerDashboard';
import OwnerDashboard from '@/components/dashboard/OwnerDashboard';

const OnboardingRouter: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!currentUser || !userProfile) {
        setLoading(false);
        return;
      }

      try {
        if (userProfile.userType === 'owner') {
          const dogs = await getDogsByOwner(currentUser.id);
          setNeedsOnboarding(dogs.length === 0);
        } else if (userProfile.userType === 'walker') {
          const profile = await getWalkerProfile(currentUser.id);
          setNeedsOnboarding(!profile);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [currentUser, userProfile]);

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

  if (!currentUser || !userProfile) {
    return null;
  }

  if (needsOnboarding) {
    if (userProfile.userType === 'owner') {
      return <DogProfileForm />;
    } else {
      return <WalkerProfileForm />;
    }
  }

  if (userProfile.userType === 'owner') {
    return <OwnerDashboard />;
  } else {
    return <WalkerDashboard />;
  }
};

export default OnboardingRouter;
