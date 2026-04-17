import { parse, isValid, parseISO } from 'date-fns';

/**
 * Robustly parses a date string into a Date object.
 * Supports ISO (yyyy-MM-dd) and Ukrainian/European (dd.MM.yyyy) formats.
 */
export function parseDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;

    // 1. Try parseISO (yyyy-MM-dd)
    const isoDate = parseISO(dateStr);
    if (isValid(isoDate) && isoDate.getFullYear() > 1900) {
        return isoDate;
    }

    // 2. Try dd.MM.yyyy (common backend format in Ukraine)
    try {
        const ddmmyyyy = parse(dateStr, 'dd.MM.yyyy', new Date());
        if (isValid(ddmmyyyy) && ddmmyyyy.getFullYear() > 1900) {
            return ddmmyyyy;
        }
    } catch (e) {
        // Continue
    }

    return null;
}
