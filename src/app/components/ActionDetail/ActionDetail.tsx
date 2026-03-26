"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import s from './ActionDetail.module.scss';
import ProductCard from '../ui/ProductCard/ProductCard';
import Breadcrumbs from '../ui/Breadcrumbs/Breadcrumbs';
import CountdownTimer from '../ui/CountdownTimer/CountdownTimer';
import { type Dictionary } from '@/i18n/types';

const PAGE_SIZE = 12;

interface ActionDetailProps {
    dict: Dictionary;
    lang: string;
    id: string;
    pageType?: 'promotions' | 'complex-discounts';
}

export default function ActionDetail({ dict, lang, id, pageType = 'promotions' }: ActionDetailProps) {
    const list = pageType === 'promotions' ? dict.home.actions.items : dict.home.discounts.items;
    const parsedId = Number(id);
    const baseId = isNaN(parsedId) ? 1 : (parsedId > 1000 ? parsedId % 1000 : parsedId);
    const safeBaseId = baseId === 0 ? 1 : baseId;

    let item = list?.find((i) => i.id === safeBaseId);
    if (!item && list?.length > 0) {
        item = list[0];
    }

    const title = item ? item.title : 'Steak Days щовівторка!';
    const endDate = (item && 'date' in item ? item.date : (item && 'dateRange' in item ? item.dateRange : '30.11.2026')) ?? '30.11.2026';

    const breadcrumbItems = [
        { label: dict.home.actionsPage.breadcrumbs.home, href: '/' },
        {
            label: pageType === 'promotions'
                ? dict.home.actionsPage.breadcrumbs.promotions
                : dict.home.complexDiscountsPage.breadcrumbs.complexDiscounts,
            href: pageType === 'promotions' ? '/actions' : '/complex-discounts'
        },
        { label: title }
    ];

    const allProducts = dict.home.products.items;
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && visibleCount < allProducts.length) {
                    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, allProducts.length));
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [visibleCount, allProducts.length]);

    const visibleProducts = allProducts.slice(0, visibleCount);

    return (
        <section className={s.section}>
            <Breadcrumbs items={breadcrumbItems} className={s.breadcrumbsWrapper} />

            {/* Hero banner */}
            <div className={s.heroWrapper}>
                <div className={s.heroImageWrapper}>
                    <Image
                        src="/images/promotions/promo-hero-bg2.png"
                        alt={title}
                        fill
                        className={s.heroImage}
                        priority
                    />
                </div>
                <div className={s.timerAnchor}>
                    <CountdownTimer
                        targetDate={endDate}
                        label="До кінця акції залишилось:"
                        labelDays="Днів"
                        labelHours="Годин"
                        labelMinutes="Хвилин"
                        labelSeconds="Секунди"
                    />
                </div>
            </div>

            {/* Title + description */}
            <div className={s.contentLayout}>
                <h1 className={s.title}>{title}</h1>
                <div className={s.description}>
                    <p>Щовівторка даруємо 20% знижки на всі стейки з нашого гриль меню.</p>
                    <p>Це чудова нагода скуштувати улюблений стейк сухої чи вологої витримки або стейк від Бренд Шефа за ще приємнішою ціною. Акція діє лише офлайн у ресторанах «М&apos;ясторія».</p>
                    <h3>Умови:</h3>
                    <ul>
                        <li>в акції беруть участь усі товари з категорій «Стейки від Бренд Шефа», «Стейки сухої витримки», «Стейки вологої витримки», а також позиції з категорії «М&apos;ясо на грилі»: Рібай су-від, Філе Міньйон су-від;</li>
                        <li>розмір знижки 20%;</li>
                        <li>Акція діє кожен вівторок з 05.08.2025 до 30.11.2025 (включно).</li>
                    </ul>
                </div>
            </div>

            {/* Products section */}
            <div className={s.productsSection}>
                <div className={s.productsGrid}>
                    {visibleProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            title={product.title}
                            weight={product.weight}
                            price={product.price}
                            unit={product.unit}
                            badge={product.badge}
                            image={product.image}
                        />
                    ))}
                </div>
                <div ref={sentinelRef} className={s.sentinel} aria-hidden="true" />
            </div>
        </section>
    );
}
