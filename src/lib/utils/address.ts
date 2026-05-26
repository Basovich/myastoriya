/**
 * Cleans the formatted address string from Google Maps by removing zip codes,
 * country names, and city names (since the app is restricted to Kyiv bounds).
 * Uses lookbehind/lookahead assertions to avoid matching substrings like "Київська".
 */
export function cleanAddressText(address: string): string {
    if (!address) return '';

    let cleaned = address;

    // Remove zip code (5 digits followed by optional comma/space)
    cleaned = cleaned.replace(/\b\d{5}\b,?\s*/g, '');

    // Remove "Київ, Україна" combos (with strict Cyrillic boundaries)
    cleaned = cleaned.replace(/,?\s*(?<![а-яА-ЯёЁіІїЇєЄґҐ])(Київ|Киев|Kyiv)(?![а-яА-ЯёЁіІїЇєЄґҐ]),?\s*(?<![а-яА-ЯёЁіІїЇєЄґҐ])(Україна|Украина|Ukraine)(?![а-яА-ЯёЁіІїЇєЄґҐ])/gi, '');

    // Remove standalone country name
    cleaned = cleaned.replace(/,?\s*(?<![а-яА-ЯёЁіІїЇєЄґҐ])(Україна|Украина|Ukraine)(?![а-яА-ЯёЁіІїЇєЄґҐ])/gi, '');

    // Remove standalone city name (but preserve "Київська", "Київщина" etc.)
    cleaned = cleaned.replace(/,?\s*(?<![а-яА-ЯёЁіІїЇєЄґҐ])(Київ|Киев|Kyiv)(?![а-яА-ЯёЁіІїЇєЄґҐ])/gi, '');

    // Clean up stray punctuation
    return cleaned
        .replace(/,\s*,/g, ',')
        .replace(/^,\s*/, '')
        .replace(/,\s*$/, '')
        .trim();
}
