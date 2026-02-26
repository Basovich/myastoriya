"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "../ui/Button/Button";
import HeroBanner from "../ui/HeroBanner/HeroBanner";
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
}

type TabType = 'all' | 'news' | 'recipes' | 'events';

export default function BlogGrid({ dict, initialItems, lang }: BlogGridProps) {
    // Generate 12 mock initial items regardless of what was passed in
    const twelveInitialItems = Array.from({ length: 12 }).map((_, i) => {
        const baseItem = initialItems[i % initialItems.length];
        return { ...baseItem, id: baseItem.id + i * 1000 };
    });

    const [items, setItems] = useState<PublicationItem[]>(twelveInitialItems);
    const [hasMore, setHasMore] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('all');

    // Helper to conditionally drop '/ua'
    const getRoute = (path: string) => {
        const basePath = lang === 'ua' ? '' : `/${lang}`;
        const safePath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
        return `${basePath}${safePath}` || '/';
    };

    const loadMore = () => {
        // Load exactly 12 more mock items
        const moreItems = Array.from({ length: 12 }).map((_, i) => {
            const baseItem = initialItems[(i + 1) % initialItems.length];
            return { ...baseItem, id: baseItem.id + (i + 12) * 1000 };
        });

        setItems((prev) => [...prev, ...moreItems]);
        setHasMore(false);
    };

    const tabs = [
        { id: 'all' as TabType, label: dict.tabs.all },
        { id: 'news' as TabType, label: dict.tabs.news },
        { id: 'recipes' as TabType, label: dict.tabs.recipes },
        { id: 'events' as TabType, label: dict.tabs.events },
    ];

    return (
        <section className={s.section}>
            <div className={s.container}>
                <HeroBanner
                    title={dict.title}
                    image="/images/promotions/blog-banner.png"
                />

                <div className={s.breadcrumbs}>
                    <Link href={getRoute('/')}>{dict.breadcrumbs.home}</Link>
                    <span className={s.separator}>»</span>
                    <span className={s.current}>{dict.breadcrumbs.blog}</span>
                </div>

                <div className={s.tabsWrapper}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`${s.tab} ${activeTab === tab.id ? s.activeTab : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className={s.grid}>
                    {items.map((item, idx) => (
                        <Link key={`${item.id}-${idx}`} href={getRoute(`/blog/${item.id}`)} className={s.cardLink}>
                            <div className={s.card}>
                                <div className={s.cardImage}>
                                    <Image src={item.image} alt={item.title} fill className={s.cardImg} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                                </div>
                                <div className={s.cardBody}>
                                    <span className={s.date}>{item.dateRange}</span>
                                    <h3 className={s.cardTitle}>{item.title}</h3>
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
                                <path d="M9.98467 1.00019L16.3131 7.32861L9.98467 13.657" stroke="black" strokeWidth="2" strokeLinecap="round" />
                                <line x1="15" y1="7.17139" x2="1" y2="7.17139" stroke="black" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </Button>
                    </div>
                )}

                <div className={s.paginationRow}>
                    <div className={s.pageNumbers}>
                        <button className={`${s.pageNum} ${s.activePage}`}>01</button>
                        <button className={s.pageNum}>02</button>
                        <button className={s.pageNum}>03</button>
                        <span className={s.pageDots}>...</span>
                        <button className={s.pageNum}>10</button>
                    </div>
                </div>

                <div className={s.subscribeBanner}>
                    <div className={s.subscribeBg1}>
                        <Image src="/images/blog/subscribe-bg1.png" alt="Bg1" fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div className={s.subscribeBg2}>
                        <Image src="/images/blog/subscribe-bg2.png" alt="Bg2" fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div className={s.subscribeContent}>
                        <div className={s.subscribeTextCol}>
                            <h2 className={s.subscribeTitle}>Підпишіться на нашу розсилку</h2>
                            <span className={s.subscribeArrows}>»</span>
                        </div>
                        <div className={s.subscribeFormCol}>
                            <div className={s.inputWrapper}>
                                <input type="email" placeholder="E-mail" className={s.subscribeInput} />
                                <button className={s.subscribeSubmitBtn}>Підписатись</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
