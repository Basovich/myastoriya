import { useEffect } from "react";
import Link from "next/link";
import AppLink from "@/app/components/ui/AppLink/AppLink";
import Image from "next/image";
import { useTransition, animated } from "react-spring";
import s from "./MobileMenu.module.scss";
import { type Locale } from "@/i18n/config";
import { getLocalizedHref } from "@/utils/i18n-helpers";
import Logo from "@/app/components/Header/Shared/Logo";
import siteData from "@/content/site.json";
import { usePathname } from "next/navigation";
import { useToggleOpenWithAnimation } from "@/hooks/useToggleOpenWithAnimation";
import CitySelector from "@/app/components/Header/DesktopHeader/MainBar/CitySelector";
import { useHasBlogs } from "@/hooks/useHasBlogs";
import { ProductCategory } from "@/lib/graphql/queries/products";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Locale;
    categories: ProductCategory[];
}

export default function MobileMenu({ isOpen, onClose, lang, categories }: MobileMenuProps) {
    const hasBlogs = useHasBlogs(lang);
    const navItems = [...siteData.navigation];

    if (hasBlogs) {
        // Insert Blog after Actions
        navItems.splice(2, 0, { label: "Блог", href: "/blog" });
    }
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
                    <Logo lang={lang} className={s.logo} />
                    <div className={s.langSwitch}>
                        <Link href={getSwitchLangHref('ua')} className={lang === 'ua' ? s.active : ''}>UKR</Link>
                        <Link href={getSwitchLangHref('ru')} className={lang === 'ru' ? s.active : ''}>RUS</Link>
                    </div>
                </div>

                <div className={s.infoRow}>
                    <CitySelector renderPrompt={false} lang={lang} />
                    <a href={`tel:${siteData.contact.phone}`} className={s.phone}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        {siteData.contact.phone}
                    </a>
                </div>
            </div>

            {/* Scrollable content area */}
            <div className={s.menuBody}>
                {/* Catalog Header */}
                <div className={s.catalogHeader} onClick={(e) => {
                    toggleCatalog();
                }}>
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
                        {(categories.length <= 3 && categories.every(c => c.children && c.children.length > 0)
                            ? categories.flatMap(root => root.children || [])
                            : categories
                        ).map((cat) => (
                            <AppLink 
                                key={cat.id} 
                                href={`/catalog/${cat.slug}`} 
                                className={s.categoryItem} 
                                onClick={onClose}
                            >
                                <div className={s.iconWrapper}>
                                    {cat.image?.big1x ? (
                                        <Image
                                            src={cat.image.big1x}
                                            alt=""
                                            width={24}
                                            height={24}
                                            className={s.catIcon}
                                        />
                                    ) : (
                                        <Image
                                            src="/icons/icon-category.svg"
                                            alt=""
                                            width={24}
                                            height={24}
                                            className={s.catIcon}
                                        />
                                    )}
                                </div>
                                {cat.name}
                            </AppLink>
                        ))}
                    </div>
                </AnimatedDiv>

                <div className={s.menuFooter}>
                    <nav className={s.footerLinks}>
                        {navItems.map((item, i) => {
                            const isPlaceholder = item.href === "#";
                            const href = isPlaceholder ? "#" : item.href;
                            
                            return (
                                <AppLink
                                    key={i}
                                    href={href}
                                    className={s.footerLink}
                                    activeClassName={s.active}
                                    onClick={!isPlaceholder ? onClose : undefined}
                                    target={href.startsWith("http") ? "_blank" : undefined}
                                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                                >
                                    {item.label}
                                </AppLink>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </animated.div>
    ) : null);
}
