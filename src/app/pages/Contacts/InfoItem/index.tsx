import s from "@/app/pages/Contacts/Contacts.module.scss";
import React from "react";
import Image from "next/image";


interface InfoItemProps {
    icon: string;
    label: string;
    value: string;
    isLink?: boolean;
    href?: string;
}

export function InfoItem({ icon, label, value, isLink, href }: InfoItemProps) {
    return (
        <div className={s.infoItem}>
            <div className={s.infoTop}>
                <Image src={`/icons/contacts/${icon}.svg`} className={s.icon} alt="" width={20} height={20} />
                <span className={s.label}>{label}</span>
            </div>
            {isLink && href ? (
                <a href={href} className={s.value} target="_blank" rel="noopener noreferrer">{value}</a>
            ) : (
                <span className={s.value}>{value}</span>
            )}
        </div>
    );
}