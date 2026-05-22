"use client";

import React from 'react';
import s from './DeliveryAndPaymentPage.module.scss';
import { Locale } from '@/i18n/config';
import { Dictionary } from '@/i18n/types';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs/Breadcrumbs';
import HeroBanner from '@/app/components/ui/HeroBanner/HeroBanner';
import DeliveryMethodCard from '@/app/components/Delivery/DeliveryMethodCard/DeliveryMethodCard';
import DeliveryZones from '@/app/components/Delivery/DeliveryZones/DeliveryZones';
import PolicySections from '@/app/components/Delivery/PolicySections/PolicySections';
import SectionHeader from '@/app/components/ui/SectionHeader/SectionHeader';
import { Shop } from '@/lib/graphql/queries/shops';
import { OrderingInfoBlock } from '@/lib/graphql/index';
import Button from "@/app/components/ui/Button/Button";
import { Store } from '@/app/components/OurStores/StoreCard/StoreCard';
import { parseShopData } from '@/lib/utils/shops';

interface DeliveryAndPaymentPageProps {
    dict: Dictionary;
    lang: Locale;
    initialShops: Shop[];
    isMeatBar?: boolean;
    policyBlocks: OrderingInfoBlock[];
    deliveryBlocks: OrderingInfoBlock[];
}

export default function DeliveryAndPaymentPage({ dict, lang, initialShops, isMeatBar = false, policyBlocks, deliveryBlocks }: DeliveryAndPaymentPageProps) {
    const stores = initialShops.map(parseShopData);
    const { deliveryPage, ourStoresPage } = dict.home;
    const breadcrumbs = [
        { label: deliveryPage.breadcrumbs.home, href: "/" },
        { label: deliveryPage.breadcrumbs.delivery }
    ];
    const langPrefix = lang === 'ua' ? '' : `/${lang}`;

    return (
        <>
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
                            {deliveryBlocks.map((block, idx) => (
                                <DeliveryMethodCard 
                                    key={block.id} 
                                    block={block} 
                                    hasBackground={idx === 0 || idx === 2 || idx === 4}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <PolicySections blocks={policyBlocks} />
            </main>
        </>
    );
}
