/**
 * Форматує ціну з пробілом як роздільником тисяч та крапкою для копійок.
 * Приклади:
 *   3159     → "3 159"
 *   3159.5   → "3 159.50"
 *   1205.99  → "1 205.99"
 */
export function formatPrice(price: number): string {
    const rounded = Math.round(price * 100) / 100;
    const [intPart, decPart] = rounded.toFixed(2).split('.');

    // Розділяємо тисячі пробілом (використовуємо звичайний пробіл)
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

    // Показуємо копійки лише якщо вони ненульові
    if (decPart === '00') {
        return intFormatted;
    }
    return `${intFormatted}.${decPart}`;
}
