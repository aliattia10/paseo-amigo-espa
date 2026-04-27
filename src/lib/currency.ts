export const APP_CURRENCY = 'CHF';

export const formatCurrencyChf = (amount: number, locale = 'de-CH'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: APP_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
};

