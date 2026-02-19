import Link from "next/link";
import s from "./TopBar.module.scss";
import siteData from "@/content/site.json";
import { type Locale } from "@/i18n/config";
import { getLocalizedHref } from "@/utils/i18n-helpers";

import LanguageSwitch from "@/app/components/Header/Shared/LanguageSwitch";
import PointsInfo from "@/app/components/Header/DesktopHeader/MainBar/PointsInfo";

interface TopBarProps {
    lang: Locale;
}

const TOP_NAV_ITEMS = [
    { label: "Заклади", href: "/restaurants" },
    { label: "Акції", href: "/promotions" },
    { label: "Доставка та Оплата", href: "/delivery" },
    { label: "Блог", href: "/blog" },
    { label: "Франшиза", href: "/franchise" },
    { label: "Контакти", href: "/contacts" },
];

export default function TopBar({ lang }: TopBarProps) {
    return (
        <nav className={s.secondaryNav}>
            <div className={s.secondaryInner}>
                <div className={s.leftSection}>

                    <div className={s.navLinks}>
                        {TOP_NAV_ITEMS.map((item, i) => (
                            <Link key={i} href={getLocalizedHref(item.href, lang)} className={s.navLink}>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className={s.navRight}>
                    <PointsInfo />
                    <a href={`tel:${siteData.contact.phone.replace(/\s+/g, '')}`} className={s.navPhone}>
                        <img src="/icons/icon-phone-outline.svg" alt="Phone" width="16" height="16" />
                        {siteData.contact.phone}
                    </a>
                    <div className={s.langSwitchWrapper}>
                        <LanguageSwitch lang={lang} />
                    </div>
                </div>
            </div>
        </nav>
    );
}