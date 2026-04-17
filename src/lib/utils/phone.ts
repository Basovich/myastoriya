/**
 * Regex for validation of Ukrainian phone numbers.
 * Allows optional leading plus sign.
 * Format: +380XXXXXXXXX or 380XXXXXXXXX
 */
export const PHONE_REGEX = /^\+?380\d{9}$/;

/**
 * Normalizes a phone number by stripping all non-digit characters.
 * @param phone The phone string to normalize
 * @returns Digits only string
 */
export const normalizePhone = (phone: string | null | undefined): string => 
    phone?.replace(/\D/g, '') || '';
