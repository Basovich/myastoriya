"use client";

import { useState } from "react";
import s from "./Header.module.scss";
import siteData from "@/content/site.json";

export default function Header() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <header className={s.header} id="header">
            {/* Secondary nav bar — desktop only */}
            <nav className={s.secondaryNav}>
                <div className={s.secondaryInner}>
                    <div className={s.navLinks}>
                        {siteData.navigation.map((item, i) => (
                            <a key={i} href={item.href} className={s.navLink}>
                                {item.label}
                            </a>
                        ))}
                    </div>
                    <div className={s.navRight}>
                        <a href={`tel:${siteData.contact.phone}`} className={s.navPhone}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            {siteData.contact.phone}
                        </a>
                        <span className={s.langSwitch}>UKR</span>
                    </div>
                </div>
            </nav>

            {/* Main header bar */}
            <div className={s.mainBar}>
                <div className={s.mainBarInner}>
                    <button className={s.menuBtn} aria-label="Меню">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                    </button>

                    <a href="/" className={s.logo}>
                        <span className={s.logoIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-accent)">
                                <path d="M12 2C8.5 2 6 4.5 6 7.5c0 2 1 3.5 2.5 4.5L10 21h4l1.5-9C17 11 18 9.5 18 7.5 18 4.5 15.5 2 12 2z" />
                            </svg>
                        </span>
                        <span className={s.logoText}>М&apos;ЯСТОРІЯ</span>
                    </a>

                    {/* Desktop: catalog button */}
                    <a href="#categories" className={s.catalogBtn}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                        Каталог продукції
                    </a>

                    {/* Desktop: search inline */}
                    <div className={s.searchBarDesktop}>
                        <svg className={s.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            className={s.searchInput}
                            placeholder="Я шукаю..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className={s.searchBtn}>ПОШУК</button>
                    </div>

                    {/* Desktop: city selector */}
                    <div className={s.citySelector}>
                        <span className={s.cityLabel}>ВАШЕ МІСТО</span>
                        <span className={s.cityValue}>
                            Київ
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </span>
                    </div>

                    <div className={s.actions}>
                        <button className={s.actionBtn} aria-label="Кошик">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            <span className={s.badge}>0</span>
                        </button>
                        <button className={s.actionBtn} aria-label="Обране">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            <span className={s.badge}>0</span>
                        </button>
                        <button className={s.actionBtn} aria-label="Профіль">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                        </button>

                        {/* Desktop: login link */}
                        <a href="#" className={s.loginLink}>Вхід</a>
                    </div>
                </div>
            </div>

            {/* Mobile: search bar below */}
            <div className={s.searchBar}>
                <svg className={s.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    className={s.searchInput}
                    placeholder="Я шукаю..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className={s.searchBtn}>ПОШУК</button>
            </div>
        </header>
    );
}
