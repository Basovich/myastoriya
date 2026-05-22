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
    workingHours: string[];
    phone: string;
    email: string;
    lat: number;
    lng: number;
    image: string;
    mapUrl: string;
    isOpen?: boolean;
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
    // Determine if store is open based on status from data
    const isOpen = store.isOpen ?? true; 

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
                        src={store.image && store.image !== "/images/store/herobanner.png" ? store.image : "/images/store/map-point.png"} 
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
                        <div className={s.hoursLines}>
                            {store.workingHours.map((hours, idx) => (
                                <span key={idx} className={s.hoursLine}>{hours}</span>
                            ))}
                        </div>
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
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.lat && store.lng ? `${store.lat},${store.lng}` : encodeURIComponent(store.address)}`, '_blank')}
                        >
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
                        <Link href={`/our-stores/${store.id}`} className={s.nameLink}>
                            <h4 className={s.name}>{store.name.toUpperCase()}</h4>
                        </Link>
                        <div className={`${s.statusBadge} ${isOpen ? s.open : s.closed}`}>
                            {isOpen ? dict.open : dict.closed}
                        </div>
                    </div>
                </div>

                <div className={s.detailsRow}>
                    <div className={s.detailCol}>
                        <div className={s.textWrapper}>
                            <div className={s.iconWrapper}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 12 14" fill="none">
                                    <path d="M11.9715 5.34804C11.8724 4.33152 11.5079 3.35762 10.9136 2.52116C10.3192 1.68471 9.51521 1.01422 8.57988 0.574981C7.64456 0.13574 6.60977 -0.0572795 5.57629 0.0147167C4.5428 0.0867129 3.54585 0.421271 2.6825 0.985814C1.94079 1.47467 1.31812 2.11937 0.859242 2.8736C0.400361 3.62784 0.116652 4.47289 0.0284947 5.34804C-0.0579846 6.21747 0.0529694 7.09496 0.353307 7.91687C0.653644 8.73877 1.13583 9.48448 1.76489 10.0999L5.5059 13.7942C5.57152 13.8594 5.64959 13.9112 5.7356 13.9465C5.82162 13.9818 5.91388 14 6.00706 14C6.10024 14 6.1925 13.9818 6.27851 13.9465C6.36453 13.9112 6.4426 13.8594 6.50821 13.7942L10.2351 10.0999C10.8642 9.48448 11.3464 8.73877 11.6467 7.91687C11.947 7.09496 12.058 6.21747 11.9715 5.34804ZM9.24692 9.1189L6 12.3193L2.75308 9.1189C2.27458 8.64723 1.90804 8.07692 1.67981 7.44898C1.45159 6.82103 1.36734 6.15105 1.43314 5.48719C1.49936 4.8131 1.71673 4.16193 2.06951 3.58078C2.4223 2.99962 2.9017 2.503 3.47305 2.12681C4.22192 1.63649 5.10096 1.37493 6 1.37493C6.89904 1.37493 7.77808 1.63649 8.52695 2.12681C9.09656 2.50154 9.57491 2.99597 9.92761 3.57458C10.2803 4.15319 10.4986 4.80162 10.5669 5.47327C10.6348 6.13938 10.5516 6.81205 10.3233 7.44257C10.095 8.07309 9.72737 8.64569 9.24692 9.1189ZM6 2.82254C5.37178 2.82254 4.75767 3.00616 4.23532 3.35017C3.71298 3.69419 3.30586 4.18315 3.06545 4.75523C2.82504 5.3273 2.76214 5.9568 2.8847 6.56411C3.00726 7.17143 3.30978 7.72928 3.75399 8.16713C4.19821 8.60497 4.76418 8.90315 5.38033 9.02396C5.99648 9.14476 6.63513 9.08276 7.21553 8.8458C7.79593 8.60883 8.292 8.20755 8.64102 7.6927C8.99004 7.17784 9.17633 6.57254 9.17633 5.95333C9.17447 5.12356 8.83922 4.3283 8.24395 3.74156C7.64867 3.15482 6.84184 2.82438 6 2.82254ZM6 7.69265C5.65099 7.69265 5.30982 7.59064 5.01963 7.39952C4.72943 7.2084 4.50326 6.93676 4.3697 6.61894C4.23614 6.30112 4.20119 5.9514 4.26928 5.614C4.33737 5.27661 4.50543 4.96669 4.75222 4.72344C4.99901 4.48019 5.31343 4.31453 5.65574 4.24742C5.99804 4.18031 6.35285 4.21475 6.67529 4.3464C6.99774 4.47804 7.27334 4.70098 7.46724 4.98701C7.66114 5.27304 7.76463 5.60932 7.76463 5.95333C7.76463 6.41462 7.57871 6.85703 7.24778 7.18322C6.91685 7.5094 6.46801 7.69265 6 7.69265Z" fill="black"/>
                                </svg>
                            </div>
                            <p className={s.label}>{dict.address.toUpperCase()}</p>
                        </div>
                        <a 
                            href={store.mapUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={s.addressLink}
                        >
                            {store.address}
                        </a>
                    </div>

                    <div className={s.detailCol}>
                        <div className={s.textWrapper}>
                            <div className={s.iconWrapper}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M7.5 1.125C3.98475 1.125 1.125 3.98475 1.125 7.5C1.125 11.0153 3.98475 13.875 7.5 13.875C11.0153 13.875 13.875 11.0153 13.875 7.5C13.875 3.98475 11.0153 1.125 7.5 1.125M7.5 15C3.3645 15 0 11.6355 0 7.5C0 3.3645 3.3645 0 7.5 0C11.6355 0 15 3.3645 15 7.5C15 11.6355 11.6355 15 7.5 15" fill="black"/>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M10.0736 10.2693C9.97534 10.2693 9.87634 10.2438 9.78559 10.1905L6.95809 8.50378C6.78859 8.40178 6.68359 8.21803 6.68359 8.02003V4.38403C6.68359 4.07353 6.93559 3.82153 7.24609 3.82153C7.55734 3.82153 7.80859 4.07353 7.80859 4.38403V7.70053L10.3623 9.22303C10.6286 9.38278 10.7163 9.72778 10.5573 9.99478C10.4516 10.171 10.2648 10.2693 10.0736 10.2693" fill="black"/>
                                </svg>
                            </div>
                            <p className={s.label}>{dict.workingHoursLabel.toUpperCase()}</p>
                        </div>
                        <div className={s.hoursList}>
                            {store.workingHours.map((hours, idx) => (
                                <p key={idx} className={s.value}>{hours}</p>
                            ))}
                        </div>
                    </div>

                    <div className={s.detailCol}>
                        <div className={s.textWrapper}>
                            <div className={s.iconWrapper}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                    <path d="M3.75 0C4.20822 4.87563e-08 4.58283 0.374823 4.58301 0.833008C4.58301 1.87467 4.75026 2.87526 5.05859 3.80859C5.15012 4.10018 5.08286 4.42495 4.84961 4.6582L3.0166 6.49121C4.2166 8.84954 6.15046 10.7751 8.50879 11.9834L10.3418 10.1504C10.5085 9.99206 10.7169 9.9082 10.9336 9.9082C11.0168 9.90822 11.1082 9.91695 11.1914 9.9502C12.1247 10.2585 13.1337 10.4248 14.167 10.4248C14.6252 10.425 15 10.8006 15 11.2588V14.167C14.9998 14.6251 14.6251 14.9998 14.167 15C6.34199 15 0 8.65801 0 0.833008C0.000177453 0.374931 0.374931 0.000177453 0.833008 0H3.75ZM10.167 12.6748C11.1752 13.0081 12.2332 13.2248 13.333 13.2998V12.0586C12.5999 12.0086 11.8751 11.8835 11.167 11.6836L10.167 12.6748ZM1.69141 1.66699C1.76643 2.76688 1.98356 3.82529 2.3252 4.8252L3.3252 3.8252C3.12523 3.13363 3.00021 2.40854 2.9502 1.66699H1.69141Z" fill="black"/>
                                </svg>
                            </div>
                            <p className={s.label}>{dict.phoneLabel.toUpperCase()}</p>
                        </div>
                        <a 
                            href={`tel:${store.phone.replace(/\s+/g, "")}`} 
                            className={s.phoneLink}
                        >
                            {store.phone}
                        </a>
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

