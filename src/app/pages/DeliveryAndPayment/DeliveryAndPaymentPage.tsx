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

    return (
        <>
            <Header lang={lang} />
            <main className={s.main}>
                <div className={s.container}>
                    <Breadcrumbs items={breadcrumbs} className={s.breadcrumbs} />
                </div>

                <HeroBanner 
                    title={deliveryPage.title}
                    image="/images/delivery/delivery-hero.png"
                    className={s.hero}
                />

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
