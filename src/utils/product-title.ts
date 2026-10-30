import { getProductWeight, type ProductWeightInput } from '@/lib/graphql/queries/products';

/**
 * Перевіряє, чи містить рядок одиниці виміру ваги або об'єму (г, кг, мл, л тощо).
 */
export function hasWeightOrVolume(text: string): boolean {
    if (!text) return false;
    // Шукає патерни типу "0,5 л", "500 г", "230г", "1 кг", "250/40 г", "0.25 л"
    return /(?:\b|\d)\s*(?:\d+(?:[.,]\d+)?|\d+\s*(?:\/\s*\d+)+)\s*(?:г|g|кг|kg|мл|ml|л|l)(?![а-яА-Яa-zA-Z0-9])/i.test(text);
}

/**
 * Екранує спеціальні символи для RegExp.
 */
function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Отримує рядок ваги чи об'єму для бейджа товару (як на фото товару).
 * Форматує десяткові коми для української локалізації (0,5 л замість 0.5 л).
 * Підтримує також складові порції страв ресторанного типу (наприклад, "250/40 г").
 */
export function getProductWeightBadge(product: ProductWeightInput): string {
    const portion = product.portionSize?.trim();
    if (
        portion &&
        /(?:\d+(?:[.,]\d+)?|\d+\s*(?:\/\s*\d+)+)\s*(?:г|g|кг|kg|мл|ml|л|l)(?![а-яА-Яa-zA-Z0-9])/i.test(portion)
    ) {
        return portion.replace(/(\d+)\.(\d+)/g, '$1,$2');
    }

    const calculatedWeight = getProductWeight(product);
    if (
        calculatedWeight &&
        /(?:\d+(?:[.,]\d+)?|\d+\s*(?:\/\s*\d+)+)\s*(?:г|g|кг|kg|мл|ml|л|l)(?![а-яА-Яa-zA-Z0-9])/i.test(calculatedWeight)
    ) {
        return calculatedWeight.replace(/(\d+)\.(\d+)/g, '$1,$2');
    }

    return '';
}

/**
 * Формує повну назву товару з характеристиками ваги чи об'єму в дужках (наприклад, "Coca-Cola (0,5 л)").
 * Якщо назва вже містить вагу/об'єм — повертає початкову назву без змін.
 */
export function getProductDisplayName(product: ProductWeightInput): string {
    const rawName = product.name?.trim() || '';
    if (!rawName) return '';

    if (hasWeightOrVolume(rawName)) {
        return rawName;
    }

    const badge = getProductWeightBadge(product);
    if (badge) {
        // Очищаємо від можливих вже наявних зовнішніх дужок, щоб не було подвійних дужок ((0,5 л))
        let cleanBadge = badge.trim();
        if (cleanBadge.startsWith('(') && cleanBadge.endsWith(')')) {
            cleanBadge = cleanBadge.slice(1, -1).trim();
        }
        return `${rawName} (${cleanBadge})`;
    }

    return rawName;
}

/**
 * Оновлює текст (title, description, h1), замінюючи початкову назву товару на повну назву з одиницями виміру,
 * якщо текст ще не містить ваги/об'єму.
 */
export function enhanceSeoTextWithDisplayName(
    text: string,
    rawName: string,
    displayName: string,
): string {
    if (!text || !rawName || rawName === displayName) {
        return text;
    }

    if (hasWeightOrVolume(text)) {
        return text;
    }

    const regex = new RegExp(escapeRegExp(rawName), 'i');
    return text.replace(regex, displayName);
}
