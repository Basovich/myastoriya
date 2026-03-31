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
            <div className={s.cardColumns}>
                <div className={s.logoAndName}>
                    <div className={s.logoCircle}>
                        <svg width="27" height="36" viewBox="0 0 27 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M20.2803 21.126C19.725 21.8862 17.7075 24.4049 15.2371 24.6605C15.0925 24.6743 14.9489 24.682 14.8104 24.682C10.2204 24.682 9.86347 17.0815 9.86347 14.7514V10.1408L10.0735 10.3362C11.4908 11.6558 11.765 12.9992 11.7417 14.6096C11.7949 15.6562 12.535 16.1279 13.2451 16.1279C13.9666 16.1279 14.7499 15.6465 14.7628 14.5892C14.7848 12.9239 14.9084 11.8067 16.4404 10.3379L16.6511 10.1351V19.5046C16.6511 20.3691 17.323 21.047 18.1801 21.047C19.0517 21.047 19.7081 20.3832 19.7081 19.5046V7.79939C19.7081 7.04992 19.1504 6.39681 18.4114 6.28104C18.3014 6.26197 18.1877 6.25227 18.0721 6.25227C16.4145 6.25227 14.3076 8.14803 13.3684 9.34351L13.2701 9.46865L13.1717 9.34284C12.2435 8.14937 10.1433 6.25461 8.45909 6.25461C8.24275 6.25461 8.03738 6.28706 7.84962 6.3513C7.25045 6.55406 6.83206 7.14996 6.83206 7.79939V14.9164C6.83206 15.3333 6.84435 15.7769 6.86529 16.1664C7.14012 21.23 8.68506 27.35 14.481 27.7468C14.6243 27.7561 14.7652 27.7608 14.9031 27.7608C16.0462 27.7608 17.095 27.4242 18.1103 26.7313L18.5273 26.4462L18.2907 26.8946C17.318 28.7341 15.4511 31.8401 13.8822 31.9672C13.8303 31.9746 13.7702 31.9786 13.71 31.9786C11.2369 31.9793 7.22453 25.1377 6.11658 22.5376C4.72981 19.2884 3.62452 15.5728 3.30184 13.0738L3.24967 12.689C2.88478 10.0214 2.62125 8.09383 5.10267 6.60626C5.22763 6.53131 5.90024 6.13549 6.1538 6.00501C8.55147 4.76603 14.5133 3.03722 18.7776 3.03722C21.3414 3.03722 22.8824 3.64617 23.3566 4.846C25.0896 8.56894 22.6318 18.2211 20.2803 21.126ZM24.3685 1.37917C23.1167 0.464071 21.2015 0 18.6759 0C13.4449 0 6.92182 2.00317 3.63785 3.93976C0.0189073 6.05401 -0.354951 9.04755 0.216304 13.1927C0.584513 15.7664 1.61769 19.9454 3.41321 23.9537C3.92165 25.09 8.53556 35.0563 13.7666 35.0563H13.7672C13.8493 35.0563 13.9311 35.0533 14.0138 35.0489C16.9612 34.8562 19.8832 31.3956 22.6986 24.7651C23.8036 22.1801 24.7205 19.6924 25.4243 17.3704C26.6798 13.1934 27.831 7.44221 26.1817 3.7564C25.7443 2.77105 25.3067 2.0654 24.3685 1.37917Z" fill="white"/>
                        </svg>
                    </div>

                    <div className={s.nameWrapper}>
                        <h4 className={s.name}>{store.name.toUpperCase()}</h4>
                        <div className={`${s.statusBadge} ${isOpen ? s.open : s.closed}`}>
                            {isOpen ? dict.open : dict.closed}
                        </div>
                    </div>
                </div>

                <div className={s.detailsRow}>
                    <div className={s.detailCol}>
                        <div className={s.iconWrapper}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#E3051B"/>
                            </svg>
                        </div>
                        <div className={s.textWrapper}>
                            <label>{dict.address.toUpperCase()}</label>
                            <p>{store.address}</p>
                        </div>
                    </div>

                    <div className={s.detailCol}>
                        <div className={s.iconWrapper}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#E3051B"/>
                                <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#E3051B"/>
                            </svg>
                        </div>
                        <div className={s.textWrapper}>
                            <label>{dict.workingHoursLabel.toUpperCase()}</label>
                            <p>{store.workingHours}</p>
                        </div>
                    </div>

                    <div className={s.detailCol}>
                        <div className={s.iconWrapper}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.62 10.79c1.44 2.82 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#E3051B"/>
                            </svg>
                        </div>
                        <div className={s.textWrapper}>
                            <label>{dict.phoneLabel.toUpperCase()}</label>
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
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#E3051B"/>
                        </svg>
                    </a>
                    <Link href={`/our-stores/${store.id}`} className={s.detailsBtn}>
                        <svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.98467 0.999945L16.3131 7.32837L9.98467 13.6568" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <line x1="15" y1="7.17163" x2="1" y2="7.17163" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </Link>

                </div>
            </div>
        </div>
    );
}

