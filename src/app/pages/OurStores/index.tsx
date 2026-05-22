"use client";

import React, { useState, useMemo } from "react";
import s from "./OurStores.module.scss";
import { type Locale } from "@/i18n/config";
import { type Dictionary } from "@/i18n/types";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs/Breadcrumbs";
import HeroBanner from "@/app/components/ui/HeroBanner/HeroBanner";
import Button from "@/app/components/ui/Button/Button";
import { Shop } from "@/lib/graphql/queries/shops";
import StoreFilter from "@/app/components/OurStores/StoreFilter/StoreFilter";
import Search from "@/app/components/ui/Search/Search";
import StoreViewToggle from "@/app/components/OurStores/StoreViewToggle/StoreViewToggle";

import StoreList from "@/app/components/OurStores/StoreList/StoreList";
import StoreMap from "@/app/components/OurStores/StoreMap/StoreMap";
import { Store } from "@/app/components/OurStores/StoreCard/StoreCard";
import { parseShopData } from "@/lib/utils/shops";

interface OurStoresPageProps {
    dict: Dictionary;
    lang: Locale;
    initialShops: Shop[];
}

export type StoreType = "all" | "restaurant" | "meatbar";
export type ViewMode = "list" | "map";

const STORES_PER_PAGE = 10;


export default function OurStoresPage({ dict, lang, initialShops }: OurStoresPageProps) {
    const { ourStoresPage } = dict.home;
    const [activeFilter, setActiveFilter] = useState<StoreType>("restaurant");
    const [searchQuery, setSearchQuery] = useState("");
    const [localSearchQuery, setLocalSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("map");
    const [visibleCount, setVisibleCount] = useState(STORES_PER_PAGE);

    const stores = useMemo(() => initialShops.map(parseShopData), [initialShops]);

    const breadcrumbs = [
        { label: ourStoresPage.breadcrumbs.home, href: "/" },
        { label: ourStoresPage.breadcrumbs.stores },
    ];

    const filteredStores = useMemo(() => {
        return stores.filter((store) => {
            const matchesFilter = activeFilter === "all" || store.type === activeFilter;
            const matchesSearch = store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 store.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [stores, activeFilter, searchQuery]);

    // Reset visible count when filter or search changes
    React.useEffect(() => {
        setVisibleCount(STORES_PER_PAGE);
    }, [activeFilter, searchQuery]);

    const visibleStores = useMemo(() => {
        return filteredStores.slice(0, visibleCount);
    }, [filteredStores, visibleCount]);

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + STORES_PER_PAGE);
    };

    return (
        <>
            <main className={s.main}>
                <div className={s.topSection}>
                    <HeroBanner
                        prefix=""
                        title={ourStoresPage.title}
                        className={s.heroBanner}
                        image="/images/store/herobanner.png"
                    />
                </div>
                
                <div className={s.container}>
                    <div className={s.breadcrumbsContainer}>
                        <Breadcrumbs items={breadcrumbs} className={s.breadcrumbs} />
                    </div>

                        <div className={s.controls}>
                            <div className={s.topRow}>
                                <StoreFilter 
                                    activeFilter={activeFilter} 
                                    onFilterChange={setActiveFilter} 
                                    dict={ourStoresPage.filters}
                                    className={s.filter}
                                />
                                <Search
                                    value={localSearchQuery}
                                    onChange={(val) => {
                                        setLocalSearchQuery(val);
                                        if (!val) {
                                            setSearchQuery("");
                                        }
                                    }}
                                    onSubmit={() => setSearchQuery(localSearchQuery)}
                                    placeholder={ourStoresPage.search.placeholder}
                                    buttonText={ourStoresPage.search.button}
                                    buttonColor="red"
                                    className={s.search}
                                />
                                <StoreViewToggle 
                                    viewMode={viewMode} 
                                    onViewChange={setViewMode} 
                                    dict={ourStoresPage.viewToggle}
                                    className={s.viewToggle}
                                />
                            </div>
                        </div>

                        <div className={s.viewContainer}>
                            {viewMode === "list" ? (
                                <>
                                    <StoreList stores={visibleStores} dict={ourStoresPage.storeCard} />
                                    {visibleCount < filteredStores.length && (
                                        <div className={s.loadMoreWrapper}>
                                            <Button 
                                                variant="outline-black" 
                                                className={s.loadMoreBtn}
                                                onClick={handleLoadMore}
                                            >
                                                <span>{ourStoresPage.loadMore}</span>
                                                <svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9.98467 0.999945L16.3131 7.32837L9.98467 13.6568" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                    <line x1="15" y1="7.17163" x2="1" y2="7.17163" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                </svg>
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <StoreMap stores={filteredStores} dict={ourStoresPage.storeCard} />
                            )}
                        </div>
                    </div>
                </main>
        </>
    );
}
