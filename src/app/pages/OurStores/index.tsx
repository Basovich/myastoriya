"use client";

import React, { useState, useMemo } from "react";
import s from "./OurStores.module.scss";
import { type Locale } from "@/i18n/config";
import { type Dictionary } from "@/i18n/types";
import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs/Breadcrumbs";
import HeroBanner from "@/app/components/ui/HeroBanner/HeroBanner";
import storesData from "@/content/stores.json";
import StoreFilter from "@/app/components/OurStores/StoreFilter/StoreFilter";
import StoreSearch from "@/app/components/OurStores/StoreSearch/StoreSearch";
import StoreViewToggle from "@/app/components/OurStores/StoreViewToggle/StoreViewToggle";
import StoreList from "@/app/components/OurStores/StoreList/StoreList";
import StoreMap from "@/app/components/OurStores/StoreMap/StoreMap";

interface OurStoresPageProps {
    dict: Dictionary;
    lang: Locale;
}

export type StoreType = "all" | "restaurant" | "meatbar";
export type ViewMode = "list" | "map";

export default function OurStoresPage({ dict, lang }: OurStoresPageProps) {
    const { ourStoresPage } = dict.home;
    const [activeFilter, setActiveFilter] = useState<StoreType>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("map");

    const breadcrumbs = [
        { label: ourStoresPage.breadcrumbs.home, href: "/" },
        { label: ourStoresPage.breadcrumbs.stores },
    ];

    const filteredStores = useMemo(() => {
        return storesData.filter((store) => {
            const matchesFilter = activeFilter === "all" || store.type === activeFilter;
            const matchesSearch = store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 store.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [activeFilter, searchQuery]);

    return (
        <>
            <Header lang={lang} />
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
                                />
                                <StoreSearch 
                                    value={searchQuery} 
                                    onChange={setSearchQuery} 
                                    dict={ourStoresPage.search}
                                />
                                <StoreViewToggle 
                                    viewMode={viewMode} 
                                    onViewChange={setViewMode} 
                                    dict={ourStoresPage.viewToggle}
                                />
                            </div>
                        </div>

                        <div className={s.viewContainer}>
                            {viewMode === "list" ? (
                                <>
                                    <StoreList stores={filteredStores} dict={ourStoresPage.storeCard} />
                                    {filteredStores.length > 0 && (
                                        <div className={s.loadMoreWrapper}>
                                            <button className={s.loadMoreBtn}>
                                                {ourStoresPage.loadMore}
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="7 13 12 18 17 13" />
                                                    <polyline points="7 6 12 11 17 6" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <StoreMap stores={filteredStores} dict={ourStoresPage.storeCard} />
                            )}
                        </div>
                    </div>
                </main>
            <Footer lang={lang} />
        </>
    );
}
