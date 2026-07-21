"use client";

import { useState } from "react";
import Image from "next/image";
import s from "./ActionsGrid.module.scss";
import Button from "../ui/Button/Button";
import Breadcrumbs from "../ui/Breadcrumbs/Breadcrumbs";
import Tabs from "../ui/Tabs/Tabs";
import AppLink from "../ui/AppLink/AppLink";
import HeroBanner from "../ui/HeroBanner/HeroBanner";
import { type Sale, getSalesApi, getSpecialsApi, getProductsApi } from "@/lib/graphql";
import { useAppSelector } from "@/store/hooks";

interface ActionItem {
    id: number;
    slug?: string | null;
    title: string;
    image: string;
    imageWeb?: {
        desktop?: string | null;
        laptop?: string | null;
        tablet?: string | null;
    } | null;
    date?: string;
    dateRange?: string;
    discount?: string | null;
}

const LOCALIZED_TEXTS = {
    ua: {
        promotions: {
            title: "АКЦІЇ",
            breadcrumbs: {
                home: "Головна",
                promotions: "Акції"
            },
            tabs: {
                promotions: "АКЦІЇ",
                complexDiscounts: "КОМПЛЕКСНІ ЗНИЖКИ"
            },
            showBtn: "ПОКАЗАТИ ЩЕ",
            loading: "Завантаження...",
            dateLabel: "Акція діє до:",
            noItems: "Акції відсутні"
        },
        "complex-discounts": {
            title: "КОМПЛЕКСНІ ЗНИЖКИ",
            breadcrumbs: {
                home: "Головна",
                complexDiscounts: "Комплексні знижки"
            },
            tabs: {
                promotions: "АКЦІЇ",
                complexDiscounts: "КОМПЛЕКСНІ ЗНИЖКИ"
            },
            showBtn: "ПОКАЗАТИ ЩЕ",
            loading: "Завантаження...",
            dateLabel: "Комплексна знижка діє:",
            noItems: "Комплексні знижки відсутні"
        }
    },
    ru: {
        promotions: {
            title: "АКЦИИ",
            breadcrumbs: {
                home: "Главная",
                promotions: "Акции"
            },
            tabs: {
                promotions: "АКЦИИ",
                complexDiscounts: "КОМПЛЕКСНЫЕ СКИДКИ"
            },
            showBtn: "ПОКАЗАТЬ ЕЩЕ",
            loading: "Загрузка...",
            dateLabel: "Акция действует до:",
            noItems: "Акции отсутствуют"
        },
        "complex-discounts": {
            title: "КОМПЛЕКСНЫЕ СКИДКИ",
            breadcrumbs: {
                home: "Главная",
                complexDiscounts: "Комплексные скидки"
            },
            tabs: {
                promotions: "АКЦИИ",
                complexDiscounts: "КОМПЛЕКСНЫЕ СКИДКИ"
            },
            showBtn: "ПОКАЗАТЬ ЕЩЕ",
            loading: "Загрузка...",
            dateLabel: "Комплексная скидка действует:",
            noItems: "Комплексные скидки отсутствуют"
        }
    }
};

interface ActionsGridProps {
    initialItems: ActionItem[];
    lang: string;
    pageType: 'promotions' | 'complex-discounts';
    initialHasMore?: boolean;
}

