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

/**
 * Formats a phone number to standard E.164 format (+380XXXXXXXXX).
 */
export const formatPhone = (phone: string | null | undefined): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('380') && cleaned.length === 12) return `+${cleaned}`;
    if (cleaned.length === 10 && cleaned.startsWith('0')) return `+38${cleaned}`;
    if (cleaned.length === 9) return `+380${cleaned}`;
    return phone.startsWith('+') ? phone : `+${cleaned}`;
};
