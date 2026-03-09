"use client";

import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import s from "./MainBar.module.scss";
import Logo from "@/app/components/Header/Shared/Logo";
import Actions from "@/app/components/Header/Shared/Actions";
import Search from "@/app/components/Header/DesktopHeader/MainBar/Search";
import CitySelector from "@/app/components/Header/DesktopHeader/MainBar/CitySelector";
import CatalogMenu from "@/app/components/Header/DesktopHeader/MainBar/CatalogMenu";
import LanguageSwitch from "@/app/components/Header/Shared/LanguageSwitch";
import { type Locale } from "@/i18n/config";
import Image from "next/image";
import Link from "next/link";
import { getLocalizedHref } from "@/utils/i18n-helpers";
import siteData from "@/content/site.json";

export const TOP_NAV_ITEMS = [
    { label: "Заклади", href: "/restaurants" },
    { label: "Акції", href: "/promotions" },
    { label: "Доставка та Оплата", href: "/delivery" },
    { label: "Блог", href: "/blog" },
    { label: "Франшиза", href: "/franchise" },
    { label: "Контакти", href: "/contacts" },
];

interface MainBarProps {
    lang: Locale;
    isScrolled?: boolean;
    isMenuOpen?: boolean;
    onMenuToggle?: () => void;
    onMenuClose?: () => void;
}

export default function MainBar({
    lang,
    isScrolled = false,
    isMenuOpen = false,
    onMenuToggle,
    onMenuClose,
}: MainBarProps) {
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close scrolled menu when clicking outside
    useEffect(() => {
        if (!isMenuOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onMenuClose?.();
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [isMenuOpen, onMenuClose]);

    return (
        <div className={s.mainBar} ref={menuRef}>
            <div className={s.mainBarInner}>
                <div className={s.logoWrapper}>
                    <Logo lang={lang} />
                </div>

                <div className={s.centerBlock}>
                    <button
                        onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                        className={clsx(s.catalogBtn, isCatalogOpen && s.active)}
                    >
                        {isCatalogOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="15" viewBox="0 0 26 15" fill="none">
                                <path d="M18.9851 13.6568L12.6566 7.32837L18.9851 0.999945" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                <path d="M6.32843 1.00019L12.6568 7.32861L6.32843 13.657" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        ) : (
                            <Image src="/icons/icon-category.svg" alt="Categories" width={18} height={18} />
                        )}
                        <span className={s.catalogBtnInner}>Каталог продукції</span>
                    </button>

                    <div className={s.searchWrapper}>
                        <Search lang={lang} />
                    </div>

                    <CitySelector />
                </div>

                <div className={s.rightSection}>
                    <div className={s.actionsWrapper}>
                        <Actions />
                    </div>

                    {/* Burger button — shown only when scrolled */}
                    {isScrolled && (
                        <button
                            className={clsx(s.burgerBtn, isMenuOpen && s.active)}
                            onClick={onMenuToggle}
                            aria-label="Меню"
                            aria-expanded={isMenuOpen}
                        >
                            <span className={s.burgerIcon}>
                                <span />
                                <span />
                                <span />
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Catalog dropdown */}
            <CatalogMenu isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />

            {/* Scrolled nav menu dropdown */}
            {isScrolled && (
                <div className={clsx(s.scrolledMenu, isMenuOpen && s.scrolledMenuOpen)}>
                    <div className={s.scrolledMenuInner}>
                        <div className={s.scrolledMenuLinks}>
                            {TOP_NAV_ITEMS.map((item, i) => (
                                <Link
                                    key={i}
                                    href={getLocalizedHref(item.href, lang)}
                                    className={s.scrolledMenuLink}
                                    onClick={onMenuClose}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                        <div className={s.scrolledMenuRight}>
                            <a
                                href={`tel:${siteData.contact.phone.replace(/\s+/g, '')}`}
                                className={s.scrolledMenuPhone}
                            >
                                <img src="/icons/icon-phone-outline.svg" alt="Phone" width={14} height={14} />
                                {siteData.contact.phone}
                            </a>
                            <LanguageSwitch lang={lang} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
