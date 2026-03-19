"use client";

import React from "react";
import Image from "next/image";
import s from "./Contacts.module.scss";
import { type Locale } from "@/i18n/config";
import { type Dictionary } from "@/i18n/types";
import { getLocalizedHref } from "@/utils/i18n-helpers";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs/Breadcrumbs";
import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import HeroBanner from "@/app/components/ui/HeroBanner/HeroBanner";
import contactsData from "@/content/contacts.json";

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
        { label: contactsPage.breadcrumbs.home, href: getLocalizedHref("/", lang) },
        { label: contactsPage.breadcrumbs.contacts },
    ];

    const InfoItem = ({ icon, label, value, isLink, href }: { icon: string; label: string; value: string; isLink?: boolean; href?: string }) => (
        <div className={s.infoItem}>
            <div className={s.iconWrapper}>
                <Image src={`/icons/contacts/${icon}.svg`} alt="" width={18} height={18} />
            </div>
            <div className={s.infoContent}>
                <span className={s.label}>{label}</span>
                {isLink && href ? (
                    <a href={href} className={s.value}>{value}</a>
                ) : (
                    <span className={s.value}>{value}</span>
                )}
            </div>
        </div>
    );

    const RestaurantCard = ({ restaurant }: { restaurant: any }) => (
        <div className={s.restaurantCard}>
            <div className={s.restaurantName}>{restaurant.name}</div>
            <div className={s.cardInfo}>
                <InfoItem 
                    icon="phone" 
                    label={contactsPage.labels.phone} 
                    value={restaurant.phone} 
                    isLink 
                    href={`tel:${restaurant.phone.replace(/\s+/g, '')}`} 
                />
                <InfoItem 
                    icon="email" 
                    label={contactsPage.labels.email} 
                    value={restaurant.email} 
                    isLink 
                    href={`mailto:${restaurant.email}`} 
                />
                <InfoItem 
                    icon="address" 
                    label={contactsPage.labels.restaurantAddress} 
                    value={restaurant.address} 
                />
                <InfoItem 
                    icon="time" 
                    label={contactsPage.labels.workingHours} 
                    value={restaurant.workingHours} 
                />
            </div>
            <a 
                href={restaurant.mapUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={s.mapButton}
            >
                {contactsPage.labels.buildRoute}
            </a>
        </div>
    );

    return (
        <>
            <Header lang={lang} />
            <main className={s.main}>
                <div className={s.content}>
                    {/* Hero Section */}
                    <div className={s.hero}>
                        <HeroBanner 
                            title={contactsPage.title} 
                            image="/images/contacts/contacts_hero.png" 
                        />
                    </div>

                    {/* Breadcrumbs */}
                    <div className={s.breadcrumbsContainer}>
                        <Breadcrumbs items={breadcrumbs} className={s.breadcrumbs} />
                    </div>

                    {/* Call Center Section */}
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
                                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                            ))}
                        </div>
                    </section>

                    {/* Meat Bar Restaurants */}
                    <section className={s.section}>
                        <h2 className={s.sectionTitle}>{contactsPage.sections.meatBar}</h2>
                        <div className={s.restaurantList}>
                            {meatBarRestaurants.map((restaurant) => (
                                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                            ))}
                        </div>
                    </section>
                </div>
            </main>
            <Footer lang={lang} />
        </>
    );
}
