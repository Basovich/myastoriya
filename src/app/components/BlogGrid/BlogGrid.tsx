"use client";

import { useState } from "react";
import Image from "next/image";
import AppLink from "@/app/components/ui/AppLink/AppLink";
import Button from "../ui/Button/Button";
import HeroBanner from "../ui/HeroBanner/HeroBanner";
import Breadcrumbs from "../ui/Breadcrumbs/Breadcrumbs";
import Pagination from "../ui/Pagination/Pagination";
import Tabs from "../ui/Tabs/Tabs";
import SubscribeBanner from "../SubscribeBanner/SubscribeBanner";
import s from "./BlogGrid.module.scss";

// Reusing interfaces from existing Content
interface PublicationItem {
    id: number;
    title: string;
    image: string;
    dateRange: string;
}

interface BlogGridProps {
    dict: {
        title: string;
        breadcrumbs: {
            home: string;
            blog: string;
        };
        tabs: {
            all: string;
            news: string;
            recipes: string;
            events: string;
        };
        showBtn: string;
    };
    initialItems: PublicationItem[];
    lang: string;
    activeCategory?: TabType;
}

type TabType = 'all' | 'news' | 'recipes' | 'events';

export default function BlogGrid({ dict, initialItems, lang, activeCategory = 'all' }: BlogGridProps) {
    // Generate 12 mock initial items regardless of what was passed in
    const twelveInitialItems = Array.from({ length: 12 }).map((_, i) => {
        const baseItem = initialItems[i % initialItems.length];
        return { ...baseItem, id: baseItem.id + i * 1000 };
    });

    const [items, setItems] = useState<PublicationItem[]>(twelveInitialItems);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 10; // Mock total pages

    // removed getRoute as AppLink automatically handles localization

    const breadcrumbItems = [
        { label: dict.breadcrumbs.home, href: '/' },
        { label: dict.breadcrumbs.blog }
    ];

    const loadMore = () => {
        // Load exactly 12 more mock items
        const moreItems = Array.from({ length: 12 }).map((_, i) => {
            const baseItem = initialItems[(i + 1) % initialItems.length];
            return { ...baseItem, id: baseItem.id + (i + 12) * 1000 };
        });

        setItems((prev) => [...prev, ...moreItems]);
        setHasMore(false);
    };

    const tabsData = [
        { id: 'all', label: dict.tabs.all, href: '/blog', active: activeCategory === 'all' },
        { id: 'news', label: dict.tabs.news, href: '/blog/news', active: activeCategory === 'news' },
        { id: 'recipes', label: dict.tabs.recipes, href: '/blog/recipes', active: activeCategory === 'recipes' },
        { id: 'events', label: dict.tabs.events, href: '/blog/events', active: activeCategory === 'events' },
    ];

    return (
        <section className={s.section}>
            <div className={s.container}>
                <HeroBanner
                    title={dict.title}
                    image="/images/promotions/blog-banner.png"
                />

                <div className={s.breadcrumbsWrapper}>
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                <div className={s.tabsWrapper}>
                    <Tabs tabs={tabsData} className={s.tabs} />
                </div>

                <div className={s.grid}>
                    {items.map((item, idx) => (
                        <AppLink key={`${item.id}-${idx}`} href={`/blog/${item.id}`} className={s.cardLink}>
                            <div className={s.card}>
                                <div className={s.cardImage}>
                                    <Image src={item.image} alt={item.title} fill className={s.cardImg} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                                </div>
                                <div className={s.cardBody}>
                                    <span className={s.date}>{item.dateRange}</span>
                                    <h3 className={s.cardTitle}>{item.title}</h3>
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

                <div className={s.paginationRow}>
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    />
                </div>

                <SubscribeBanner 
                    image="/images/blog/subscribe-bg1.png"
                    title="Підпишіться на нашу розсилку"
                />
            </div>
        </section>
    );
}
