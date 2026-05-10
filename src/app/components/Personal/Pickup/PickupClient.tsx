'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import PersonalPageHeader from '../Shared/PersonalPageHeader';
import PersonalContentBlock from '../Shared/PersonalContentBlock';
import { AuthUser } from '@/store/slices/authSlice';
import { personalDict } from '../Shared/PersonalShared';
import s from './PickupClient.module.scss';
import clsx from 'clsx';

interface PickupClientProps {
    user: AuthUser | null;
    lang: 'ua' | 'ru';
}

interface PickupPoint {
    id: string;
    address: string;
    hours: string;
    isDefault: boolean;
}

const localDict = {
    ua: {
        subtitle: "Ваші точки самовивозу",
        addPoint: "Додати точку",
        makePrimary: "ЗРОБИТИ ОСНОВНОЮ",
        primary: "ОСНОВНА",
        storeName: "Заклад М'ясторія",
    },
    ru: {
        subtitle: "Ваши точки самовывоза",
        addPoint: "Добавить точку",
        makePrimary: "СДЕЛАТЬ ОСНОВНЫМ",
        primary: "ОСНОВНОЙ",
        storeName: "Заведение Мястория",
    }
};

const MOCK_POINTS: PickupPoint[] = [
    {
        id: '1',
        address: 'вул. Антонова, дім 45, кв. 34',
        hours: 'Пн-Вс: 10:00-22:00',
        isDefault: true
    },
    {
        id: '2',
        address: 'вул. Антонова, дім 45, кв. 34',
        hours: 'Пн-Вс: 10:00-22:00',
        isDefault: false
    },
    {
        id: '3',
        address: 'вул. Антонова, дім 45, кв. 34',
        hours: 'Пн-Вс: 10:00-22:00',
        isDefault: false
    },
    {
        id: '4',
        address: 'вул. Антонова, дім 45, кв. 34',
        hours: 'Пн-Вс: 10:00-22:00',
        isDefault: false
    },
    {
        id: '5',
        address: 'вул. Антонова, дім 45, кв. 34',
        hours: 'Пн-Вс: 10:00-22:00',
        isDefault: false
    }
];

import AddPickupModal from './AddPickupModal';

interface Store {
    id: string;
    name: string;
    address: string;
    hours: string;
    lat: number;
    lng: number;
}

export default function PickupClient({ user, lang }: PickupClientProps) {
    const [points, setPoints] = useState<PickupPoint[]>(MOCK_POINTS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const pDict = personalDict[lang];
    const dict = localDict[lang];

    const handleSetDefault = (id: string) => {
        setPoints(prev => prev.map(p => ({
            ...p,
            isDefault: p.id === id
        })));
    };

    const handleDelete = (id: string) => {
        if (window.confirm(lang === 'ua' ? 'Ви впевнені?' : 'Вы уверены?')) {
            setPoints(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleAddStore = (store: Store) => {
        const newPoint: PickupPoint = {
            id: store.id + Math.random(),
            address: store.address,
            hours: store.hours,
            isDefault: points.length === 0
        };
        setPoints(prev => [...prev, newPoint]);
    };

    const handleLogout = () => {
        // Handled by layout
    };

    return (
        <div className={s.pickupPage}>
            <PersonalContentBlock className={s.contentBlock}>
                <PersonalPageHeader 
                    title={pDict.navigation.pickupPoints}
                    logoutLabel={pDict.navigation.logout}
                    onLogout={handleLogout}
                    user={user}
                    navDict={pDict.navigation}
                />

                <h2 className={s.subtitle}>{dict.subtitle}</h2>

                <div className={s.grid}>
                    {points.map((point) => (
                        <div key={point.id} className={clsx(s.card, point.isDefault && s.defaultCard)}>
                            <div className={s.cardHeader}>
                                <div className={s.storeInfo}>
                                    <div className={s.storeLogo}>
                                        <Image 
                                            src="/icons/logo-red.svg" 
                                            alt="Logo" 
                                            width={14} 
                                            height={14} 
                                        />
                                    </div>
                                    <span className={s.storeName}>{dict.storeName}</span>
                                </div>
                                <button 
                                    className={s.deleteBtn}
                                    onClick={() => handleDelete(point.id)}
                                    aria-label="Delete"
                                >
                                    <Image 
                                        src="/icons/icon-trash.svg" 
                                        alt="Delete" 
                                        width={12} 
                                        height={14} 
                                    />
                                </button>
                            </div>
                            
                            <div className={s.cardBody}>
                                <p className={s.addressText}>{point.address}</p>
                                <p className={s.hoursText}>{point.hours}</p>
                            </div>

                            <div className={s.cardFooter}>
                                {point.isDefault ? (
                                    <div className={s.primaryTag}>
                                        <span>{dict.primary}</span>
                                    </div>
                                ) : (
                                    <button 
                                        className={s.setPrimaryBtn}
                                        onClick={() => handleSetDefault(point.id)}
                                    >
                                        {dict.makePrimary}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    <button className={s.addCard} onClick={() => setIsModalOpen(true)}>
                        <div className={s.plusCircle}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5V19M5 12H19" stroke="#999" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span>{dict.addPoint}</span>
                    </button>
                </div>
            </PersonalContentBlock>

            <AddPickupModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddStore}
                lang={lang}
            />
        </div>
    );
}
