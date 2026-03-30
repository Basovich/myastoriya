import React from "react";
import Image from "next/image";
import Link from "next/link";
import s from "./StoreCard.module.scss";
import Button from "@/app/components/ui/Button/Button";

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
                        width={164}
                        height={76}
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
                        <Button 
                            variant="black" 
                            href={`/our-stores/${store.id}`} 
                            className={s.detailsBtnFull}
                        >
                            {dict.details}
                        </Button>
                        <Button 
                            variant="black"
                            className={s.routeBtnFull}
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`, '_blank')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M11.9958 3.49304C11.9987 3.4551 11.9987 3.417 11.9958 3.37906L10.7962 0.379426C10.7494 0.260854 10.666 0.160294 10.5581 0.0923342C10.4503 0.0243742 10.3236 -0.00745224 10.1964 0.00147186H1.79937C1.67924 0.00135554 1.56185 0.0373203 1.4624 0.104708C1.36294 0.172095 1.28601 0.2678 1.24156 0.379426L0.0419852 3.37906C0.039094 3.417 0.039094 3.4551 0.0419852 3.49304C0.0220547 3.52644 0.00786297 3.56294 0 3.60103C0.00667601 4.01572 0.120693 4.42161 0.330931 4.77909C0.541168 5.13658 0.840448 5.43346 1.19958 5.64078V11.4001C1.19958 11.5592 1.26277 11.7118 1.37525 11.8243C1.48774 11.9368 1.64029 12 1.79937 12H10.1964C10.3555 12 10.5081 11.9368 10.6205 11.8243C10.733 11.7118 10.7962 11.5592 10.7962 11.4001V5.66478C11.1588 5.45539 11.4603 5.15473 11.6708 4.79269C11.8812 4.43064 11.9933 4.01981 11.9958 3.60103C12.0014 3.56525 12.0014 3.52882 11.9958 3.49304ZM6.59768 10.8001H5.3981V8.40044H6.59768V10.8001ZM9.59663 10.8001H7.79726V7.80052C7.79726 7.64141 7.73407 7.48881 7.62159 7.3763C7.5091 7.2638 7.35655 7.20059 7.19747 7.20059H4.79831C4.63924 7.20059 4.48668 7.2638 4.3742 7.3763C4.26172 7.48881 4.19853 7.64141 4.19853 7.80052V10.8001H2.39916V6.00074C2.74072 5.99881 3.07793 5.92395 3.38824 5.78118C3.69855 5.6384 3.9748 5.431 4.19853 5.17284C4.42367 5.42818 4.70055 5.63269 5.01079 5.77276C5.32103 5.91284 5.65751 5.98529 5.99789 5.98529C6.33827 5.98529 6.67476 5.91284 6.985 5.77276C7.29523 5.63269 7.57212 5.42818 7.79726 5.17284C8.02098 5.431 8.29724 5.6384 8.60755 5.78118C8.91786 5.92395 9.25507 5.99881 9.59663 6.00074V10.8001ZM9.59663 4.80088C9.27848 4.80088 8.97336 4.67447 8.7484 4.44945C8.52343 4.22444 8.39705 3.91925 8.39705 3.60103C8.39705 3.44192 8.33386 3.28933 8.22138 3.17682C8.10889 3.06431 7.95634 3.0011 7.79726 3.0011C7.63819 3.0011 7.48563 3.06431 7.37315 3.17682C7.26066 3.28933 7.19747 3.44192 7.19747 3.60103C7.19747 3.91925 7.07109 4.22444 6.84612 4.44945C6.62116 4.67447 6.31604 4.80088 5.99789 4.80088C5.67975 4.80088 5.37463 4.67447 5.14966 4.44945C4.9247 4.22444 4.79831 3.91925 4.79831 3.60103C4.79831 3.44192 4.73512 3.28933 4.62264 3.17682C4.51016 3.06431 4.3576 3.0011 4.19853 3.0011C4.03945 3.0011 3.88689 3.06431 3.77441 3.17682C3.66193 3.28933 3.59874 3.44192 3.59874 3.60103C3.60464 3.7586 3.57946 3.91579 3.52464 4.06362C3.46981 4.21145 3.38641 4.34704 3.2792 4.46263C3.17198 4.57823 3.04306 4.67157 2.89978 4.73733C2.7565 4.80308 2.60167 4.83997 2.44414 4.84588C2.12599 4.85781 1.81614 4.74284 1.58274 4.52626C1.46717 4.41903 1.37385 4.29007 1.30811 4.14676C1.24236 4.00345 1.20549 3.84859 1.19958 3.69102L2.20722 1.20132H9.78856L10.7962 3.69102C10.7735 3.99339 10.6371 4.27594 10.4146 4.48185C10.192 4.68775 9.89979 4.80174 9.59663 4.80088Z" fill="white"/>
                            </svg>
                            {dict.route}
                        </Button>
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
