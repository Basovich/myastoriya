import React from "react";
import s from "./Contacts.module.scss";
import { type Locale } from "@/i18n/config";
import { type Dictionary } from "@/i18n/types";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs/Breadcrumbs";
import HeroBanner from "@/app/components/ui/HeroBanner/HeroBanner";
import {InfoItem} from "@/app/pages/Contacts/InfoItem";
import {RestaurantCard} from "@/app/pages/Contacts/RestaurantCard";


import { type Shop } from "@/lib/graphql";


interface ContactsPageProps {
    dict: Dictionary;
    lang: Locale;
    shops: Shop[];
    callCenter: {
        title: string;
        workingHours: string;
        phone: string;
        email: string;
        address: string;
    };
}

export default function ContactsPage({ dict, lang, shops, callCenter }: ContactsPageProps) {
    const { contactsPage } = dict.home;

    const myastoriyaRestaurants = shops.filter(s => 
        s.name.toLowerCase().includes("м'ясторія") || s.name.toLowerCase().includes("мясторія")
    );
    const meatBarRestaurants = shops.filter(s => 
        s.name.toLowerCase().includes("meatbar") || s.name.toLowerCase().includes("meat bar")
    );

    const breadcrumbs = [
        { label: contactsPage.breadcrumbs.home, href: "/" },
        { label: contactsPage.breadcrumbs.contacts },
    ];

    return (
        <>
            <main className={s.main}>
                <HeroBanner
                    title={contactsPage.title}
                    image="/images/contacts/contacts_hero.png"
                />
                <Breadcrumbs items={breadcrumbs} className={s.breadcrumbsContainer} />

                <section className={s.section}>
                    <h2 className={s.sectionTitle}>{contactsPage.sections.callCenter}</h2>
                    <div className={s.callCenterCard}>
                        <div className={s.callCenterGrid}>
                            <InfoItem
                                icon="phone"
                                label={contactsPage.labels.phone}
                                value={callCenter.phone}
                                isLink
                                href={`tel:${callCenter.phone.replace(/\s+/g, '')}`}
                            />
                            <InfoItem
                                icon="email"
                                label={contactsPage.labels.email}
                                value={callCenter.email}
                                isLink
                                href={`mailto:${callCenter.email}`}
                            />
                            <InfoItem
                                icon="address"
                                label={contactsPage.labels.address}
                                value={callCenter.address}
                                isLink
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(callCenter.address)}`}
                            />
                            <InfoItem
                                icon="time"
                                label={contactsPage.labels.workingHours}
                                value={callCenter.workingHours}
                            />
                        </div>
                    </div>
                </section>

                {/* Myastoriya Restaurants */}
                <section className={s.section}>
                    <h2 className={s.sectionTitle}>{contactsPage.sections.restaurants}</h2>
                    <div className={s.restaurantList}>
                        {myastoriyaRestaurants.map((restaurant) => (
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} labels={contactsPage.labels} />
                        ))}
                    </div>
                </section>

                {/* Meat Bar Restaurants */}
                <section className={s.section}>
                    <h2 className={s.sectionTitle}>{contactsPage.sections.meatBar}</h2>
                    <div className={s.restaurantList}>
                        {meatBarRestaurants.map((restaurant) => (
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} labels={contactsPage.labels} />
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}
