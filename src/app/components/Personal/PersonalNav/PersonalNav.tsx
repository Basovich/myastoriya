import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Locale } from '@/i18n/config';
import clsx from 'clsx';
import s from './PersonalNav.module.scss';
import Button from '@/app/components/ui/Button/Button';
import { AuthUser } from '@/store/slices/authSlice';

interface PersonalNavProps {
    lang: Locale;
    dict: {
        personalData: string;
        orderHistory: string;
        myReviews: string;
        loyalty: string;
        wishlist: string;
        shoppingList: string;
        deliveryAddresses: string;
        bankCards: string;
        pickupPoints: string;
        changePassword: string;
        logout: string;
    };
    onLogout: () => void;
    user: AuthUser | null;
}

export default function PersonalNav({ lang, dict, onLogout, user }: PersonalNavProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const baseHref = lang === 'ua' ? '' : `/${lang}`;

    const menuItems = [
        { href: `${baseHref}/personal/profile`, label: dict.personalData, icon: 'profile' },
        { href: `${baseHref}/personal/orders`, label: dict.orderHistory, icon: 'orders' },
        { href: `${baseHref}/personal/reviews`, label: dict.myReviews, icon: 'reviews' },
        { href: `${baseHref}/personal/loyalty`, label: dict.loyalty, icon: 'loyalty' },
        { href: `${baseHref}/personal/wishlist`, label: dict.wishlist, icon: 'wishlist' },
        { href: `${baseHref}/personal/shopping-list`, label: dict.shoppingList, icon: 'shopping-list' },
        { href: `${baseHref}/personal/addresses`, label: dict.deliveryAddresses, icon: 'addresses' },
        { href: `${baseHref}/personal/cards`, label: dict.bankCards, icon: 'cards' },
        { href: `${baseHref}/personal/pickup`, label: dict.pickupPoints, icon: 'pickup' },
        { href: `${baseHref}/personal/change-password`, label: dict.changePassword, icon: 'password' },
    ];

    const activeItem = menuItems.find(item => pathname.includes(item.href)) || menuItems[0];

    const renderIcon = (type: string, isActive: boolean) => {
        const color = isActive ? '#E30613' : '#000000';
        switch (type) {
            case 'profile':
                return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 17C17 14.2386 13.866 12 10 12C6.13401 12 3 14.2386 3 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
            case 'orders':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 6H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
            case 'reviews':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
            case 'loyalty':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="2"/><line x1="2" y1="10" x2="22" y2="10" stroke={color} strokeWidth="2"/></svg>;
            case 'wishlist':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.1917 3.5783 3.16 4.61C2.1283 5.6417 1.54871 7.04096 1.54871 8.5C1.54871 9.95904 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.93796 22.4518 9.22252 22.4518 8.5C22.4518 7.77748 22.3095 7.06204 22.0329 6.39464C21.7563 5.72723 21.351 5.12077 20.84 4.61Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
            case 'shopping-list':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 11H15M9 15H13M9 7H15M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
            case 'addresses':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
            case 'cards':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke={color} strokeWidth="2"/><line x1="1" y1="10" x2="23" y2="10" stroke={color} strokeWidth="2"/></svg>;
            case 'pickup':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="1" y="3" width="15" height="13" stroke={color} strokeWidth="2"/><polyline points="16 8 20 8 23 11 23 16 16 16"/><circle cx="5.5" cy="18.5" r="2.5" stroke={color} strokeWidth="2"/><circle cx="18.5" cy="18.5" r="2.5" stroke={color} strokeWidth="2"/></svg>;
            case 'password':
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth="2"/><path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
            default:
                return null;
        }
    };

    const handleLinkClick = () => {
        setIsOpen(false);
    };

    const userName = user ? `${user.name} ${user.surname || ''}` : 'Anton Antonenko';

    const renderNavContent = () => (
        <>
            {/* User Profile Card */}
            <div className={s.userCard}>
                <div className={s.avatarWrapper}>
                    <div className={s.avatar}>
                        <svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.6594 0C20.9941 0 25.1692 4.29099 25.1692 9.50975C25.1692 14.7285 20.9941 19.0195 15.6594 19.0195C10.4406 19.0195 6.26562 14.7285 6.26562 9.50975C6.26562 4.29099 10.4406 0 15.6594 0ZM15.6594 1.97153C11.6004 1.97153 8.12119 5.33474 8.12119 9.50975C8.12119 13.6848 11.6004 17.048 15.6594 17.048C19.8344 17.048 23.1976 13.6848 23.1976 9.50975C23.1976 5.33474 19.8344 1.97153 15.6594 1.97153Z" fill="#060606"/>
                            <path d="M15.6563 21.918C17.048 21.918 17.048 23.8896 15.6563 23.8896C13.3368 23.8896 10.9014 23.3097 8.81392 22.15C4.87085 24.4694 2.31945 28.5285 1.97153 33.0514H29.457C29.1091 28.2965 26.3258 24.1215 22.1508 21.918C20.991 21.3382 21.9188 19.5986 23.0785 20.1784C28.1813 22.8458 31.4286 28.1805 31.4286 33.9792C31.4286 34.559 30.9647 35.0229 30.3848 35.0229H1.04375C0.46389 35.0229 0 34.559 0 34.0951C0 28.4125 3.01529 23.1937 8.00211 20.4104C8.35003 20.1784 8.81392 19.8305 9.27781 20.1784C11.2493 21.3382 13.4528 21.918 15.6563 21.918Z" fill="#060606"/>
                        </svg>
                    </div>
                    <div className={s.cameraBadge}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 14" fill="none">
                            <path d="M6.08844 1.55556L4.53289 3.11111H1.55556V12.4444H14V3.11111H11.0227L9.46711 1.55556H6.08844ZM5.44444 0H10.1111L11.6667 1.55556H14.7778C14.9841 1.55556 15.1819 1.6375 15.3278 1.78336C15.4736 1.92922 15.5556 2.12705 15.5556 2.33333V13.2222C15.5556 13.4285 15.4736 13.6263 15.3278 13.7722C15.1819 13.9181 14.9841 14 14.7778 14H0.777778C0.571498 14 0.373667 13.9181 0.227806 13.7722C0.0819442 13.6263 0 13.4285 0 13.2222V2.33333C0 2.12705 0.0819442 1.92922 0.227806 1.78336C0.373667 1.6375 0.571498 1.55556 0.777778 1.55556H3.88889L5.44444 0ZM7.77778 11.6667C6.64324 11.6667 5.55517 11.216 4.75293 10.4137C3.95069 9.6115 3.5 8.52343 3.5 7.38889C3.5 6.25435 3.95069 5.16628 4.75293 4.36404C5.55517 3.5618 6.64324 3.11111 7.77778 3.11111C8.91232 3.11111 10.0004 3.5618 10.8026 4.36404C11.6049 5.16628 12.0556 6.25435 12.0556 7.38889C12.0556 8.52343 11.6049 9.6115 10.8026 10.4137C10.0004 11.216 8.91232 11.6667 7.77778 11.6667ZM7.77778 10.1111C8.49976 10.1111 9.19216 9.82431 9.70268 9.31379C10.2132 8.80328 10.5 8.11087 10.5 7.38889C10.5 6.66691 10.2132 5.9745 9.70268 5.46399C9.19216 4.95347 8.49976 4.66667 7.77778 4.66667C7.0558 4.66667 6.36339 4.95347 5.85288 5.46399C5.34236 5.9745 5.05556 6.66691 5.05556 7.38889C5.05556 8.11087 5.34236 8.80328 5.85288 9.31379C6.36339 9.82431 7.0558 10.1111 7.77778 10.1111Z" fill="#060606"/>
                        </svg>
                    </div>
                </div>
                <h3 className={s.userName}>{userName}</h3>
            </div>

            {/* Navigation Links Card */}
            <nav className={s.navCard}>
                {menuItems.map((item, index) => {
                    const isActive = pathname.includes(item.href);
                    return (
                        <React.Fragment key={item.href}>
                            <Link
                                href={item.href}
                                className={clsx(s.navItem, isActive && s.active)}
                                onClick={handleLinkClick}
                            >
                                <span className={s.linkIcon}>{renderIcon(item.icon, isActive)}</span>
                                <span className={s.linkLabel}>{item.label}</span>
                            </Link>
                            {(index === 3 || index === 5) && <div className={s.separator} />}
                        </React.Fragment>
                    );
                })}
            </nav>
        </>
    );

    return (
        <div className={s.personalNav}>
            {/* Desktop View (Standard Sidebar) */}
            <div className={s.desktopSidebar}>
                {renderNavContent()}
            </div>

            {/* Mobile View (Trigger + Modal) */}
            <Button 
                variant="black" 
                className={s.mobileTrigger} 
                onClick={() => setIsOpen(true)}
            >
                <div className={s.triggerContent}>
                    <div className={s.iconUser} />
                    <span className={s.activeLabel}>{activeItem.label}</span>
                    <div className={s.burgerIcon}>
                        <span />
                        <span />
                        <span />
                    </div>
                </div>
            </Button>

            {/* Mobile Menu Modal */}
            {isOpen && (
                <div className={s.mobileMenuOverlay}>
                    <div className={s.backdrop} onClick={() => setIsOpen(false)} />
                    
                    <button className={s.closeBtn} onClick={() => setIsOpen(false)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>

                    <div className={s.modalWrapper}>
                        {renderNavContent()}
                    </div>
                </div>
            )}
        </div>
    );
}
