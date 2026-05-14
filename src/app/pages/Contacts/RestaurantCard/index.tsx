import s from "@/app/pages/Contacts/Contacts.module.scss";
import React from "react";
import {InfoItem} from "@/app/pages/Contacts/InfoItem";
import Button from "@/app/components/ui/Button/Button";
import { type Contact } from "@/lib/graphql/queries/contacts";
import { type Locale } from "@/i18n/config";

const localLabels = {
    ua: {
        phone: "Телефон",
        email: "E-mail",
        restaurantAddress: "Адреса",
        workingHours: "Графік роботи:",
        buildRoute: "Побудувати маршрут на карті"
    },
    ru: {
        phone: "Телефон",
        email: "E-mail",
        restaurantAddress: "Адрес",
        workingHours: "График работы:",
        buildRoute: "Построить маршрут на карте"
    }
};

export function ContactCard({ contact, lang }: { contact: Contact; lang: Locale }) {
    const labels = localLabels[lang];
    const phone = contact.phone || "";
    
    const workingHoursNode = contact.schedule && contact.schedule.length > 0 ? (
        <>
            {contact.schedule.map((sch, index) => (
                <React.Fragment key={index}>
                    {sch.days}: {sch.workTime}
                    {index < contact.schedule.length - 1 && <br />}
                </React.Fragment>
            ))}
        </>
    ) : null;

    const displayName = contact.name;
    const displayAddress = contact.address || "";

    const isMainOffice = contact.id === "1" && contact.name === "Головний офіс";

    const hasCoordinates = contact.lat !== null && contact.lng !== null;
    const mapSearchUrl = hasCoordinates 
        ? `https://www.google.com/maps/search/?api=1&query=${contact.lat},${contact.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress)}`;
        
    const mapDirUrl = hasCoordinates
        ? `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${contact.lat},${contact.lng}`
        : `https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(displayAddress)}`;

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
                {contact.email && (
                    <InfoItem
                        icon="email"
                        label={labels.email}
                        value={contact.email}
                        isLink
                        href={`mailto:${contact.email}`}
                    />
                )}
                {displayAddress && (
                    <InfoItem
                        icon="address"
                        label={labels.restaurantAddress}
                        value={displayAddress}
                        isLink
                        href={mapSearchUrl}
                    />
                )}
                {workingHoursNode && (
                    <InfoItem
                        icon="time"
                        label={labels.workingHours}
                        value={workingHoursNode}
                    />
                )}
                {!isMainOffice && <p className={s.location}>{displayName}</p>}
            </div>
            {!isMainOffice && displayAddress && (
                <Button
                    href={mapDirUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline-black"
                    className={s.mapButton}
                >
                    {labels.buildRoute}
                </Button>
            )}
        </div>
    );
}