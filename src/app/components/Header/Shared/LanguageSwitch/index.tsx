import s from "./LanguageSwitch.module.scss";
import { type Locale } from "@/i18n/config";

interface LanguageSwitchProps {
    lang: Locale;
}

export default function LanguageSwitch({ lang }: LanguageSwitchProps) {
    return (
        <span className={s.langSwitch}>{lang === 'ua' ? 'UKR' : 'RUS'}</span>
    );
}
