"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import s from "./LanguageSwitch.module.scss";
import { type Locale } from "@/i18n/config";

interface LanguageSwitchProps {
    lang: Locale;
}

export default function LanguageSwitch({ lang }: LanguageSwitchProps) {
    const pathname = usePathname();

    const getSwitchUrl = (targetLang: 'ua' | 'ru') => {
        if (!pathname) return '/';
        const segments = pathname.split('/').filter(Boolean);
        const newSegments = [...segments];

        // Process if current first segment is a known locale
        if (segments[0] === 'ua' || segments[0] === 'ru') {
            newSegments.shift();
        }

        // Add target locale if it's not the default
        if (targetLang !== 'ua') {
            newSegments.unshift(targetLang);
        }

        return '/' + newSegments.join('/');
    };

    return (
        <div className={s.langSwitch}>
            {lang === 'ua' ? (
                <span className={`${s.langOption} ${s.active}`}>UKR</span>
            ) : (
                <Link href={getSwitchUrl('ua')} className={s.langOption}>UKR</Link>
            )}

            {lang === 'ru' ? (
                <span className={`${s.langOption} ${s.active}`}>RUS</span>
            ) : (
                <Link href={getSwitchUrl('ru')} className={s.langOption}>RUS</Link>
            )}
        </div>
    );
}
