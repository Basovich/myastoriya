import 'server-only';
import { type Locale } from './config';
import { type Dictionary } from './types';

const dictionaries = {
    ua: () => import('@/content/ua.json').then((module) => module.default as Dictionary),
    ru: () => import('@/content/ru.json').then((module) => module.default as Dictionary),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
    if (typeof dictionaries[locale] === 'function') {
        return dictionaries[locale]();
    }
    return dictionaries.ua();
};
