"use client";

import React from 'react';
import s from './DeliveryAndPaymentPage.module.scss';
import { Locale } from '@/i18n/config';
import { Dictionary } from '@/i18n/types';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs/Breadcrumbs';
import HeroBanner from '@/app/components/ui/HeroBanner/HeroBanner';
import DeliveryMethodCard from '@/app/components/Delivery/DeliveryMethodCard/DeliveryMethodCard';
import DeliveryZones from '@/app/components/Delivery/DeliveryZones/DeliveryZones';
import PolicySections from '@/app/components/Delivery/PolicySections/PolicySections';
import SectionHeader from '@/app/components/ui/SectionHeader/SectionHeader';
import { Shop } from '@/lib/graphql/queries/shops';
import Button from "@/app/components/ui/Button/Button";
import { Store } from '@/app/components/OurStores/StoreCard/StoreCard';

interface DeliveryAndPaymentPageProps {
    dict: Dictionary;
    lang: Locale;
    initialShops: Shop[];
    isMeatBar?: boolean;
}

const parseShopData = (shop: Shop): Store => {
    const fullName = shop.name;
    const match = fullName.match(/^(.*?)\((.*?)\)$/);
    const brand = match ? match[1].trim() : fullName;
    const address = match ? match[2].trim() : '';
    
    const isMeatBarBrand = brand.toLowerCase().includes('meat bar') || brand.toLowerCase().includes('meatbar');
    
    return {
        id: shop.id,
        name: brand,
        type: isMeatBarBrand ? "meatbar" : "restaurant",
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

export default function DeliveryAndPaymentPage({ dict, lang, initialShops, isMeatBar = false }: DeliveryAndPaymentPageProps) {
    const stores = initialShops.map(parseShopData);
    const { deliveryPage, ourStoresPage } = dict.home;
    const breadcrumbs = [
        { label: deliveryPage.breadcrumbs.home, href: "/" },
        { label: deliveryPage.breadcrumbs.delivery }
    ];
    const langPrefix = lang === 'ua' ? '' : `/${lang}`;

    return (
        <>
            <Header lang={lang} />
            <main className={s.main}>
                <div className={s.container}>
                    <HeroBanner 
                        title={deliveryPage.title}
                        image="/images/delivery/delivery.png"
                        className={s.hero}
                    />
                    <Breadcrumbs items={breadcrumbs} className={s.breadcrumbs} />
                </div>

                <div className={s.header}>
                    <SectionHeader title={deliveryPage.zones.title} classNameWrapper={s.sectionHeader} />
                    <div className={s.tabs}>
                        <Button
                            href={`${langPrefix}/delivery`}
                            variant={!isMeatBar ? "black" : "outline-black"}
                            active={!isMeatBar}
                            className={s.tab}
                        >
                            {deliveryPage.zones.tabs.restaurants}
                        </Button>
                        <Button
                            href={`${langPrefix}/delivery-meat-bar`}
                            variant={isMeatBar ? "black" : "outline-black"}
                            active={isMeatBar}
                            className={s.tab}
                        >
                            {deliveryPage.zones.tabs.meatbar}
                        </Button>
                    </div>
                </div>

                <DeliveryZones 
                    stores={stores} 
                    dict={deliveryPage}
                    storeDict={ourStoresPage.storeCard}
                    lang={lang}
                    isMeatBar={isMeatBar}
                />

                <section className={s.methodsSection}>
                    <div className={s.container}>
                        <div className={s.methodsGrid}>
                            {(() => {
                                // Reorder items: move "Самовивіз" (idx 3) to the end
                                const originalItems = [...deliveryPage.methods.items];
                                const reorderedItems = [...originalItems];
                                if (reorderedItems.length > 4) {
                                    const pickupItem = reorderedItems.splice(3, 1)[0];
                                    reorderedItems.push(pickupItem);
                                }
                                
                                return reorderedItems.map((item, idx) => (
                                    <DeliveryMethodCard 
                                        key={idx} 
                                        item={item} 
                                        hasBackground={idx === 0 || idx === 2 || idx === 4}
                                    />
                                ));
                            })()}
                        </div>
                    </div>
                </section>

                <PolicySections dict={deliveryPage.policies} />
            </main>
            <Footer lang={lang} />
        </>
    );
}
