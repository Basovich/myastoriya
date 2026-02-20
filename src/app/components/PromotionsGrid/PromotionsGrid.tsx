"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "../ui/Button/Button";
import s from "./PromotionsGrid.module.scss";

// Reusing interfaces structurally
interface PromotionItem {
    id: number;
    title: string;
    image: string;
    date?: string;
    dateRange?: string;
    discount?: string | null;
}

interface PromotionsGridProps {
    dict: {
        title: string;
        breadcrumbs: {
            home: string;
            promotions?: string;
            complexDiscounts?: string;
        };
        tabs: {
            promotions: string;
            complexDiscounts: string;
        };
        showBtn: string;
    };
    initialItems: PromotionItem[];
    lang: string;
    pageType: 'promotions' | 'complex-discounts';
}

export default function PromotionsGrid({ dict, initialItems, lang, pageType }: PromotionsGridProps) {
    // Generate 12 mock initial items regardless of what was passed in
    const twelveInitialItems = Array.from({ length: 12 }).map((_, i) => {
        const baseItem = initialItems[i % initialItems.length];
        return { ...baseItem, id: baseItem.id + i * 1000 };
    });

    const [items, setItems] = useState<PromotionItem[]>(twelveInitialItems);
    const [hasMore, setHasMore] = useState(true);

    // Helper to conditionally drop '/ua'
    const getRoute = (path: string) => {
        const basePath = lang === 'ua' ? '' : `/${lang}`;
        const safePath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
        return `${basePath}${safePath}` || '/';
    };

    const loadMore = () => {
        // Load exactly 12 more mock items
        const moreItems = Array.from({ length: 12 }).map((_, i) => {
            const baseItem = initialItems[i % initialItems.length];
            // Use different IDs
            return { ...baseItem, id: baseItem.id + (i + 12) * 1000 };
        });

        setItems((prev) => [...prev, ...moreItems]);
        // Hide button after loading mock items
        setHasMore(false);
    };

    return (
        <section className={s.section}>
            <div className={s.container}>
                <div className={s.bannerWrapper}>
                    <Image src={`/images/promotions/${pageType}-banner.png`} alt={dict.title} fill priority style={{ objectFit: 'cover' }} className={s.bannerImg} />
                    <div className={s.bannerContent}>
                        <h1 className={s.bannerTitle}>{dict.title}</h1>
                        <div className={s.bannerDots}>
                            <span className={s.dot}></span>
                            <span className={s.dot}></span>
                            <span className={s.dot}></span>
                        </div>
                    </div>
                </div>

                <div className={s.breadcrumbs}>
                    <Link href={getRoute('/')}>{dict.breadcrumbs.home}</Link>
                    <span className={s.separator}>»</span>
                    <span className={s.current}>{pageType === 'promotions' ? dict.breadcrumbs.promotions : dict.breadcrumbs.complexDiscounts}</span>
                </div>

                <div className={s.tabsWrapper}>
                    {pageType === 'promotions' ? (
                        <>
                            <div className={`${s.tab} ${s.activeTab}`}>{dict.tabs.promotions}</div>
                            <Link href={getRoute('/complex-discounts')} className={s.tab}>{dict.tabs.complexDiscounts}</Link>
                        </>
                    ) : (
                        <>
                            <Link href={getRoute('/promotions')} className={s.tab}>{dict.tabs.promotions}</Link>
                            <div className={`${s.tab} ${s.activeTab}`}>{dict.tabs.complexDiscounts}</div>
                        </>
                    )}
                </div>

                <div className={s.grid}>
                    {items.map((item, idx) => (
                        <Link key={`${item.id}-${idx}`} href={getRoute(`/${pageType}/${item.id}`)} className={s.cardLink}>
                            <div className={s.card}>
                                <div className={s.cardImage}>
                                    <Image src={item.image} alt={item.title} fill className={s.cardImg} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                                </div>
                                <div className={s.cardBody}>
                                    <div className={s.date}>
                                        <span className={s.dateLabel}>
                                            {pageType === 'promotions' ? 'Акція діє до:' : 'Комплексна знижка діє:'}
                                        </span>
                                        {' '}
                                        <span className={s.dateValue}>
                                            {pageType === 'promotions' ? item.date || '' : (item.dateRange || item.date || '')}
                                        </span>
                                    </div>
                                    <h4 className={s.cardTitle}>{item.title}</h4>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {hasMore && (
                    <div className={s.loadMoreWrapper}>
                        <Button variant="outline-black" onClick={loadMore}>
                            {dict.showBtn}
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="15" viewBox="0 0 18 15" fill="none">
                                <path d="M9.98467 1.00019L16.3131 7.32861L9.98467 13.657" stroke="black" stroke-width="2" stroke-linecap="round" />
                                <line x1="15" y1="7.17139" x2="1" y2="7.17139" stroke="black" stroke-width="2" stroke-linecap="round" />
                            </svg>
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
