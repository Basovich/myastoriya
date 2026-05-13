"use client";

import { useState } from "react";
import Image from "next/image";
import s from "./ActionsGrid.module.scss";
import Button from "../ui/Button/Button";
import Breadcrumbs from "../ui/Breadcrumbs/Breadcrumbs";
import Tabs from "../ui/Tabs/Tabs";
import AppLink from "../ui/AppLink/AppLink";
import HeroBanner from "../ui/HeroBanner/HeroBanner";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { type Sale } from "@/lib/graphql";

interface ActionItem {
    id: number;
    slug?: string | null;
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
    initialHasMore?: boolean;
}

export default function ActionsGrid({ dict, initialItems, lang, pageType, initialHasMore }: ActionsGridProps) {
    const [items, setItems] = useState<ActionItem[]>(initialItems);
    const [hasMore, setHasMore] = useState(initialHasMore ?? true);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const loadMore = async () => {
        if (loading || !hasMore) return;
        
        if (pageType === 'complex-discounts') {
            setLoading(true);
            try {
                const nextPage = page + 1;
                const res = await fetch("/api/specials", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Language": lang === "ru" ? "ru_RU" : "uk_UA"
                    },
                    body: JSON.stringify({ page: nextPage, limit: 12 }),
                });
                const data = await res.json();

                if (data.data && data.data.length > 0) {
                    const newItems: ActionItem[] = data.data.map((special: any) => {
                        let image = special.image?.size2x || special.image?.size1x || "";
                        if (image && image.startsWith('/')) {
                            image = `https://dev-api.myastoriya.com.ua${image}`;
                        }
                        return {
                            id: parseInt(special.id),
                            slug: special.slug || special.id,
                            title: special.title || "",
                            image,
                            date: special.expiresAt
                                ? new Date(special.expiresAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uk-UA')
                                : "",
                            discount: special.amount ? `-${special.amount}%` : null
                        };
                    });

                    setItems(prev => [...prev, ...newItems]);
                    setHasMore(data.has_more_pages);
                    setPage(nextPage);
                } else {
                    setHasMore(false);
                }
            } catch (error) {
                console.error("Failed to load more specials:", error);
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        try {
            const nextPage = page + 1;
            const res = await fetch("/api/sales", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Content-Language": lang === "ru" ? "ru_RU" : "uk_UA"
                },
                body: JSON.stringify({ page: nextPage, limit: 12 }),
            });
            const data = await res.json();
            console.log("[ActionsGrid Debug] Response:", data);

            if (data.data && data.data.length > 0) {
                const newItems: ActionItem[] = data.data.map((sale: any) => ({
                    id: parseInt(sale.id),
                    title: sale.name,
                    slug: sale.slug || sale.id,
                    image: sale.image?.size2x || sale.image?.size1x || "",
                    date: sale.expiresAt || "",
                    discount: null
                }));

                setItems(prev => [...prev, ...newItems]);
                setHasMore(data.has_more_pages);
                setPage(nextPage);
                console.log("[ActionsGrid Debug] Added items:", newItems.length);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to load more actions:", error);
        } finally {
            setLoading(false);
        }
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
                {items.map((item, idx) => {
                    const identifier = item.slug || item.id;
                    const path = pageType === 'promotions' ? 'actions' : pageType;
                    return (
                        <AppLink key={`${item.id}-${idx}`} href={`/${path}/${identifier}`} className={s.cardLink}>
                        <div className={s.card}>
                            <div className={s.cardImage}>
                                {item.image ? (
                                    <Image src={item.image}
                                           alt={item.title}
                                           className={s.cardImg}
                                           width={320}
                                           height={200}
                                    />
                                ) : (
                                    <div className={s.placeholder}>
                                        <Image
                                            src="/icons/logo-red.svg"
                                            alt="Myastoriya"
                                            width={120}
                                            height={40}
                                            className={s.placeholderLogo}
                                        />
                                    </div>
                                )}
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
                );
            })}
            </div>

            {hasMore && (
                <div className={s.loadMoreWrapper}>
                    <Button variant="outline-black" onClick={loadMore} className={s.loadMoreBtn} disabled={loading}>
                        <span className={s.loadMoreBtnText}>{loading ? "Завантаження..." : dict.showBtn}</span>
                        {!loading && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="15" viewBox="0 0 18 15" fill="none">
                            <path d="M9.98467 1.00019L16.3131 7.32861L9.98467 13.657" stroke="black" strokeWidth="2" strokeLinecap="round" />
                            <line x1="15" y1="7.17139" x2="1" y2="7.17139" stroke="black" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        )}
                    </Button>
                </div>
            )}
        </section>
    );
}
