import 'server-only';
import { type Locale } from './config';

// We enumerate all dictionaries here for better type safety and static analysis
const dictionaries = {
    ua: () => import('@/content/ua.json').then((module) => module.default),
    ru: () => import('@/content/ru.json').then((module) => module.default),
};

// For API fetching, we can replace the above with:
// const fetchDictionary = async (locale: Locale) => {
//   const res = await fetch(`https://api.example.com/dictionaries/${locale}`);
//   return res.json();
// }

export const getDictionary = async (locale: Locale) => {
    if (typeof dictionaries[locale] === 'function') {
        return dictionaries[locale]();
    }
    return dictionaries.ua(); // Fallback
};
