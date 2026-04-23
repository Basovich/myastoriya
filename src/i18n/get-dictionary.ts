import 'server-only';
import { type Locale } from './config';
import { type Dictionary } from './types';

const dictionaries = {
    ua: () => import('./locales/ua').then((module) => module.ua as Dictionary),
    ru: () => import('./locales/ru').then((module) => module.ru as Dictionary),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
    if (typeof dictionaries[locale] === 'function') {
        return dictionaries[locale]();
    }
    return dictionaries.ua();
};
