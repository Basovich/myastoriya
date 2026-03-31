'use client';

import React from 'react';
import s from './StoreMenuHero.module.scss';
import Image from 'next/image';
import { Locale } from '@/i18n/config';

interface StoreMenuHeroProps {
    lang: Locale;
    logoSrc?: string;
}

const StoreMenuHero: React.FC<StoreMenuHeroProps> = ({ lang, logoSrc = '/images/logo-white.svg' }) => {
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
            </div>
        </section>
    );
};

export default StoreMenuHero;
