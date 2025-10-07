import { supabase } from './supabase';
import type { SubscriptionPlan, UserSubscription, PaymentMethod } from '@/types';

// Subscription Plan Services
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price', { ascending: true });

  if (error) throw error;

  return data.map(plan => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    interval: plan.interval as 'month' | '6months' | 'year',
    features: plan.features,
    stripePriceId: plan.stripe_price_id,
    popular: plan.popular,
  }));
};

// User Subscription Services
export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    planId: data.plan_id,
    stripeSubscriptionId: data.stripe_subscription_id,
    status: data.status as 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete',
    currentPeriodStart: new Date(data.current_period_start),
    currentPeriodEnd: new Date(data.current_period_end),
    cancelAtPeriodEnd: data.cancel_at_period_end,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
};

export const createUserSubscription = async (subscriptionData: Omit<UserSubscription, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: subscriptionData.userId,
      plan_id: subscriptionData.planId,
      stripe_subscription_id: subscriptionData.stripeSubscriptionId,
      status: subscriptionData.status,
      current_period_start: subscriptionData.currentPeriodStart.toISOString(),
      current_period_end: subscriptionData.currentPeriodEnd.toISOString(),
      cancel_at_period_end: subscriptionData.cancelAtPeriodEnd,
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const updateUserSubscription = async (subscriptionId: string, updates: Partial<UserSubscription>) => {
  const updateData: any = {};
  
  if (updates.status) updateData.status = updates.status;
  if (updates.currentPeriodStart) updateData.current_period_start = updates.currentPeriodStart.toISOString();
  if (updates.currentPeriodEnd) updateData.current_period_end = updates.currentPeriodEnd.toISOString();
  if (updates.cancelAtPeriodEnd !== undefined) updateData.cancel_at_period_end = updates.cancelAtPeriodEnd;
  
  updateData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('user_subscriptions')
    .update(updateData)
    .eq('id', subscriptionId);

  if (error) throw error;
};

export const cancelUserSubscription = async (subscriptionId: string) => {
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);

  if (error) throw error;
};

// Payment Method Services
export const getUserPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(method => ({
    id: method.id,
    userId: method.user_id,
    stripePaymentMethodId: method.stripe_payment_method_id,
    type: method.type as 'card',
    card: {
      brand: method.card_brand,
      last4: method.card_last4,
      expMonth: method.card_exp_month,
      expYear: method.card_exp_year,
    },
    isDefault: method.is_default,
    createdAt: new Date(method.created_at),
  }));
};

export const createPaymentMethod = async (paymentMethodData: Omit<PaymentMethod, 'id' | 'createdAt'>) => {
  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      user_id: paymentMethodData.userId,
      stripe_payment_method_id: paymentMethodData.stripePaymentMethodId,
      type: paymentMethodData.type,
      card_brand: paymentMethodData.card.brand,
      card_last4: paymentMethodData.card.last4,
      card_exp_month: paymentMethodData.card.expMonth,
      card_exp_year: paymentMethodData.card.expYear,
      is_default: paymentMethodData.isDefault,
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const setDefaultPaymentMethod = async (paymentMethodId: string, userId: string) => {
  // First, unset all other default payment methods
  await supabase
    .from('payment_methods')
    .update({ is_default: false })
    .eq('user_id', userId);

  // Then set the new default
  const { error } = await supabase
    .from('payment_methods')
    .update({ is_default: true })
    .eq('id', paymentMethodId);

  if (error) throw error;
};

export const deletePaymentMethod = async (paymentMethodId: string) => {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', paymentMethodId);

  if (error) throw error;
};

// Check if user has active subscription
export const hasActiveSubscription = async (userId: string): Promise<boolean> => {
  const subscription = await getUserSubscription(userId);
  return subscription !== null && subscription.status === 'active';
};

// Get subscription status for UI
export const getSubscriptionStatus = async (userId: string): Promise<{
  hasActiveSubscription: boolean;
  subscription: UserSubscription | null;
  daysUntilExpiry: number | null;
}> => {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    return {
      hasActiveSubscription: false,
      subscription: null,
      daysUntilExpiry: null,
    };
  }

  const now = new Date();
  const expiryDate = subscription.currentPeriodEnd;
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    hasActiveSubscription: subscription.status === 'active',
    subscription,
    daysUntilExpiry: daysUntilExpiry > 0 ? daysUntilExpiry : 0,
  };
};
