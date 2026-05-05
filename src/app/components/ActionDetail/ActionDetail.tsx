"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import s from './ActionDetail.module.scss';
import ProductCard from '../ui/ProductCard/ProductCard';
import Breadcrumbs from '../ui/Breadcrumbs/Breadcrumbs';
import CountdownTimer from '../ui/CountdownTimer/CountdownTimer';
import { type Dictionary } from '@/i18n/types';
import { type Sale, type Product, resolveProductImageUrl } from '@/lib/graphql';

const PAGE_SIZE = 12;

interface ActionDetailProps {
    dict: Dictionary;
    lang: string;
    id: string;
    pageType?: 'promotions' | 'complex-discounts';
    sale?: Sale | null;
    initialProducts?: Product[];
    initialHasMore?: boolean;
}

export default function ActionDetail({ 
    dict, 
    lang, 
    id, 
    pageType = 'promotions',
    sale,
    initialProducts = [],
    initialHasMore = false
}: ActionDetailProps) {
    const list = pageType === 'promotions' ? dict.home.actions.items : dict.home.discounts.items;
    const parsedId = Number(id);
    const baseId = isNaN(parsedId) ? 1 : (parsedId > 1000 ? parsedId % 1000 : parsedId);
    const safeBaseId = baseId === 0 ? 1 : baseId;

    let mockItem = list?.find((i) => i.id === safeBaseId);
    if (!mockItem && list?.length > 0 && !sale) {
        mockItem = list[0];
    }

    const title = sale ? (sale.title || sale.name) : (mockItem ? mockItem.title : 'Акція');
    
    // Format date from Sale
    let endDate = '30.11.2026';
    if (sale?.expiresAt) {
        try {
            endDate = new Date(sale.expiresAt).toLocaleDateString('uk-UA');
        } catch (e) {
            endDate = sale.expiresAt;
        }
    } else if (mockItem) {
        endDate = ('date' in mockItem ? mockItem.date : ('dateRange' in mockItem ? mockItem.dateRange : '30.11.2026')) ?? '30.11.2026';
    }

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

    const [products, setProducts] = useState<Product[]>((sale ? initialProducts : dict.home.products.items) as any);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sale || !hasMore || loading) return;

        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting) {
                    setLoading(true);
                    try {
                        const nextPage = page + 1;
                        const res = await fetch("/api/products", {
                            method: "POST",
                            headers: { 
                                "Content-Type": "application/json",
                                "Content-Language": lang === "ru" ? "ru_RU" : "uk_UA"
                            },
                            body: JSON.stringify({ page: nextPage, saleId: parseInt(sale.id), limit: PAGE_SIZE }),
                        });
                        const data = await res.json();
                        if (data.items?.length) {
                            setProducts((prev) => [...prev, ...data.items]);
                            setHasMore(data.hasMore);
                            setPage(nextPage);
                        } else {
                            setHasMore(false);
                        }
                    } catch (e) {
                        console.error("Failed to load more products for sale:", e);
                    } finally {
                        setLoading(false);
                    }
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loading, page, sale, lang]);

    const descriptionHtml = sale?.text || sale?.description || (mockItem ? `<p>Щовівторка даруємо 20% знижки на всі стейки з нашого гриль меню.</p>` : '');
    const bannerImage = sale?.banner?.size2x || sale?.image?.size2x;

    return (
        <section className={s.section}>
            <Breadcrumbs items={breadcrumbItems} className={s.breadcrumbsWrapper} />

            {/* Hero banner */}
            <div className={s.heroWrapper}>
                <div className={s.heroImageWrapper}>
                    {bannerImage ? (
                        <Image
                            src={bannerImage}
                            alt={title}
                            fill
                            className={s.heroImage}
                            priority
                        />
                    ) : (
                        <div className={s.placeholder}>
                            <Image
                                src="/icons/logo-red.svg"
                                alt="Myastoriya"
                                width={180}
                                height={60}
                                className={s.placeholderLogo}
                            />
                        </div>
                    )}
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
                <div className={s.description} dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
            </div>

            {/* Products section */}
            <div className={s.productsSection}>
                <div className={s.productsGrid}>
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            slug={product.slug}
                            title={sale ? product.name : (product as any).title}
                            weight={sale ? (product.unit ?? "") : (product as any).weight}
                            price={sale ? product.cost : (product as any).price}
                            unit={sale ? (product.unit ?? "") : (product as any).unit}
                            badge={sale ? (product.is_new ? "NEW" : null) : (product as any).badge}
                            image={sale ? resolveProductImageUrl(product) : (product as any).image}
                            lang={lang} 
                        />
                    ))}
                </div>
                {(hasMore || loading) && <div ref={sentinelRef} className={s.sentinel} aria-hidden="true" />}
            </div>
        </section>
    );
}
