'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import * as Sentry from '@sentry/nextjs';
import PersonalPageHeader from '../Shared/PersonalPageHeader';
import PersonalContentBlock from '../Shared/PersonalContentBlock';
import { AuthUser } from '@/store/slices/authSlice';
import { personalDict } from '../Shared/PersonalShared';
import s from './PickupClient.module.scss';
import clsx from 'clsx';
import { getAccessToken } from '@/app/actions/authActions';
import { 
    getUserPickupPointsApi, 
    addUserPickupPointApi, 
    deleteUserPickupPointApi, 
    markUserPickupPointAsDefaultApi,
    UserPickupPoint,
    getShopsApi,
    Shop
} from '@/lib/graphql';
import AddPickupModal from './AddPickupModal';
import DeletePickupModal from './DeletePickupModal';
import Spinner from '@/app/components/ui/Spinner/Spinner';

interface PickupClientProps {
    user: AuthUser | null;
    lang: 'ua' | 'ru';
}

interface Store {
    id: string;
    name: string;
    address: string;
    hours: string;
    lat: number;
    lng: number;
}

const localDict = {
    ua: {
        subtitle: "Ваші точки самовивозу",
        addPoint: "Додати точку",
        makePrimary: "ЗРОБИТИ ОСНОВНОЮ",
        primary: "ОСНОВНА",
        storeName: "Заклад М'ясторія",
        loading: "Завантаження...",
    },
    ru: {
        subtitle: "Ваши точки самовывоза",
        addPoint: "Добавить точку",
        makePrimary: "СДЕЛАТЬ ОСНОВНЫМ",
        primary: "ОСНОВНОЙ",
        storeName: "Заведение Мястория",
        loading: "Загрузка...",
    }
};

