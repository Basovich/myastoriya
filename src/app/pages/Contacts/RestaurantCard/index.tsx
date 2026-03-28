import contactsData from "@/content/contacts.json";
import s from "@/app/pages/Contacts/Contacts.module.scss";
import React from "react";
import {ContactsPageDict} from "@/i18n/types";
import {InfoItem} from "@/app/pages/Contacts/InfoItem";
import Button from "@/app/components/ui/Button/Button";

type Restaurant = (typeof contactsData.restaurants)[number];

export function RestaurantCard({ restaurant, labels }: { restaurant: Restaurant; labels: ContactsPageDict["labels"] }) {
    return (
        <div className={s.restaurantCard}>
            <div className={s.cardInfo}>
                <InfoItem
                    icon="phone"
                    label={labels.phone}
                    value={restaurant.phone}
                    isLink
                    href={`tel:${restaurant.phone.replace(/\s+/g, '')}`}
                />
                <InfoItem
                    icon="email"
                    label={labels.email}
                    value={restaurant.email}
                    isLink
                    href={`mailto:${restaurant.email}`}
                />
                <InfoItem
                    icon="address"
                    label={labels.restaurantAddress}
                    value={restaurant.address}
                />
                <InfoItem
                    icon="time"
                    label={labels.workingHours}
                    value={restaurant.workingHours}
                />
                <p className={s.location}>М'ясторія на Оболоні</p>
            </div>
            <Button
                href={`https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(restaurant.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline-black"
                className={s.mapButton}
            >
                {labels.buildRoute}
            </Button>
        </div>
    );
}