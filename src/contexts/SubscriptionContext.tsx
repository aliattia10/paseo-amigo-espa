import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getSubscriptionStatus } from '@/lib/payment-services';
import type { UserSubscription } from '@/types';

interface SubscriptionContextType {
  hasActiveSubscription: boolean;
  subscription: UserSubscription | null;
  daysUntilExpiry: number | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSubscription = async () => {
    if (!currentUser) {
      setHasActiveSubscription(false);
      setSubscription(null);
      setDaysUntilExpiry(null);
      setLoading(false);
      return;
    }

    try {
      const status = await getSubscriptionStatus(currentUser.id);
      setHasActiveSubscription(status.hasActiveSubscription);
      setSubscription(status.subscription);
      setDaysUntilExpiry(status.daysUntilExpiry);
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
      setHasActiveSubscription(false);
      setSubscription(null);
      setDaysUntilExpiry(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, [currentUser]);

  const value: SubscriptionContextType = {
    hasActiveSubscription,
    subscription,
    daysUntilExpiry,
    loading,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
