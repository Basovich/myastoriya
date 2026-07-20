"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import s from './ActionDetail.module.scss';
import ProductCard from '../ui/ProductCard/ProductCard';
import Breadcrumbs from '../ui/Breadcrumbs/Breadcrumbs';
import CountdownTimer from '../ui/CountdownTimer/CountdownTimer';
import { type Sale, type Product, resolveProductImageUrl, getProductsApi, getProductWeight, getProductBadge } from '@/lib/graphql';
import { useAppSelector } from '@/store/hooks';

const PAGE_SIZE = 12;

const LOCALIZED_TEXTS = {
    ua: {
        promotions: {
            breadcrumbs: {
                home: "Головна",
                promotions: "Акції"
            },
            countdown: {
                label: "До кінця акції залишилось:",
                days: "Днів",
                hours: "Годин",
                minutes: "Хвилин",
                seconds: "Секунд"
            },
            noProducts: "Товари для цієї акції відсутні у вашому місті"
        },
        "complex-discounts": {
            breadcrumbs: {
                home: "Головна",
                complexDiscounts: "Комплексні знижки"
            },
            countdown: {
                label: "До кінця акції залишилось:",
                days: "Днів",
                hours: "Годин",
                minutes: "Хвилин",
                seconds: "Секунд"
            },
            noProducts: "Товари для цієї акції відсутні у вашому місті"
        }
    },
    ru: {
        promotions: {
            breadcrumbs: {
                home: "Главная",
                promotions: "Акции"
            },
            countdown: {
                label: "До окончания акции осталось:",
                days: "Дней",
                hours: "Часов",
                minutes: "Минут",
                seconds: "Секунд"
            },
            noProducts: "Товары для этой акции отсутствуют в вашем городе"
        },
        "complex-discounts": {
            breadcrumbs: {
                home: "Главная",
                complexDiscounts: "Комплексные скидки"
            },
            countdown: {
                label: "До окончания акции осталось:",
                days: "Дней",
                hours: "Часов",
                minutes: "Минут",
                seconds: "Секунд"
            },
            noProducts: "Товары для этой акции отсутствуют в вашем городе"
        }
    }
};

interface ActionDetailProps {
    lang: string;
    id: string;
    pageType?: 'promotions' | 'complex-discounts';
    sale: Sale;
    initialProducts?: Product[];
    initialHasMore?: boolean;
}

export default function ActionDetail({
    lang,
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

    const currentLoc = LOCALIZED_TEXTS[lang === 'ru' ? 'ru' : 'ua'];
    const breadcrumbItems = [
        { label: currentLoc[pageType].breadcrumbs.home, href: '/' },
        {
            label: pageType === 'promotions'
                ? currentLoc.promotions.breadcrumbs.promotions
                : currentLoc['complex-discounts'].breadcrumbs.complexDiscounts,
            href: pageType === 'promotions' ? '/actions' : '/complex-discounts',
        },
        { label: title },
    ];

    const countdown = currentLoc[pageType].countdown;

    const token = useAppSelector((state) => state.auth.token) ?? undefined;
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
                        const data = await getProductsApi(
                            { saleId: parseInt(sale.id), limit: PAGE_SIZE, page: nextPage },
                            lang,
                            token,
                        );
                        if (data.data?.length) {
                            setProducts((prev) => [...prev, ...data.data]);
                            setHasMore(data.has_more_pages);
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
    }, [hasMore, loading, page, sale.id, lang, token]);


    const bannerDesktop = sale.bannerWeb?.desktop;
    const bannerLaptop = sale.bannerWeb?.laptop;
    const bannerTablet = sale.bannerWeb?.tablet;
    const bannerDefault = sale.banner?.size2x || sale.banner?.size1x || null;

    // Rich HTML description from the backend
    const descriptionHtml = sale.text || sale.description || '';

    return (
        <section className={s.section}>
            <Breadcrumbs items={breadcrumbItems} className={s.breadcrumbsWrapper} />

            {/* Hero banner */}
            <div className={s.heroWrapper}>
                <div className={s.heroImageWrapper}>
                    {bannerDefault || bannerDesktop || bannerLaptop || bannerTablet ? (
                        sale.bannerWeb ? (
                            <picture className={s.heroPicture}>
                                {sale.bannerWeb.desktop && <source media="(min-width: 1280px)" srcSet={sale.bannerWeb.desktop} />}
                                {sale.bannerWeb.laptop && <source media="(min-width: 1024px)" srcSet={sale.bannerWeb.laptop} />}
                                {sale.bannerWeb.tablet && <source media="(min-width: 768px)" srcSet={sale.bannerWeb.tablet} />}
                                <img
                                    src={bannerDefault || sale.bannerWeb.desktop || sale.bannerWeb.laptop || sale.bannerWeb.tablet || undefined}
                                    alt={title}
                                    className={s.heroImage}
                                />
                            </picture>
                        ) : (
                            <Image
                                src={bannerDefault!}
                                alt={title}
                                fill
                                className={s.heroImage}
                                priority
                            />
                        )
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
                            label={countdown.label}
                            labelDays={countdown.days}
                            labelHours={countdown.hours}
                            labelMinutes={countdown.minutes}
                            labelSeconds={countdown.seconds}
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
                                categoryId={product.categoryId}
                                title={product.name}
                                weight={getProductWeight(product)}
                                price={product.cost}
                                oldPrice={product.oldCost ?? undefined}
                                unit={product.unit ?? ''}
                                badge={getProductBadge(product, lang)}
                                image={resolveProductImageUrl(product)}
                                lang={lang}
                                hasCostVariants={product.hasCostVariants}
                                portionSize={product.portionSize}
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
