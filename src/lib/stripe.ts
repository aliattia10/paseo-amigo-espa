import { loadStripe, Stripe } from '@stripe/stripe-js';

// Stripe configuration
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key';

// Initialize Stripe
export const stripePromise = loadStripe(stripePublishableKey);

// Stripe configuration for Elements
export const stripeOptions = {
  mode: 'subscription' as const,
  currency: 'eur',
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#d97706', // terracotta color
      colorBackground: '#fef7ed', // warm background
      colorText: '#1f2937', // warm text
      colorDanger: '#dc2626',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  },
};

// Subscription plans configuration
export const SUBSCRIPTION_PLANS: Array<{
  id: string;
  name: string;
  price: number;
  interval: 'month' | '6months' | 'year';
  features: string[];
  stripePriceId: string;
  popular?: boolean;
}> = [
  {
    id: 'monthly',
    name: 'Plan Mensual',
    price: 9.99,
    interval: 'month',
    features: [
      'Acceso ilimitado a compañeros verificados',
      'Chat en tiempo real',
      'Solicitudes de paseo ilimitadas',
      'Soporte prioritario',
      'Perfil destacado'
    ],
    stripePriceId: 'price_monthly_999', // Replace with actual Stripe price ID
    popular: false,
  },
  {
    id: '6months',
    name: 'Plan 6 Meses',
    price: 49.99,
    interval: '6months',
    features: [
      'Todo lo del plan mensual',
      'Ahorro del 17%',
      'Acceso anticipado a nuevas funciones',
      'Sesiones de entrenamiento gratuitas',
      'Soporte premium'
    ],
    stripePriceId: 'price_6months_4999', // Replace with actual Stripe price ID
    popular: true,
  },
  {
    id: 'yearly',
    name: 'Plan Anual',
    price: 89.99,
    interval: 'year',
    features: [
      'Todo lo del plan de 6 meses',
      'Ahorro del 25%',
      'Funciones premium exclusivas',
      'Consultoría personalizada',
      'Soporte VIP 24/7'
    ],
    stripePriceId: 'price_yearly_8999', // Replace with actual Stripe price ID
    popular: false,
  },
];

// Helper function to format price
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

// Helper function to get plan by ID
export const getPlanById = (planId: string) => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
};

// Helper function to get interval display text
export const getIntervalText = (interval: string): string => {
  switch (interval) {
    case 'month':
      return 'mes';
    case '6months':
      return '6 meses';
    case 'year':
      return 'año';
    default:
      return interval;
  }
};
