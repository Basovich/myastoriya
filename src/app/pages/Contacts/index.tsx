import React from "react";
import s from "./Contacts.module.scss";
import { type Locale } from "@/i18n/config";
import { type Dictionary } from "@/i18n/types";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs/Breadcrumbs";
import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import HeroBanner from "@/app/components/ui/HeroBanner/HeroBanner";
import contactsData from "@/content/contacts.json";
import {InfoItem} from "@/app/pages/Contacts/InfoItem";
import {RestaurantCard} from "@/app/pages/Contacts/RestaurantCard";


interface ContactsPageProps {
    dict: Dictionary;
    lang: Locale;
}

export default function ContactsPage({ dict, lang }: ContactsPageProps) {
    const { contactsPage } = dict.home;
    const { callCenter, restaurants } = contactsData;

    const myastoriyaRestaurants = restaurants.filter(r => r.type === "myastoriya");
    const meatBarRestaurants = restaurants.filter(r => r.type === "meatbar");

    const breadcrumbs = [
        { label: contactsPage.breadcrumbs.home, href: "/" },
        { label: contactsPage.breadcrumbs.contacts },
    ];

    return (
        <>
            <Header lang={lang} />
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
            <Footer lang={lang} />
        </>
    );
}
