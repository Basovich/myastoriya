"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import s from "./LanguageSwitch.module.scss";
import { type Locale } from "@/i18n/config";
import { useAlternateUrls, resolveSwitchUrl } from "@/hooks/useAlternateUrls";

interface LanguageSwitchProps {
    lang: Locale;
}

export default function LanguageSwitch({ lang }: LanguageSwitchProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { alternateUrls } = useAlternateUrls();

    const getSwitchUrl = (targetLang: 'ua' | 'ru') => {
        return resolveSwitchUrl(targetLang, pathname, searchParams, alternateUrls);
    };

    return (
        <div className={s.langSwitch}>
            {lang === 'ua' ? (
                <span className={clsx(s.langOption, s.active)}>UKR</span>
            ) : (
                <Link href={getSwitchUrl('ua')} className={s.langOption}>UKR</Link>
            )}

            {lang === 'ru' ? (
                <span className={clsx(s.langOption, s.active)}>RUS</span>
            ) : (
                <Link href={getSwitchUrl('ru')} className={s.langOption}>RUS</Link>
            )}
        </div>
    );
}
