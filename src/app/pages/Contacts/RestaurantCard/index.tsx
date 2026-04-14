import s from "@/app/pages/Contacts/Contacts.module.scss";
import React from "react";
import {ContactsPageDict} from "@/i18n/types";
import {InfoItem} from "@/app/pages/Contacts/InfoItem";
import Button from "@/app/components/ui/Button/Button";
import { type Shop } from "@/lib/graphql";

export function RestaurantCard({ restaurant, labels }: { restaurant: Shop; labels: ContactsPageDict["labels"] }) {
    const phone = restaurant.phones[0] || "";
    const primarySchedule = restaurant.schedule[0];
    const workingHours = primarySchedule ? `${primarySchedule.days}: ${primarySchedule.workTime}` : "";

    const nameParts = restaurant.name.split(" (");
    const displayName = nameParts[0];
    const displayAddress = nameParts[1] ? nameParts[1].replace(")", "") : restaurant.name;

    return (
        <div className={s.restaurantCard}>
            <div className={s.cardInfo}>
                {phone && (
                    <InfoItem
                        icon="phone"
                        label={labels.phone}
                        value={phone}
                        isLink
                        href={`tel:${phone.replace(/\s+/g, '')}`}
                    />
                )}
                {restaurant.email && (
                    <InfoItem
                        icon="email"
                        label={labels.email}
                        value={restaurant.email}
                        isLink
                        href={`mailto:${restaurant.email}`}
                    />
                )}
                <InfoItem
                    icon="address"
                    label={labels.restaurantAddress}
                    value={displayAddress}
                    isLink
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress)}`}
                />
                {workingHours && (
                    <InfoItem
                        icon="time"
                        label={labels.workingHours}
                        value={workingHours}
                    />
                )}
                <p className={s.location}>{displayName}</p>
            </div>
            <Button
                href={`https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(displayAddress)}`}
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