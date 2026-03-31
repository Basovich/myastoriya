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
import storesData from '@/content/stores.json';
import Button from "@/app/components/ui/Button/Button";

interface DeliveryAndPaymentPageProps {
    dict: Dictionary;
    lang: Locale;
    isMeatBar?: boolean;
}

export default function DeliveryAndPaymentPage({ dict, lang, isMeatBar = false }: DeliveryAndPaymentPageProps) {
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
                    stores={storesData} 
                    dict={deliveryPage}
                    storeDict={ourStoresPage.storeCard}
                    lang={lang}
                    isMeatBar={isMeatBar}
                />

                <section className={s.methodsSection}>
                    <div className={s.container}>
                        <SectionHeader title={deliveryPage.methods.title} />
                        <div className={s.methodsGrid}>
                            {deliveryPage.methods.items.map((item, idx) => (
                                <DeliveryMethodCard key={idx} item={item} />
                            ))}
                        </div>
                    </div>
                </section>

                <PolicySections dict={deliveryPage.policies} />
            </main>
            <Footer lang={lang} />
        </>
    );
}
