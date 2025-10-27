import { supabase } from '@/integrations/supabase/client';
import type { UserSubscription } from '@/types';

// Placeholder payment services - to be implemented with Stripe
export const getSubscriptionPlans = async () => {
  console.log('Payment services not yet implemented');
  return [];
};

export const getUserSubscription = async (userId: string) => {
  console.log('Payment services not yet implemented');
  return null;
};

export const getSubscriptionStatus = async (userId: string): Promise<UserSubscription | null> => {
  try {
    // Query subscriptions table in Supabase
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no subscription found, return null (not an error)
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      plan: data.plan || 'free',
      status: data.status || 'inactive',
      currentPeriodStart: data.current_period_start ? new Date(data.current_period_start) : new Date(),
      currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : new Date(),
      cancelAtPeriodEnd: data.cancel_at_period_end || false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return null;
  }
};

export const hasActiveSubscription = async (userId: string): Promise<boolean> => {
  try {
    const subscription = await getSubscriptionStatus(userId);
    return subscription?.status === 'active' || false;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};

export const createUserSubscription = async (
  userId: string,
  plan: string,
  stripeSubscriptionId?: string,
  stripeCustomerId?: string
): Promise<UserSubscription> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan,
        status: 'active',
        stripe_subscription_id: stripeSubscriptionId,
        stripe_customer_id: stripeCustomerId,
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      plan: data.plan,
      status: data.status,
      currentPeriodStart: new Date(data.current_period_start),
      currentPeriodEnd: new Date(data.current_period_end),
      cancelAtPeriodEnd: data.cancel_at_period_end || false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const updateUserSubscription = async (
  userId: string,
  updates: Partial<{
    plan: string;
    status: string;
    stripe_subscription_id: string;
    stripe_customer_id: string;
    cancel_at_period_end: boolean;
  }>
) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export const cancelUserSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancel_at_period_end: true,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

export const getUserPaymentMethods = async (userId: string) => {
  try {
    // This would typically fetch from Stripe via an API
    // For now, returning empty array as placeholder
    console.log('getUserPaymentMethods not yet fully implemented for user:', userId);
    return [];
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }
};