export default function PickupClient({ user, lang }: PickupClientProps) {
    const [points, setPoints] = useState<UserPickupPoint[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pointToDelete, setPointToDelete] = useState<string | null>(null);
    
    const pDict = personalDict[lang];
    const dict = localDict[lang];

    const fetchPoints = async () => {
        try {
            setIsLoading(true);

            try {
                const shopsRes = await getShopsApi({ limit: 100, onlyCompanyStores: true }, lang);
                setShops(shopsRes.shops.data);
            } catch (err) {
                console.error('Failed to fetch shops for mapping:', err);
            }

            const token = await getAccessToken();
            if (token) {
                const data = await getUserPickupPointsApi('brand_store', token, lang);
                setPoints(data);
            }
        } catch (error) {
            console.error('Failed to fetch user pickup points:', error);
            Sentry.captureException(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPoints();
    }, []);

    const handleSetDefault = async (id: string) => {
        try {
            const token = await getAccessToken();
            if (token) {
                const success = await markUserPickupPointAsDefaultApi(parseInt(id, 10), token, lang);
                if (success) {
                    setPoints(prev => prev.map(p => ({
                        ...p,
                        isDefault: p.id === id
                    })));
                }
            }
        } catch (error) {
            console.error('Failed to set default pickup point:', error);
            alert(lang === 'ua' ? 'Помилка при встановленні закладу за замовчуванням' : 'Ошибка при установке заведения по умолчанию');
        }
    };

    const handleDelete = (id: string) => {
        setPointToDelete(id);
    };

    const confirmDeletePoint = async () => {
        if (!pointToDelete) return;
        try {
            const token = await getAccessToken();
            if (token) {
                const success = await deleteUserPickupPointApi(parseInt(pointToDelete, 10), token, lang);
                if (success) {
                    setPoints(prev => prev.filter(p => p.id !== pointToDelete));
                }
            }
        } catch (error) {
            console.error('Failed to delete pickup point:', error);
            alert(lang === 'ua' ? 'Помилка при видаленні закладу' : 'Ошибка при удалении заведения');
        } finally {
            setPointToDelete(null);
        }
    };

    const handleAddStore = async (store: Store) => {
        try {
            const token = await getAccessToken();
            if (token) {
                const newPoint = await addUserPickupPointApi('brand_store', store.id, token, lang);
                setPoints(prev => [...prev, newPoint]);
            }
        } catch (error) {
            console.error('Failed to add pickup point:', error);
            alert(lang === 'ua' ? 'Помилка при додаванні закладу' : 'Ошибка при добавлении заведения');
        }
    };

    const handleLogout = () => {
        // Handled by layout
    };

    const existingShopIds = points
        .map(point => {
            const matchedShop = shops.find(s => s.name === point.name || s.siteName === point.name);
            return matchedShop?.id.toString();
        })
        .filter((id): id is string => !!id);

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

                {isLoading ? (
                    <Spinner />
                ) : (
                    <div className={s.grid}>
                        {points.map((point) => (
                            <div key={point.id} className={clsx(s.card, point.isDefault && s.defaultCard)}>
                                <div className={s.cardHeader}>
                                    <div className={s.storeInfo}>
                                        <span className={s.storeName}>{dict.storeName}</span>
                                        <div className={s.storeLogo}>
                                            <Image 
                                                src="/icons/logo-red.svg" 
                                                alt="Logo" 
                                                width={14} 
                                                height={14} 
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        className={s.deleteBtn}
                                        onClick={() => handleDelete(point.id)}
                                        aria-label="Delete"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 12 14" fill="none">
                                            <path d="M11.3333 2.8H8.66667V2.1C8.66667 1.54305 8.45595 1.0089 8.08088 0.615076C7.70581 0.221249 7.1971 0 6.66667 0H5.33333C4.8029 0 4.29419 0.221249 3.91912 0.615076C3.54405 1.0089 3.33333 1.54305 3.33333 2.1V2.8H0.666667C0.489856 2.8 0.320286 2.87375 0.195262 3.00503C0.0702379 3.1363 0 3.31435 0 3.5C0 3.68565 0.0702379 3.8637 0.195262 3.99497C0.320286 4.12625 0.489856 4.2 0.666667 4.2H1.33333V11.9C1.33333 12.457 1.54405 12.9911 1.91912 13.3849C2.29419 13.7788 2.8029 14 3.33333 14H8.66667C9.1971 14 9.70581 13.7788 10.0809 13.3849C10.456 12.9911 10.6667 12.457 10.6667 11.9V4.2H11.3333C11.5101 4.2 11.6797 4.12625 11.8047 3.99497C11.9298 3.8637 12 3.68565 12 3.5C12 3.31435 11.9298 3.1363 11.8047 3.00503C11.6797 2.87375 11.5101 2.8 11.3333 2.8ZM4.66667 2.1C4.66667 1.91435 4.7369 1.7363 4.86193 1.60503C4.98695 1.47375 5.15652 1.4 5.33333 1.4H6.66667C6.84348 1.4 7.01305 1.47375 7.13807 1.60503C7.2631 1.7363 7.33333 1.91435 7.33333 2.1V2.8H4.66667V2.1ZM9.33333 11.9C9.33333 12.0857 9.2631 12.2637 9.13807 12.395C9.01305 12.5263 8.84348 12.6 8.66667 12.6H3.33333C3.15652 12.6 2.98695 12.5263 2.86193 12.395C2.7369 12.2637 2.66667 12.0857 2.66667 11.9V4.2H9.33333V11.9Z" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className={s.cardBody}>
                                    <p className={s.addressText}>
                                        {(() => {
                                            const matchedShop = shops.find(s => s.name === point.name || s.siteName === point.name);
                                            if (matchedShop?.siteAddress) {
                                                return matchedShop.siteAddress;
                                            }
                                            const parenMatch = point.name.match(/^(.*?)\((.*?)\)$/);
                                            if (parenMatch) {
                                                return parenMatch[2].trim();
                                            }
                                            const commaIndex = point.name.indexOf(',');
                                            if (commaIndex !== -1) {
                                                return point.name.slice(commaIndex + 1).trim();
                                            }
                                            return point.name;
                                        })()}
                                    </p>
                                    <p className={s.hoursText}>
                                        {point.schedule && point.schedule.length > 0 
                                            ? point.schedule.map(s => `${s.days}: ${s.workTime}`).join(', ') 
                                            : ''}
                                    </p>
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
                )}
            </PersonalContentBlock>

            <AddPickupModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddStore}
                lang={lang}
                existingShopIds={existingShopIds}
            />

            <DeletePickupModal
                isOpen={pointToDelete !== null}
                onClose={() => setPointToDelete(null)}
                onConfirm={confirmDeletePoint}
                lang={lang}
            />
        </div>
    );
}
