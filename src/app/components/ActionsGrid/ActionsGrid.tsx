"use client";

import { useState } from "react";
import Image from "next/image";
import s from "./ActionsGrid.module.scss";
import Button from "../ui/Button/Button";
import Breadcrumbs from "../ui/Breadcrumbs/Breadcrumbs";
import Tabs from "../ui/Tabs/Tabs";
import AppLink from "../ui/AppLink/AppLink";
import HeroBanner from "../ui/HeroBanner/HeroBanner";

interface ActionItem {
    id: number;
    title: string;
    image: string;
    date?: string;
    dateRange?: string;
    discount?: string | null;
}

interface ActionsGridProps {
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
    initialItems: ActionItem[];
    lang: string;
    pageType: 'promotions' | 'complex-discounts';
}

export default function ActionsGrid({ dict, initialItems, lang, pageType }: ActionsGridProps) {
    const twelveInitialItems = Array.from({ length: 12 }).map((_, i) => {
        const baseItem = initialItems[i % initialItems.length];
        return { ...baseItem, id: baseItem.id + i * 1000 };
    });

    const [items, setItems] = useState<ActionItem[]>(twelveInitialItems);
    const [hasMore, setHasMore] = useState(true);

    const loadMore = () => {
        const moreItems = Array.from({ length: 12 }).map((_, i) => {
            const baseItem = initialItems[i % initialItems.length];
            return { ...baseItem, id: baseItem.id + (i + 12) * 1000 };
        });

        setItems((prev) => [...prev, ...moreItems]);
        setHasMore(false);
    };

    const breadcrumbItems = [
        { label: dict.breadcrumbs.home, href: '/' },
        { label: pageType === 'promotions' ? dict.breadcrumbs.promotions! : dict.breadcrumbs.complexDiscounts! }
    ];

    const tabItems = [
        {
            id: 'promotions',
            label: dict.tabs.promotions,
            href: '/actions',
            active: pageType === 'promotions'
        },
        {
            id: 'complex-discounts',
            label: dict.tabs.complexDiscounts,
            href: '/complex-discounts',
            active: pageType === 'complex-discounts'
        }
    ];

    return (
        <section className={s.section}>
            <HeroBanner
                title={dict.title}
                image={`/images/promotions/${pageType}-banner.png`}
            />

            <Breadcrumbs items={breadcrumbItems} />

            <Tabs tabs={tabItems} className={s.tabs} classNameBtn={s.tabBtn} />

            <div className={s.grid}>
                {items.map((item, idx) => (
                    <AppLink key={`${item.id}-${idx}`} href={`/${pageType === 'promotions' ? 'actions' : pageType}/${item.id}`} className={s.cardLink}>
                        <div className={s.card}>
                            <div className={s.cardImage}>
                                <Image src={item.image}
                                       alt={item.title}
                                       className={s.cardImg}
                                       width={320}
                                       height={200}
                                />
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
                    </AppLink>
                ))}
            </div>

            {hasMore && (
                <div className={s.loadMoreWrapper}>
                    <Button variant="outline-black" onClick={loadMore} className={s.loadMoreBtn}>
                        <span className={s.loadMoreBtnText}>{dict.showBtn}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="15" viewBox="0 0 18 15" fill="none">
                            <path d="M9.98467 1.00019L16.3131 7.32861L9.98467 13.657" stroke="black" strokeWidth="2" strokeLinecap="round" />
                            <line x1="15" y1="7.17139" x2="1" y2="7.17139" stroke="black" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </Button>
                </div>
            )}
        </section>
    );
}
