"use client";

import AppLink from "@/app/components/ui/AppLink/AppLink";
import s from "./TopBar.module.scss";
import siteData from "@/content/site.json";
import { type Locale } from "@/i18n/config";
import { useAppSelector } from "@/store/hooks";
import Image from "next/image";
import LanguageSwitch from "@/app/components/Header/Shared/LanguageSwitch";
import PointsInfo from "@/app/components/Header/DesktopHeader/MainBar/PointsInfo";

interface TopBarProps {
    lang: Locale;
}

const TOP_NAV_ITEMS = [
    { label: "Заклади", href: "/our-stores" },
    { label: "Акції", href: "/actions" },
    { label: "Доставка та Оплата", href: "/delivery" },
    { label: "Блог", href: "/blog" },
    { label: "Франшиза", href: "https://f.myastoriya.ua/" },
    { label: "Контакти", href: "/contacts" },
];

export default function TopBar({ lang }: TopBarProps) {
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    return (
        <nav className={s.secondaryNav}>
            <div className={s.secondaryInner}>
                <div className={s.leftSection}>

                    <div className={s.navLinks}>
                        {TOP_NAV_ITEMS.map((item, i) => (
                            <AppLink key={i} href={item.href} className={s.navLink}>
                                {item.label}
                            </AppLink>
                        ))}
                    </div>
                </div>

                <div className={s.navRight}>
                    {isAuthenticated && <PointsInfo />}
                    <a href={`tel:${siteData.contact.phone.replace(/\s+/g, '')}`} className={s.navPhone}>
                        <Image
                            src="/icons/icon-phone-outline.svg"
                            alt="Phone"
                            width="16"
                            height="16"
                        />
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