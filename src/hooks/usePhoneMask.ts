import { ChangeEvent, useCallback } from 'react';

/**
 * Ukrainian mobile phone mask: +38 (0XX) XXX XX XX
 * Allows only mobile numbers (starts with 0XX where XX is operator code).
 *
 * Returns:
 *  - `value`      — formatted display value
 *  - `rawValue`   — digits only (e.g. "380671234567"), ready for API
 *  - `onChange`   — drop-in replacement for input onChange
 */
export function usePhoneMask(
    value: string,
    onChange: (raw: string, formatted: string) => void,
) {
    const format = useCallback((digits: string): string => {
        // digits = only 0-9, max 12 chars (380XXXXXXXXX)
        if (!digits) return '';

        // Always prefix with 38 if user starts typing 0
        if (digits.startsWith('0')) {
            digits = '38' + digits;
        }
        // Clamp to 12 digits
        digits = digits.slice(0, 12);

        let result = '+';
        if (digits.length > 0) result += digits.slice(0, 2);           // 38
        if (digits.length > 2) result += ' (' + digits.slice(2, 5);    // (0XX
        if (digits.length > 5) result += ') ' + digits.slice(5, 8);    // ) XXX
        if (digits.length > 8) result += ' ' + digits.slice(8, 10);    // XX
        if (digits.length > 10) result += ' ' + digits.slice(10, 12);   // XX

        return result;
    }, []);

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, ''); // strip non-digits
        const formatted = format(raw);
        onChange(raw, formatted);
    }, [format, onChange]);

    // Convert stored value back to formatted on every render
    const formatted = format(value.replace(/\D/g, ''));

    return { formatted, handleChange };
}

export default usePhoneMask;
