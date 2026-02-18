import Link from "next/link";
import s from "./TopBar.module.scss";
import siteData from "@/content/site.json";
import { type Locale } from "@/i18n/config";
import { getLocalizedHref } from "@/utils/i18n-helpers";
import LanguageSwitch from "@/app/components/Header/Shared/LanguageSwitch";

interface TopBarProps {
    lang: Locale;
}

export default function TopBar({ lang }: TopBarProps) {
    return (
        <nav className={s.secondaryNav}>
            <div className={s.secondaryInner}>
                <div className={s.navLinks}>
                    {siteData.navigation.map((item, i) => (
                        <Link key={i} href={getLocalizedHref(item.href, lang)} className={s.navLink}>
                            {item.label}
                        </Link>
                    ))}
                </div>
                <div className={s.navRight}>
                    <a href={`tel:${siteData.contact.phone}`} className={s.navPhone}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        {siteData.contact.phone}
                    </a>
                    <LanguageSwitch lang={lang} />
                </div>
            </div>
        </nav>
    );
}