/**
 * Validation utility functions for form inputs
 */

/**
 * Validates email format
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Additional check for common email format issues
  if (email.trim().length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  return { isValid: true };
};

/**
 * Validates IBAN format (basic validation)
 * IBAN format: 2 letters (country code) + 2 digits (check digits) + up to 30 alphanumeric characters
 */
export const validateIBAN = (iban: string): { isValid: boolean; error?: string } => {
  if (!iban || iban.trim().length === 0) {
    return { isValid: false, error: 'IBAN is required' };
  }

  // Remove spaces and convert to uppercase
  const cleanedIban = iban.replace(/\s/g, '').toUpperCase();

  // Basic format check: should be 15-34 characters
  if (cleanedIban.length < 15 || cleanedIban.length > 34) {
    return { isValid: false, error: 'IBAN must be between 15 and 34 characters' };
  }

  // Must start with 2 letters (country code)
  if (!/^[A-Z]{2}/.test(cleanedIban)) {
    return { isValid: false, error: 'IBAN must start with a 2-letter country code (e.g., ES, FR, DE)' };
  }

  // Must have 2 digits after country code
  if (!/^[A-Z]{2}\d{2}/.test(cleanedIban)) {
    return { isValid: false, error: 'IBAN must have 2 check digits after the country code' };
  }

  // Rest should be alphanumeric
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleanedIban)) {
    return { isValid: false, error: 'IBAN contains invalid characters' };
  }

  return { isValid: true };
};

/**
 * Validates bank name
 */
export const validateBankName = (bankName: string): { isValid: boolean; error?: string } => {
  if (!bankName || bankName.trim().length === 0) {
    return { isValid: false, error: 'Bank name is required' };
  }

  if (bankName.trim().length < 2) {
    return { isValid: false, error: 'Bank name must be at least 2 characters' };
  }

  if (bankName.trim().length > 100) {
    return { isValid: false, error: 'Bank name is too long' };
  }

  return { isValid: true };
};

/**
 * Validates account holder name
 */
export const validateAccountHolderName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Account holder name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Account holder name must be at least 2 characters' };
  }

  if (name.trim().length > 100) {
    return { isValid: false, error: 'Account holder name is too long' };
  }

  // Check for valid name format (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name.trim())) {
    return { isValid: false, error: 'Account holder name contains invalid characters' };
  }

  return { isValid: true };
};

/**
 * Formats IBAN for display (adds spaces every 4 characters)
 */
export const formatIBAN = (iban: string): string => {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
};

