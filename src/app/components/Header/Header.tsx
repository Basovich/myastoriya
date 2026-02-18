"use client";

import Image from "next/image";
import s from "./Header.module.scss";
import siteData from "@/content/site.json";

export default function Header() {
    return (
        <header className={s.header} id="header">
            {/* ========== DESKTOP: Secondary nav bar ========== */}
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

            {/* ========== Main header bar ========== */}
            <div className={s.mainBar}>
                <div className={s.mainBarInner}>
                    {/* MOBILE: Hamburger menu button */}
                    <button className={s.menuBtn} aria-label="Меню">
                        <img src="/icons/burger-grid.svg" alt="Menu" width="24" height="24" />
                    </button>

                    {/* Logo */}
                    <a href="/" className={s.logo}>
                        <Image
                            src="/images/logo-white.svg"
                            alt="М'ясторія"
                            width={114}
                            height={33}
                            className={s.logoImg}
                            priority
                        />
                    </a>

                    {/* DESKTOP: Catalog button */}
                    <a href="#categories" className={s.catalogBtn}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                        Каталог продукції
                    </a>

                    {/* DESKTOP: City selector */}
                    <div className={s.citySelector}>
                        <span className={s.cityLabel}>ВАШЕ МІСТО</span>
                        <span className={s.cityValue}>
                            Київ
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </span>
                    </div>

                    {/* Action icons */}
                    <div className={s.actions}>
                        {/* Cart */}
                        <button className={s.actionBtn} aria-label="Кошик">
                            <img src="/icons/icon-cart.svg" alt="Cart" width="20" height="20" />
                            <span className={s.badge}>3</span>
                        </button>

                        {/* Heart (Favorites) */}
                        <button className={s.actionBtn} aria-label="Обране">
                            <img src="/icons/icon-heart.svg" alt="Favorites" width="20" height="20" />
                            <span className={s.badge}>3</span>
                        </button>

                        {/* Profile */}
                        <button className={s.actionBtn} aria-label="Профіль">
                            <img src="/icons/icon-profile.svg" alt="Profile" width="16" height="18" />
                        </button>

                        {/* DESKTOP: Login link */}
                        <a href="#" className={s.loginLink}>Вхід</a>
                    </div>
                </div>
            </div>

            {/* MOBILE: Search bar below header */}
            <div className={s.searchBar}>
                <div className={s.searchInputWrapper}>
                    <svg className={s.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        className={s.searchInput}
                        placeholder="Я шукаю..."
                        readOnly
                    />
                    <button className={s.searchBtn}>ПОШУК</button>
                </div>
            </div>
        </header>
    );
}
