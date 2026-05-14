import React from "react";
import s from "./Contacts.module.scss";
import { type Locale } from "@/i18n/config";
import { type Dictionary } from "@/i18n/types";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs/Breadcrumbs";
import HeroBanner from "@/app/components/ui/HeroBanner/HeroBanner";
import { ContactCard } from "@/app/pages/Contacts/RestaurantCard";
import { type ContactCategory } from "../../../lib/graphql/queries/pages/contacts";

interface ContactsPageProps {
    dict: Dictionary;
    lang: Locale;
    categories: ContactCategory[];
}

export default function ContactsPage({ dict, lang, categories }: ContactsPageProps) {
    const { contactsPage } = dict.home;

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

                {categories.map((category) => (
                    <section className={s.section} key={category.id}>
                        <h2 className={s.sectionTitle}>{category.name}</h2>
                        <div className={s.restaurantList}>
                            {category.contacts.map((contact) => (
                                <ContactCard key={contact.id} contact={contact} lang={lang} />
                            ))}
                        </div>
                    </section>
                ))}
            </main>
        </>
    );
}
