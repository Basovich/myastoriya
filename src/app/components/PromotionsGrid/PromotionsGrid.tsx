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
    date: string;
    discount: string | null;
}

interface PromotionsGridProps {
    dict: {
        title: string;
        breadcrumbs: {
            home: string;
            promotions: string;
        };
        tabs: {
            promotions: string;
            complexDiscounts: string;
        };
        showBtn: string;
    };
    initialItems: PromotionItem[];
    lang: string;
}

export default function PromotionsGrid({ dict, initialItems, lang }: PromotionsGridProps) {
    const [items, setItems] = useState<PromotionItem[]>(initialItems);
    const [hasMore, setHasMore] = useState(true);

    const loadMore = () => {
        // Mock loading 12 more items by duplicating the current initial list a few times
        const moreItems = [
            ...initialItems.map((item) => ({ ...item, id: item.id + 100 })),
            ...initialItems.map((item) => ({ ...item, id: item.id + 200 }))
        ];

        // Take exactly 12 items to append
        const newItemsToAppend = moreItems.slice(0, 12);

        setItems((prev) => [...prev, ...newItemsToAppend]);
        // Hide button after loading mock items
        setHasMore(false);
    };

    return (
        <section className={s.section}>
            <div className={s.container}>
                <div className={s.bannerWrapper}>
                    <Image src="/images/promotions/promotions-banner.png" alt={dict.title} fill priority style={{ objectFit: 'cover' }} className={s.bannerImg} />
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
                    <Link href={`/${lang}`}>{dict.breadcrumbs.home}</Link>
                    <span className={s.separator}>»</span>
                    <span className={s.current}>{dict.breadcrumbs.promotions}</span>
                </div>

                <div className={s.tabsWrapper}>
                    <div className={`${s.tab} ${s.activeTab}`}>{dict.tabs.promotions}</div>
                    <Link href={`/${lang}/complex-discounts`} className={s.tab}>{dict.tabs.complexDiscounts}</Link>
                </div>

                <div className={s.grid}>
                    {items.map((item, idx) => (
                        <Link key={`${item.id}-${idx}`} href={`/${lang}/promotions/${item.id}`} className={s.cardLink}>
                            <div className={s.card}>
                                <div className={s.cardImage}>
                                    <Image src={item.image} alt={item.title} fill className={s.cardImg} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                                    {item.discount && (
                                        <div className={s.discountBadge}>
                                            -{item.discount}%
                                        </div>
                                    )}
                                </div>
                                <div className={s.cardBody}>
                                    <span className={s.date}>Акція діє до: {item.date}</span>
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
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
