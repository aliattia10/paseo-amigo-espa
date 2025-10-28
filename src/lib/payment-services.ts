// Placeholder payment services - to be implemented with Stripe integration

export const createSubscription = async (userId: string, planId?: string, paymentMethodId?: string) => {
  // TODO: Implement with Stripe
  throw new Error('Payment services not yet implemented');
};

export const createUserSubscription = async (data: any) => {
  // TODO: Implement with Supabase
  throw new Error('Payment services not yet implemented');
};

export const getUserSubscription = async (userId: string) => {
  // TODO: Implement with Supabase query
  return null;
};

export const getSubscriptionStatus = async (userId: string) => {
  return {
    hasActiveSubscription: false,
    subscription: null,
    daysUntilExpiry: null,
  };
};

export const getSubscriptionPlans = async () => {
  // TODO: Implement with Supabase query
  return [];
};

export const cancelSubscription = async (subscriptionId: string) => {
  // TODO: Implement with Stripe
  throw new Error('Payment services not yet implemented');
};

export const cancelUserSubscription = async (userId: string) => {
  // TODO: Implement with Stripe
  throw new Error('Payment services not yet implemented');
};

export const addPaymentMethod = async (userId: string, paymentMethodId: string) => {
  // TODO: Implement with Stripe
  throw new Error('Payment services not yet implemented');
};

export const getPaymentMethods = async (userId: string) => {
  // TODO: Implement with Supabase query
  return [];
};

export const getUserPaymentMethods = async (userId: string) => {
  // TODO: Implement with Supabase query
  return [];
};

export const deletePaymentMethod = async (paymentMethodId: string) => {
  // TODO: Implement with Stripe
  throw new Error('Payment services not yet implemented');
};
