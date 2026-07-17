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
import AppLink from "@/app/components/ui/AppLink/AppLink";
import { siteData } from "@/config/site";
import { usePathname } from "next/navigation";

const getScrolledNavItems = (lang: Locale) => [
    { label: lang === "ru" ? "Заведения" : "Заклади", href: "/restaurants" },
    { label: lang === "ru" ? "Акции" : "Акції", href: "/actions" },
    { label: lang === "ru" ? "Доставка и Оплата" : "Доставка та Оплата", href: "/delivery" },
    { label: lang === "ru" ? "Блог" : "Блог", href: "/blog" },
    { label: lang === "ru" ? "Контакты" : "Контакти", href: "/contacts" },
];

import { ProductCategory } from "@/lib/graphql/queries/products";

interface MainBarProps {
    lang: Locale;
    isScrolled?: boolean;
    isMenuOpen?: boolean;
    onMenuToggle?: () => void;
    onMenuClose?: () => void;
    categories: ProductCategory[];
}

export default function MainBar({
    lang,
    isScrolled = false,
    isMenuOpen = false,
    onMenuToggle,
    onMenuClose,
    categories,
}: MainBarProps) {
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

і р         // Close catalog menu when pathname changes (adjust state during render)
    const [prevPathname, setPrevPathname] = useState(pathname);
    if (pathname !== prevPathname) {
        setPrevPathname(pathname);
        if (isCatalogOpen) {
            setIsCatalogOpen(false);
        }
    }

    // Close scrolled menu when clicking outside
    useEffect(() => {
        if (!isMenuOpen) return;
        const handleClick = (e: MouseEvent) => {
            const target = e.target as Node;
            const isInsideModal = target instanceof Element && !!target.closest('.ReactModalPortal');

            if (menuRef.current && !menuRef.current.contains(target) && !isInsideModal) {
                onMenuClose?.();
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [isMenuOpen, onMenuClose]);

    return (
        <div className={s.mainBar} ref={menuRef}>
            {/* Scrolled nav menu dropdown */}
            {isScrolled && (
                <div className={clsx(s.scrolledMenu, isMenuOpen && s.scrolledMenuOpen)}>
                    <div className={s.scrolledMenuInner}>
                        <div className={s.scrolledMenuLinks}>
                            {getScrolledNavItems(lang).map((item, i) => (
                                <AppLink
                                    key={i}
                                    href={item.href}
                                    className={s.scrolledMenuLink}
                                    onClick={onMenuClose}
                                >
                                    {item.label}
                                </AppLink>
                            ))}
                        </div>
                        <div className={s.scrolledMenuRight}>
                            <a
                                href={`tel:${siteData.contact.phone.replace(/\s+/g, '')}`}
                                className={s.scrolledMenuPhone}
                            >
                                {siteData.contact.phone}
                            </a>
                            <LanguageSwitch lang={lang} />
                        </div>
                    </div>
                </div>
            )}

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
                        <span className={s.catalogBtnInner}>{lang === "ru" ? "Каталог продукции" : "Каталог продукції"}</span>
                    </button>

                    <div className={s.searchWrapper}>
                        <Search lang={lang} categories={categories} />
                    </div>

                    <CitySelector lang={lang} />
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
                            aria-label={lang === "ru" ? "Меню" : "Меню"}
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
            <CatalogMenu isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} categories={categories} />
        </div>
    );
}
