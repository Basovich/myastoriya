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

    // Розділяємо тисячі вузьким нерозривним пробілом (\u202f)
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');

    // Показуємо копійки лише якщо вони ненульові
    if (decPart === '00') {
        return intFormatted;
    }
    return `${intFormatted}.${decPart}`;
}

export function getProductPriceMultiplier(weightStr: string, unitStr: string): number {
    const cleanWeight = (weightStr || '').toLowerCase().trim();
    const cleanUnit = (unitStr || '').toLowerCase().trim();

    if (!cleanWeight) return 1;

    let weightValue = 0;
    let weightIsKgOrL = false;
    let weightIsGOrMl = false;

    const weightMatch = cleanWeight.match(/^(\d+(?:[.,]\d+)?)/);
    if (weightMatch) {
        weightValue = parseFloat(weightMatch[1].replace(',', '.'));
        if (cleanWeight.includes('кг') || cleanWeight.includes('kg') || cleanWeight.endsWith('л') || cleanWeight.endsWith('l') || cleanWeight.includes(' л')) {
            weightIsKgOrL = true;
        } else if (cleanWeight.includes('г') || cleanWeight.includes('g') || cleanWeight.includes('мл') || cleanWeight.includes('ml')) {
            weightIsGOrMl = true;
        }
    }

    if (weightValue <= 0) return 1;

    // 1. Ціна за 100 г
    if (cleanUnit.includes('100') && (cleanUnit.includes('г') || cleanUnit.includes('g'))) {
        if (weightIsKgOrL) return weightValue * 10;
        if (weightIsGOrMl) return weightValue / 100;
        return 1;
    }

    // 2. Ціна за 100 мл
    if (cleanUnit.includes('100') && (cleanUnit.includes('мл') || cleanUnit.includes('ml'))) {
        if (weightIsKgOrL) return weightValue * 10;
        if (weightIsGOrMl) return weightValue / 100;
        return 1;
    }

    // 3. Ціна за кг
    if (cleanUnit === 'кг' || cleanUnit === 'kg') {
        if (weightIsKgOrL) return weightValue;
        if (weightIsGOrMl) return weightValue / 1000;
        return 1;
    }

    // 4. Ціна за л
    if (cleanUnit === 'л' || cleanUnit === 'l') {
        if (weightIsKgOrL) return weightValue;
        if (weightIsGOrMl) return weightValue / 1000;
        return 1;
    }

    return 1;
}
