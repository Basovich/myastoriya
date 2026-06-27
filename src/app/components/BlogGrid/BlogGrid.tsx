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
import { type BlogPost, type BlogType, resolveBlogImageUrl, getBlogsApi } from "@/lib/graphql";

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
    const [isPaginating, setIsPaginating] = useState(false);
    const [currentTotalPages, setCurrentTotalPages] = useState(totalPages);

    const breadcrumbItems = [
        { label: dict.breadcrumbs.home, href: "/" },
        { label: dict.breadcrumbs.blog },
    ];

    const loadMore = async () => {
        if (loading || isPaginating) return;
        setLoading(true);
        try {
            const nextPage = currentPage + 1;
            const result = await getBlogsApi({ page: nextPage, typeSlug: activeTypeSlug ?? null }, lang);
            if (result.data?.length) {
                setItems((prev) => [...prev, ...result.data]);
                setHasMore(result.has_more_pages);
                setCurrentPage(nextPage);
                setCurrentTotalPages((prevTotal) => result.has_more_pages ? prevTotal : nextPage);
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

    const loadPage = async (page: number) => {
        if (loading || isPaginating || page === currentPage) return;
        setIsPaginating(true);
        try {
            const result = await getBlogsApi({ page, typeSlug: activeTypeSlug ?? null }, lang);
            if (result.data) {
                setItems(result.data);
                setHasMore(result.has_more_pages);
                setCurrentPage(page);
                if (result.last_page) {
                    setCurrentTotalPages(result.last_page);
                }
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        } catch {
            // silent
        } finally {
            setIsPaginating(false);
        }
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

                <div className={s.gridWrapper}>
                    <div className={s.grid}>
                        {items.map((item) => (
                            <AppLink
                                key={item.id}
                                href={`/blog/${item.slug}`}
                                className={s.cardLink}
                            >
                                <div className={s.card}>
                                    <div className={s.cardImage}>
                                        {resolveBlogImageUrl(item.image) ? (
                                            <Image
                                                src={resolveBlogImageUrl(item.image)}
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
                    {isPaginating && (
                        <div className={s.gridOverlay}>
                            <div className={s.pulseLogo} />
                        </div>
                    )}
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
                        totalPages={currentTotalPages}
                        onPageChange={loadPage}
                    />
                </div>

                <SubscribeBanner
                    image="/images/blog/subscribe-bg1.webp"
                    title={lang === "ru" ? "Подпишитесь на нашу рассылку" : "Підпишіться на нашу розсилку"}
                    lang={lang}
                />
            </div>
        </section>
    );
}