export default function ActionsGrid({ initialItems, lang, pageType, initialHasMore }: ActionsGridProps) {
    const texts = LOCALIZED_TEXTS[lang === 'ru' ? 'ru' : 'ua'][pageType];
    const [items, setItems] = useState<ActionItem[]>(initialItems);
    const [hasMore, setHasMore] = useState(initialHasMore ?? true);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const token = useAppSelector((state) => state.auth.token) ?? undefined;

    const loadMore = async () => {
        if (loading || !hasMore) return;
        
        if (pageType === 'complex-discounts') {
            setLoading(true);
            try {
                const nextPage = page + 1;
                const data = await getSpecialsApi(12, nextPage, lang, token);

                if (data.data && data.data.length > 0) {
                    const activeSpecials = data.data.filter(special => {
                        if (!special.products || special.products.length < 2) return false;
                        if (typeof special.productsCount === 'number' && special.productsCount > 0 && special.products.length < special.productsCount) {
                            return false;
                        }
                        return special.products.every(product => product.available);
                    });

                    const newItems: ActionItem[] = activeSpecials.map(special => {
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
            const data = await getSalesApi(12, nextPage, lang, token, { cache: 'no-store' });

            if (data.data && data.data.length > 0) {
                const activeSalesChecks = await Promise.all(
                    data.data.map(async (sale) => {
                        try {
                            const products = await getProductsApi(
                                { saleId: parseInt(sale.id), limit: 1, silent: true },
                                lang,
                                token,
                            );
                            return { sale, hasProducts: products.data.length > 0 };
                        } catch {
                            return { sale, hasProducts: false };
                        }
                    })
                );

                const activeSales = activeSalesChecks.filter(c => c.hasProducts).map(c => c.sale);

                const newItems: ActionItem[] = activeSales.map((sale: Sale) => ({
                    id: parseInt(sale.id),
                    title: sale.name,
                    slug: sale.slug || sale.id,
                    image: sale.banner?.size2x || sale.banner?.size1x || sale.image?.size2x || sale.image?.size1x || "",
                    imageWeb: sale.bannerWeb,
                    date: sale.expiresAt || "",
                    discount: null
                }));

                setItems(prev => [...prev, ...newItems]);
                setHasMore(data.has_more_pages);
                setPage(nextPage);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to load more actions:", error);
        } finally {
            setLoading(false);
        }
    };

    const currentLoc = LOCALIZED_TEXTS[lang === 'ru' ? 'ru' : 'ua'];
    const breadcrumbItems = [
        { label: currentLoc[pageType].breadcrumbs.home, href: '/' },
        { label: pageType === 'promotions' ? currentLoc.promotions.breadcrumbs.promotions : currentLoc['complex-discounts'].breadcrumbs.complexDiscounts }
    ];

    const tabItems = [
        {
            id: 'promotions',
            label: texts.tabs.promotions,
            href: '/actions',
            active: pageType === 'promotions'
        },
        {
            id: 'complex-discounts',
            label: texts.tabs.complexDiscounts,
            href: '/complex-discounts',
            active: pageType === 'complex-discounts'
        }
    ];

    return (
        <section className={s.section}>
            <HeroBanner
                title={texts.title}
                image={`/images/promotions/${pageType}-banner.png`}
            />

            <Breadcrumbs items={breadcrumbItems} />

            <Tabs tabs={tabItems} className={s.tabs} classNameBtn={s.tabBtn} />

            {items.length === 0 ? (
                <div className={s.noItems}>
                    <p className={s.noItemsText}>{texts.noItems}</p>
                </div>
            ) : (
                <div className={s.grid}>
                    {items.map((item, idx) => {
                        const identifier = item.slug || item.id;
                        const path = pageType === 'promotions' ? 'actions' : pageType;
                        const hasImageWeb = !!item.imageWeb && (!!item.imageWeb.desktop || !!item.imageWeb.laptop || !!item.imageWeb.tablet);
                        const hasImage = !!item.image || hasImageWeb;

                        return (
                            <AppLink key={`${item.id}-${idx}`} href={`/${path}/${identifier}`} className={s.cardLink}>
                            <div className={s.card}>
                                <div className={s.cardImage}>
                                    {hasImage ? (
                                        hasImageWeb ? (
                                            <picture className={s.cardImgPicture}>
                                                {item.imageWeb?.desktop && <source media="(min-width: 1280px)" srcSet={item.imageWeb.desktop} />}
                                                {item.imageWeb?.laptop && <source media="(min-width: 1024px)" srcSet={item.imageWeb.laptop} />}
                                                {item.imageWeb?.tablet && <source media="(min-width: 768px)" srcSet={item.imageWeb.tablet} />}
                                                <img
                                                    src={item.image || item.imageWeb?.desktop || item.imageWeb?.laptop || item.imageWeb?.tablet || undefined}
                                                    alt={item.title}
                                                    className={s.cardImg}
                                                />
                                            </picture>
                                        ) : (
                                            <Image src={item.image}
                                                   alt={item.title}
                                                   className={s.cardImg}
                                                   width={320}
                                                   height={200}
                                            />
                                        )
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
                                            {texts.dateLabel}
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
            )}

            {hasMore && items.length > 0 && (
                <div className={s.loadMoreWrapper}>
                    <Button variant="outline-black" onClick={loadMore} className={s.loadMoreBtn} disabled={loading}>
                        <span className={s.loadMoreBtnText}>{loading ? texts.loading : texts.showBtn}</span>
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
