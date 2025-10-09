import { supabase } from '@/integrations/supabase/client';

// Placeholder payment services - to be implemented with Stripe
export const getSubscriptionPlans = async () => {
  console.log('Payment services not yet implemented');
  return [];
};

export const getUserSubscription = async (userId: string) => {
  console.log('Payment services not yet implemented');
  return null;
};

export const hasActiveSubscription = async (userId: string): Promise<boolean> => {
  console.log('Payment services not yet implemented');
  return false;
};
