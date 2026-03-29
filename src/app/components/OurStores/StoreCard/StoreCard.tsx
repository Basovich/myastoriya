import React from "react";
import s from "./StoreCard.module.scss";
import Image from "next/image";
import Link from "next/link";
import { type StoreType } from "../../../pages/OurStores/index";

export interface Store {
    id: string;
    name: string;
    type: string;
    address: string;
    workingHours: string;
    phone: string;
    email: string;
    lat: number;
    lng: number;
    image: string;
    mapUrl: string;
}

interface StoreCardProps {
    store: Store;
    dict: {
        workingHours: string;
        details: string;
        route: string;
    };
    variant?: "list" | "map";
}

export default function StoreCard({ store, dict, variant = "list" }: StoreCardProps) {
    return (
        <div className={s.card}>
            <div className={s.imageWrapper}>
                <Image src={store.image} alt={store.name} fill className={s.image} />
            </div>
            <div className={s.content}>
                <h4 className={s.name}>{store.name}</h4>
                <div className={s.info}>
                    <div className={s.infoItem}>
                        <div className={s.timeIcon}>
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <span className={s.timeText}>{dict.workingHours} {store.workingHours}</span>
                    </div>
                </div>
                <div className={s.actions}>
                    <Link href={`/our-stores/${store.id}`} className={s.detailsBtn}>
                        {dict.details}
                    </Link>
                    <a 
                        href={`https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${encodeURIComponent(store.address)}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={s.routeBtn}
                    >
                        {dict.route}
                    </a>
                </div>
            </div>
        </div>
    );
}
