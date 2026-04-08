import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import s from './PersonalNav.module.scss';
import { Locale } from '@/i18n/config';
import clsx from 'clsx';

interface PersonalNavProps {
    lang: Locale;
    dict: {
        personalData: string;
        orderHistory: string;
        wishlist: string;
        logout: string;
    };
    onLogout: () => void;
}

export default function PersonalNav({ lang, dict, onLogout }: PersonalNavProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { href: `/${lang}/personal/profile`, label: dict.personalData },
        { href: `/${lang}/personal/orders`, label: dict.orderHistory },
        { href: `/${lang}/personal/wishlist`, label: dict.wishlist },
    ];

    const activeItem = menuItems.find(item => pathname.includes(item.href)) || menuItems[0];

    return (
        <div className={s.personalNav}>
            <div className={s.currentSection} onClick={() => setIsOpen(!isOpen)}>
                <div className={s.activeLabel}>
                    <div className={s.iconUser} />
                    <span>{activeItem.label}</span>
                </div>
                <button className={clsx(s.burgerBtn, isOpen && s.open)}>
                    <span />
                    <span />
                    <span />
                </button>
            </div>

            {isOpen && (
                <div className={s.dropdown}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(s.menuLink, pathname.includes(item.href) && s.active)}
                            onClick={() => setIsOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <button onClick={onLogout} className={s.logoutBtn}>
                        {dict.logout}
                    </button>
                </div>
            )}
        </div>
    );
}
