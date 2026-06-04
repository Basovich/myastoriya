"use client";

import AppLink from "@/app/components/ui/AppLink/AppLink";
import s from "./TopBar.module.scss";
import { siteData } from "@/config/site";
import { type Locale } from "@/i18n/config";
import { useAppSelector } from "@/store/hooks";
import Image from "next/image";
import LanguageSwitch from "@/app/components/Header/Shared/LanguageSwitch";
import PointsInfo from "@/app/components/Header/DesktopHeader/MainBar/PointsInfo";

interface TopBarProps {
    lang: Locale;
}

const getTopNavItems = (lang: Locale) => [
    { label: lang === "ru" ? "Заведения" : "Заклади", href: "/our-stores" },
    { label: lang === "ru" ? "Акции" : "Акції", href: "/actions" },
    { label: lang === "ru" ? "Блог" : "Блог", href: "/blog" },
    { label: lang === "ru" ? "Доставка и Оплата" : "Доставка та Оплата", href: "/delivery" },
    { label: lang === "ru" ? "Франшиза" : "Франшиза", href: "https://f.myastoriya.ua/" },
    { label: lang === "ru" ? "Контакты" : "Контакти", href: "/contacts" },
];

import { useIsHydrated } from "@/hooks/useIsHydrated";

export default function TopBar({ lang }: TopBarProps) {
    const { isAuthenticated, isGuest, user } = useAppSelector((state) => state.auth);
    const hydrated = useIsHydrated();
    const isReallyLoggedIn = hydrated && isAuthenticated && !isGuest;
    const navItems = getTopNavItems(lang);

    return (
        <nav className={s.secondaryNav}>
            <div className={s.secondaryInner}>
                <div className={s.leftSection}>

                    <div className={s.navLinks}>
                        {navItems.map((item, i) => {
                            const isExternal = item.href.startsWith("http");
                            return (
                                <AppLink 
                                    key={i} 
                                    href={item.href} 
                                    className={s.navLink}
                                    activeClassName={s.active}
                                    target={isExternal ? "_blank" : undefined}
                                    rel={isExternal ? "noopener noreferrer" : undefined}
                                >
                                    {item.label}
                                </AppLink>
                            );
                        })}
                    </div>
                </div>

                <div className={s.navRight}>
                    {isReallyLoggedIn && <PointsInfo points={user?.bonuses || 0} lang={lang} />}
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