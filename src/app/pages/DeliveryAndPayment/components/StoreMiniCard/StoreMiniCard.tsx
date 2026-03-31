import React from 'react';
import s from './StoreMiniCard.module.scss';
import Image from 'next/image';
import clsx from 'clsx';
import { Store } from '@/app/components/OurStores/StoreCard/StoreCard';

interface StoreMiniCardProps {
    store?: Store & { secondaryAddress?: string; kitchenHours?: string; region?: string };
    isPromo?: boolean;
}

const LogoM = ({ color = "white" }: { color?: string }) => (
    <svg width="24" height="31" viewBox="0 0 24 31" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M17.7491 18.4851C17.2632 19.1503 15.4979 21.3542 13.3362 21.5779C13.2098 21.5899 13.0841 21.5966 12.9629 21.5966C8.94665 21.5966 8.63435 14.9462 8.63435 12.9074V8.87313L8.81812 9.0441C10.0583 10.1988 10.2982 11.3742 10.2778 12.7833C10.3244 13.699 11.9719 14.1118 11.5933 14.1118C12.2246 14.1118 12.91 13.6905 12.9213 12.7654C12.9405 11.3083 13.0487 10.3308 14.3891 9.04556L14.5735 8.86815V17.0664C14.5735 17.8229 15.1615 18.416 15.9114 18.416C16.6741 18.416 17.2484 17.8352 17.2484 17.0664V6.82437C17.2484 6.16858 16.7604 5.59711 16.1138 5.49581C16.0175 5.47912 15.9181 5.47063 15.8169 5.47063C14.3665 5.47063 12.5229 7.12943 11.7012 8.17547L11.6151 8.28496L11.5291 8.17489C10.7169 7.1306 8.87919 5.47268 7.40552 5.47268C7.21622 5.47268 7.03652 5.50108 6.87223 5.55729C6.34796 5.7347 5.98187 6.25612 5.98187 6.82437V13.0517C5.98187 13.4165 5.99263 13.8047 6.01095 14.1455C6.25142 18.5762 7.60325 23.9311 12.6747 24.2783C12.8 24.2865 12.9233 24.2906 13.044 24.2906C14.0443 24.2906 14.962 23.9961 15.8503 23.3898L16.2152 23.1404L16.0082 23.5327C15.1571 25.1423 13.5235 27.86 12.1507 27.9712C12.1054 27.9777 12.0527 27.9812 12.0001 27.9812C9.83614 27.9818 6.32528 21.9954 5.35582 19.7203C4.14241 16.8773 3.17528 13.6261 2.89293 11.4395L2.84728 11.1028C2.528 8.76861 2.29742 7.082 4.46866 5.78038C4.57799 5.7148 5.16653 5.36846 5.38839 5.25428C7.48636 4.17018 12.7029 2.65747 16.4342 2.65747C18.6775 2.65747 20.0259 3.1903 20.4408 4.24015C21.9572 7.49772 19.8066 15.9434 17.7491 18.4851ZM21.3225 1.20677C20.2271 0.406063 18.5513 0 16.3414 0C11.7643 0 6.05659 1.75277 3.18312 3.44729C0.0165439 5.29726 -0.310582 7.91661 0.189266 11.5437C0.511449 13.7956 1.41548 17.4522 2.98656 20.9595C3.43145 21.9537 7.46861 30.6743 12.0458 30.6743H12.0463C12.1182 30.6743 12.1897 30.6716 12.2621 30.6678C14.841 30.4992 17.3978 27.4711 19.8613 21.6695C20.8281 19.4076 21.6304 17.2309 22.2463 15.1991C23.3448 11.5442 24.3521 6.51193 22.909 3.28685C22.5263 2.42466 22.1433 1.80723 21.3225 1.20677Z" fill={color}/>
    </svg>
);

export default function StoreMiniCard({ store, isPromo = false }: StoreMiniCardProps) {
    if (isPromo) {
        return (
            <div className={clsx(s.card, s.promo)}>
                <div className={s.promoInner}>
                    <div className={s.promoText}>
                        <h3>ДО 3 КМ БЕЗКОШТОВНА ДОСТАВКА</h3>
                        <p>від магазину-ресторану</p>
                    </div>
                    <div className={s.logoCircleWhite}>
                        <LogoM color="#E6000F" />
                    </div>
                </div>
            </div>
        );
    }

    if (!store) return null;

    return (
        <div className={s.card}>
            <div className={s.header}>
                <div className={s.titleGroup}>
                    <h4 className={s.name}>{store.name}</h4>
                    <span className={s.region}>{store.region}</span>
                </div>
                <div className={s.logoCircleBlack}>
                    <LogoM color="white" />
                </div>
            </div>

            <div className={s.content}>
                <div className={s.row}>
                    <Image src="/icons/contacts/address.svg" alt="Address" width={16} height={16} className={s.icon} />
                    <div className={s.textCol}>
                        <p>{store.address}</p>
                        {store.secondaryAddress && <span className={s.subText}>{store.secondaryAddress}</span>}
                    </div>
                </div>
                
                <div className={s.row}>
                    <Image src="/icons/contacts/time.svg" alt="Time" width={16} height={16} className={s.icon} />
                    <div className={s.textCol}>
                        <p>{store.workingHours}</p>
                        {store.kitchenHours && <span className={s.subText}>{store.kitchenHours}</span>}
                    </div>
                </div>

                <div className={s.row}>
                    <Image src="/icons/contacts/phone.svg" alt="Phone" width={16} height={16} className={s.icon} />
                    <div className={s.textCol}>
                        <p>{store.phone}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
