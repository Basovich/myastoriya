import React from 'react';
import s from './StoreMenuHero.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Locale } from '@/i18n/config';
import clsx from 'clsx';

interface StoreMenuHeroProps {
    lang: string;
    logoSrc?: string;
}

const StoreMenuHero: React.FC<StoreMenuHeroProps> = ({ lang, logoSrc = '/images/logo-white.svg' }) => {
    const params = useParams();
    const menuSlug = (params?.menuSlug as string) || '';
    const currentLang = (params?.lang as string) || lang || 'ua';

    return (
        <section className={s.wrapper}>
            <Image
                src="/images/store/menu_hero.png"
                alt="Store Menu Hero"
                fill
                priority
                className={s.bgImage}
            />
            <div className={s.mask}></div>
            <div className={s.content}>
                <div className={s.logoWrapper}>
                    <Image src={logoSrc} alt="Logo" width={280} height={93} className={s.logo} />
                </div>
                {menuSlug && (
                    <div className={s.flags}>
                        <Link 
                            href={`/ua/menu/${menuSlug}`}
                            className={clsx(s.flagLink, currentLang === 'ua' && s.activeFlag)}
                            aria-label="Українська версія меню"
                        >
                            <Image src="/icons/flags/flag_ua.webp" alt="UA" width={32} height={20} />
                        </Link>
                        <Link 
                            href={`/en/menu/${menuSlug}`}
                            className={clsx(s.flagLink, currentLang === 'en' && s.activeFlag)}
                            aria-label="English menu version"
                        >
                            <Image src="/icons/flags/flag_en.webp" alt="EN" width={32} height={20} />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default StoreMenuHero;
