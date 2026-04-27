const parseBool = (value: string | undefined): boolean => {
  return typeof value === 'string' && ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const parsePositiveNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const featureFlags = {
  minPaymentMode: parseBool(import.meta.env.VITE_MIN_PAYMENT_MODE),
  minPaymentChf: parsePositiveNumber(import.meta.env.VITE_MIN_PAYMENT_CHF, 1),
};

