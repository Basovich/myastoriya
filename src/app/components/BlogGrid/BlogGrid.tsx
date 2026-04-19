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
import type { BlogPost, BlogType } from "@/lib/graphql";

type TabType = "all" | string;

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
    initialItems: BlogPost[];
    totalPages: number;
    hasMore: boolean;
    blogTypes: BlogType[];
    lang: string;
    activeTypeSlug?: string;
}

export default function BlogGrid({
    dict,
    initialItems,
    totalPages,
    hasMore: initialHasMore,
    blogTypes,
    lang,
    activeTypeSlug,
}: BlogGridProps) {
    const [items, setItems] = useState<BlogPost[]>(initialItems);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const breadcrumbItems = [
        { label: dict.breadcrumbs.home, href: "/" },
        { label: dict.breadcrumbs.blog },
    ];

    const loadMore = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const nextPage = currentPage + 1;
            const res = await fetch("/api/blogs", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Content-Language": lang === "ru" ? "ru_RU" : "uk_UA"
                },
                body: JSON.stringify({ page: nextPage, typeSlug: activeTypeSlug ?? null }),
            });
            const data = await res.json();
            if (data.items?.length) {
                setItems((prev) => [...prev, ...data.items]);
                setHasMore(data.hasMore);
                setCurrentPage(nextPage);
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    const staticTabs = [
        { id: "all", label: dict.tabs.all, href: "/blog", active: !activeTypeSlug },
    ];

    const dynamicTabs = blogTypes.map((t) => ({
        id: t.slug,
        label: t.name,
        href: `/blog/category/${t.slug}`,
        active: activeTypeSlug === t.slug,
    }));

    const tabsData = [...staticTabs, ...dynamicTabs];

    const formatDate = (iso: string | null) => {
        if (!iso) return "";
        return new Date(iso).toLocaleDateString("uk-UA", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

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
                    {items.map((item) => (
                        <AppLink
                            key={item.id}
                            href={`/blog/${item.slug}`}
                            className={s.cardLink}
                        >
                            <div className={s.card}>
                                <div className={s.cardImage}>
                                    {item.image?.url?.size2x ? (
                                        <Image
                                            src={item.image.url.size2x}
                                            alt={item.name}
                                            fill
                                            className={s.cardImg}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className={s.cardImgPlaceholder} />
                                    )}
                                </div>
                                <div className={s.cardBody}>
                                    <span className={s.date}>{formatDate(item.publishedAt)}</span>
                                    <h3 className={s.cardTitle}>{item.name}</h3>
                                </div>
                            </div>
                        </AppLink>
                    ))}
                </div>

                {hasMore && (
                    <div className={s.loadMoreWrapper}>
                        <Button
                            variant="outline-black"
                            onClick={loadMore}
                            className={s.loadMoreBtn}
                            disabled={loading}
                        >
                            <span className={s.loadMoreBtnText}>
                                {loading ? "Завантаження..." : dict.showBtn}
                            </span>
                            {!loading && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="15" viewBox="0 0 18 15" fill="none">
                                    <path d="M9.98467 1.00019L16.3131 7.32861L9.98467 13.657" stroke="black" strokeWidth="2" strokeLinecap="round" />
                                    <line x1="15" y1="7.17139" x2="1" y2="7.17139" stroke="black" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            )}
                        </Button>
                    </div>
                )}

                <div className={s.paginationRow}>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: "smooth" });
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
