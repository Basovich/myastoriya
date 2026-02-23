import { ChangeEvent, useCallback } from 'react';

/**
 * Ukrainian mobile phone mask: +38 (0XX) XXX XX XX
 * Always enforces the +380 prefix — user only inputs 9 digits after it.
 *
 * Returns:
 *  - `formatted`    — display value, e.g. "+38 (067) 123 45 67"
 *  - `handleChange` — drop-in replacement for input onChange
 */
export function usePhoneMask(
    rawValue: string,
    onChange: (raw: string) => void,
) {
    /** Format 12 digits (380XXXXXXXXX) → "+38 (0XX) XXX XX XX" */
    const format = useCallback((digits: string): string => {
        if (!digits) return '';
        let r = '+';
        if (digits.length > 0) r += digits.slice(0, 2);             // 38
        if (digits.length > 2) r += ' (' + digits.slice(2, 5);     // (0XX
        if (digits.length > 5) r += ') ' + digits.slice(5, 8);     // ) XXX
        if (digits.length > 8) r += ' ' + digits.slice(8, 10);     // XX
        if (digits.length > 10) r += ' ' + digits.slice(10, 12);    // XX
        return r;
    }, []);

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        // Strip everything that is not a digit
        let digits = e.target.value.replace(/\D/g, '');

        // Normalise prefix: always keep exactly "380" at the start
        if (digits.startsWith('380')) {
            // ok — keep as is
        } else if (digits.startsWith('38')) {
            // User typed "38..." — keep, they'll type "0" next
        } else if (digits.startsWith('3')) {
            digits = '38' + digits.slice(1);
        } else if (digits.startsWith('0')) {
            digits = '38' + digits;
        } else if (digits.length > 0) {
            digits = '380' + digits;
        }

        // Clamp to 12 digits
        digits = digits.slice(0, 12);

        onChange(digits);
    }, [onChange]);

    // Reformat rawValue (digits only, 12 chars) each render
    const digits = rawValue.replace(/\D/g, '').slice(0, 12);
    const formatted = format(digits);

    return { formatted, handleChange };
}

export default usePhoneMask;
