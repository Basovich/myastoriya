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
    sale: Sale;
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
    initialHasMore = false,
}: ActionDetailProps) {
    const title = sale.title || sale.name;

    // Format expiry date
    let endDate = '';
    if (sale.expiresAt) {
        try {
            endDate = new Date(sale.expiresAt).toLocaleDateString(
                lang === 'ru' ? 'ru-RU' : 'uk-UA',
            );
        } catch {
            endDate = sale.expiresAt;
        }
    }

    const breadcrumbItems = [
        { label: dict.home.actionsPage.breadcrumbs.home, href: '/' },
        {
            label: pageType === 'promotions'
                ? dict.home.actionsPage.breadcrumbs.promotions
                : dict.home.complexDiscountsPage.breadcrumbs.complexDiscounts,
            href: pageType === 'promotions' ? '/actions' : '/complex-discounts',
        },
        { label: title },
    ];

    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!hasMore || loading) return;

        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting) {
                    setLoading(true);
                    try {
                        const nextPage = page + 1;
                        const res = await fetch('/api/products', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Content-Language': lang === 'ru' ? 'ru_RU' : 'uk_UA',
                            },
                            body: JSON.stringify({
                                page: nextPage,
                                saleId: parseInt(sale.id),
                                limit: PAGE_SIZE,
                            }),
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
                        console.error('Failed to load more products for sale:', e);
                    } finally {
                        setLoading(false);
                    }
                }
            },
            { threshold: 0.1 },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loading, page, sale.id, lang]);

    // Use ONLY the banner field for the hero — `image` is the card thumbnail, wrong aspect ratio.
    // If no banner → show placeholder (black bg + red logo).
    const bannerImage =
        sale.banner?.size2x ||
        sale.banner?.size1x ||
        null;

    // Rich HTML description from the backend
    const descriptionHtml = sale.text || sale.description || '';

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

                {endDate && (
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
                )}
            </div>

            {/* Title + description */}
            <div className={s.contentLayout}>
                <h1 className={s.title}>{title}</h1>
                {descriptionHtml && (
                    <div
                        className={s.description}
                        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                    />
                )}
            </div>

            {/* Products section */}
            {products.length > 0 && (
                <div className={s.productsSection}>
                    <div className={s.productsGrid}>
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                slug={product.slug}
                                title={product.name}
                                weight={product.unit ?? ''}
                                price={product.cost}
                                unit={product.unit ?? ''}
                                badge={product.is_new ? 'NEW' : null}
                                image={resolveProductImageUrl(product)}
                                lang={lang}
                            />
                        ))}
                    </div>
                    {(hasMore || loading) && (
                        <div ref={sentinelRef} className={s.sentinel} aria-hidden="true" />
                    )}
                </div>
            )}
        </section>
    );
}
