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
        open: string;
        closed: string;
        address: string;
        workingHoursLabel: string;
        phoneLabel: string;
    };
    variant?: "list" | "map";
    onClose?: () => void;
}

export default function StoreCard({ store, dict, variant = "list", onClose }: StoreCardProps) {
    // Determine if store is open based on status from data (mocking isOpen for now as data doesn't have it)
    const isOpen = true; 

    if (variant === 'map') {
        return (
            <div className={s.mapVariant}>
                <button className={s.closeCardBtn} onClick={onClose} type="button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <div className={s.mapImageWrapper}>
                    <Image 
                        src="/images/store/map-point.png" 
                        alt={store.name}
                        fill
                        className={s.mapImage}
                    />
                </div>
                
                <div className={s.mapContent}>
                    <h4 className={s.mapName}>{store.name.toUpperCase()}</h4>
                    
                    <div className={s.mapHours}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="9" stroke="#E3051B" strokeWidth="2"/>
                            <path d="M12 7V12L15 15" stroke="#E3051B" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>з 10:00 до 22:00</span>
                    </div>
                    
                    <div className={s.mapActions}>
                        <Link href={`/our-stores/${store.id}`} className={s.detailsBtnFull}>
                            {dict.details}
                        </Link>
                        <a 
                            href={store.mapUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={s.routeBtnFull}
                        >
                            {dict.route}
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={s.card}>
            <div className={s.logoSection}>
                <div className={s.logoCircle}>
                    <div className={s.logoM}>M</div>
                </div>
            </div>

            <div className={s.mainInfo}>
                <h4 className={s.name}>{store.name}</h4>
                <div className={`${s.statusBadge} ${isOpen ? s.open : s.closed}`}>
                    {isOpen ? dict.open : dict.closed}
                </div>
            </div>

            <div className={s.detailsGrid}>
                <div className={s.detailItem}>
                    <div className={s.iconWrapper}>
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                    </div>
                    <div className={s.textWrapper}>
                        <label>{dict.address}</label>
                        <p>{store.address}</p>
                    </div>
                </div>
                <div className={s.detailItem}>
                    <div className={s.iconWrapper}>
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div className={s.textWrapper}>
                        <label>{dict.workingHoursLabel}</label>
                        <p>{store.workingHours}</p>
                    </div>
                </div>
                <div className={s.detailItem}>
                    <div className={s.iconWrapper}>
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                    </div>
                    <div className={s.textWrapper}>
                        <label>{dict.phoneLabel}</label>
                        <p>{store.phone}</p>
                    </div>
                </div>
            </div>

            <div className={s.actions}>
                <a 
                    href={store.mapUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={s.pinBtn}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                </a>
                <Link href={`/our-stores/${store.id}`} className={s.detailsBtn}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
