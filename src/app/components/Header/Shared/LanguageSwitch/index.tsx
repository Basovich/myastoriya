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
        const segments = pathname.split('/');

        if (segments[1] === 'ua' || segments[1] === 'ru') {
            segments[1] = targetLang;
        } else {
            segments.splice(1, 0, targetLang);
        }

        return segments.join('/');
    };

    return (
        <div className={s.langSwitch}>
            <Link
                href={getSwitchUrl('ua')}
                className={`${s.langOption} ${lang === 'ua' ? s.active : ''}`}
            >
                UKR
            </Link>
            <Link
                href={getSwitchUrl('ru')}
                className={`${s.langOption} ${lang === 'ru' ? s.active : ''}`}
            >
                RUS
            </Link>
        </div>
    );
}
