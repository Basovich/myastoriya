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

interface OurStoresPageProps {
    dict: Dictionary;
    lang: Locale;
    initialShops: Shop[];
}

export type StoreType = "all" | "restaurant" | "meatbar";
export type ViewMode = "list" | "map";

const parseShopData = (shop: Shop): Store => {
    const fullName = shop.name;
    // Regex to extract brand and address from "Brand (Address)"
    const match = fullName.match(/^(.*?)\((.*?)\)$/);
    const brand = match ? match[1].trim() : fullName;
    const address = match ? match[2].trim() : '';
    
    // Determine type (restaurant or meatbar) based on brand name
    const isMeatBar = brand.toLowerCase().includes('meat bar') || brand.toLowerCase().includes('meatbar');
    
    return {
        id: shop.id,
        name: brand,
        type: isMeatBar ? "meatbar" : "restaurant",
        address: address || brand,
        workingHours: shop.schedule?.[0] ? `${shop.schedule[0].days}: ${shop.schedule[0].workTime}` : "",
        phone: shop.phones?.[0] || "",
        email: shop.email || "",
        lat: shop.lat || 0,
        lng: shop.lng || 0,
        image: shop.image?.size2x || "/images/store/herobanner.png",
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || brand)}`
    };
};

export default function OurStoresPage({ dict, lang, initialShops }: OurStoresPageProps) {
    const { ourStoresPage } = dict.home;
    const [activeFilter, setActiveFilter] = useState<StoreType>("restaurant");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("map");

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
                                />
                                <Search
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder={ourStoresPage.search.placeholder}
                                    buttonText={ourStoresPage.search.button}
                                    buttonColor="red"
                                    className={s.search}
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
                                            <Button 
                                                variant="outline-black" 
                                                className={s.loadMoreBtn}
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
