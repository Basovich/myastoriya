"use client";

import { useState } from "react";
import Image from "next/image";
import s from "./PromotionsGrid.module.scss";
import Button from "../ui/Button/Button";
import Container from "../ui/Container/Container";
import Breadcrumbs from "../ui/Breadcrumbs/Breadcrumbs";
import Tabs from "../ui/Tabs/Tabs";
import Icon from "../ui/Icon/Icon";
import AppLink from "../ui/AppLink/AppLink";
import HeroBanner from "../ui/HeroBanner/HeroBanner";
import { Locale } from "@/i18n/config";

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
    const twelveInitialItems = Array.from({ length: 12 }).map((_, i) => {
        const baseItem = initialItems[i % initialItems.length];
        return { ...baseItem, id: baseItem.id + i * 1000 };
    });

    const [items, setItems] = useState<PromotionItem[]>(twelveInitialItems);
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
            href: '/promotions',
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
            <Container>
                <HeroBanner
                    title={dict.title}
                    image={`/images/promotions/${pageType}-banner.png`}
                />

                <Breadcrumbs items={breadcrumbItems} />

                <Tabs tabs={tabItems} className={s.tabs} />

                <div className={s.grid}>
                    {items.map((item, idx) => (
                        <AppLink key={`${item.id}-${idx}`} href={`/${pageType}/${item.id}`} className={s.cardLink}>
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
                        </AppLink>
                    ))}
                </div>

                {hasMore && (
                    <div className={s.loadMoreWrapper}>
                        <Button variant="outline-black" onClick={loadMore}>
                            {dict.showBtn}
                            <Icon name="arrow-right" width={18} height={15} className={s.btnIcon} />
                        </Button>
                    </div>
                )}
            </Container>
        </section>
    );
}
