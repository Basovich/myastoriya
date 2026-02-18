import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTransition, config, animated } from "react-spring";
import s from "./MobileMenu.module.scss";
import { type Locale } from "@/i18n/config";
import { getLocalizedHref } from "@/utils/i18n-helpers";
import siteData from "@/content/site.json";
import categoriesData from "@/content/categories.json";
import { usePathname } from "next/navigation";
import { useToggleOpenWithAnimation } from "@/hooks/useToggleOpenWithAnimation";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Locale;
}

export default function MobileMenu({ isOpen, onClose, lang }: MobileMenuProps) {
    // Menu Transition (Slide In/Out)
    const menuTransition = useTransition(isOpen, {
        from: { transform: "translateX(-100%)" },
        enter: { transform: "translateX(0%)" },
        leave: { transform: "translateX(-100%)" },
        config: { tension: 280, friction: 30 }
    });

    // Accordion Logic using Custom Hook
    const {
        isOpen: isCatalogOpen,
        handleClick: toggleCatalog,
        animated: animatedAccordion,
        style: accordionStyle,
        ref: catalogListRef
    } = useToggleOpenWithAnimation();

    // Rename for clarity in JSX
    const AnimatedDiv = animatedAccordion.div;

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Language switcher logic
    const pathname = usePathname();
    const getSwitchLangHref = (targetLang: Locale) => {
        if (!pathname) return "/";
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length > 0 && (segments[0] === 'ua' || segments[0] === 'ru')) {
            segments.shift();
        }
        const cleanPath = '/' + segments.join('/');
        return getLocalizedHref(cleanPath, targetLang);
    };

    return menuTransition((style, item) => item ? (
        <animated.div className={s.mobileMenu} style={style}>
            {/* Header */}
            <div className={s.menuHeader}>
                <div className={s.topRow}>
                    <button onClick={onClose} className={s.closeBtn} aria-label="Закрити">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                    <Image src="/images/logo-white.svg" alt="М'ясторія" width={114} height={33} className={s.logo} />
                    <div className={s.langSwitch}>
                        <Link href={getSwitchLangHref('ua')} className={lang === 'ua' ? s.active : ''}>UKR</Link>
                        <Link href={getSwitchLangHref('ru')} className={lang === 'ru' ? s.active : ''}>RUS</Link>
                    </div>
                </div>

                <div className={s.infoRow}>
                    <div className={s.citySelector}>
                        <span className={s.cityLabel}>Ваше місто</span>
                        <div className={s.cityValue}>
                            Київ
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>
                    </div>
                    <a href={`tel:${siteData.contact.phone}`} className={s.phone}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        {siteData.contact.phone}
                    </a>
                </div>
            </div>

            {/* Catalog Header */}
            <div className={s.catalogHeader} onClick={toggleCatalog}>
                Каталог продукції
                <div className={s.iconWrapper} style={{ transform: isCatalogOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={s.catalogIcon}
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </div>

            {/* Categories List (Accordion) */}
            <AnimatedDiv style={accordionStyle} className={s.catalogListWrapper}>
                <div className={s.catalogList} ref={catalogListRef}>
                    {categoriesData.map((cat, i) => (
                        <Link key={i} href={getLocalizedHref(cat.href, lang)} className={s.categoryItem} onClick={onClose}>
                            <Image
                                src={`/icons/categories/${cat.icon}.svg`}
                                alt=""
                                width={24}
                                height={24}
                                className={s.catIcon}
                                onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                            {cat.label}
                        </Link>
                    ))}
                </div>
            </AnimatedDiv>

            {/* Footer */}
            <div className={s.menuFooter}>
                <nav className={s.footerLinks}>
                    {siteData.navigation.map((item, i) => (
                        <Link
                            key={i}
                            href={item.label === "Акції" ? getLocalizedHref(item.href, lang) : "#"}
                            className={s.footerLink}
                            onClick={item.label === "Акції" ? onClose : undefined}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </animated.div>
    ) : null);
}
