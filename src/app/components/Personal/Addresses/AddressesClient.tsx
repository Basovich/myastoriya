'use client';

import React, { useState, useEffect } from 'react';
import PersonalPageHeader from '../Shared/PersonalPageHeader';
import PersonalContentBlock from '../Shared/PersonalContentBlock';
import { AuthUser } from '@/store/slices/authSlice';
import { personalDict } from '../Shared/PersonalShared';
import { 
    UserAddress, 
    getUserAddressesApi, 
    deleteUserAddressApi, 
    markUserAddressAsDefaultApi,
    createUserAddressApi
} from '@/lib/graphql/queries/addresses';
import { getAccessToken } from '@/app/actions/authActions';
import AddAddressModal from '@/app/components/AddAddressModal/AddAddressModal';
import s from './AddressesClient.module.scss';
import clsx from 'clsx';
import * as Sentry from "@sentry/nextjs";

interface AddressesClientProps {
    user: AuthUser | null;
    lang: 'ua' | 'ru';
}

const localDict = {
    ua: {
        subtitle: "Ваш список",
        addAddress: "Додати адресу",
        makePrimary: "ЗРОБИТИ ОСНОВНОЮ",
        primary: "ОСНОВНА",
        deleteConfirm: "Ви впевнені, що хочете видалити цю адресу?",
        loading: "Завантаження...",
        error: "Помилка при завантаженні адрес",
    },
    ru: {
        subtitle: "Ваш список",
        addAddress: "Добавить адрес",
        makePrimary: "СДЕЛАТЬ ОСНОВНЫМ",
        primary: "ОСНОВНОЙ",
        deleteConfirm: "Вы уверены, что хотите удалить этот адрес?",
        loading: "Загрузка...",
        error: "Ошибка при загрузке адресов",
    }
};

export default function AddressesClient({ user, lang }: AddressesClientProps) {
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const pDict = personalDict[lang];
    const dict = localDict[lang];

    const fetchAddresses = async () => {
        try {
            setIsLoading(true);
            const token = await getAccessToken();
            if (token) {
                const data = await getUserAddressesApi(token);
                setAddresses(data);
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
            Sentry.captureException(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleLogout = () => {
        // Handled by layout or parent
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(dict.deleteConfirm)) return;
        
        try {
            const token = await getAccessToken();
            if (token) {
                const success = await deleteUserAddressApi(id, token);
                if (success) {
                    setAddresses(prev => prev.filter(a => a.id !== id));
                }
            }
        } catch (error) {
            console.error('Failed to delete address:', error);
            alert('Помилка при видаленні адреси');
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const token = await getAccessToken();
            if (token) {
                const success = await markUserAddressAsDefaultApi(id, token);
                if (success) {
                    setAddresses(prev => prev.map(a => ({
                        ...a,
                        isDefault: a.id === id
                    })));
                }
            }
        } catch (error) {
            console.error('Failed to set default address:', error);
            alert('Помилка при встановленні адреси за замовчуванням');
        }
    };

    const handleAddAddress = async (data: any) => {
        try {
            const token = await getAccessToken();
            if (token) {
                const newAddress = await createUserAddressApi({
                    city: data.city || 'Київ',
                    street: data.street,
                    house: data.house || '',
                    apartment: data.apartment ? parseInt(data.apartment, 10) : undefined,
                    entrance: data.entrance ? parseInt(data.entrance, 10) : undefined,
                    floor: data.floor ? parseInt(data.floor, 10) : undefined,
                    isDefault: addresses.length === 0, // Set as default if it's the first address
                }, token);
                
                setAddresses(prev => [...prev, newAddress]);
            }
        } catch (error) {
            console.error('Failed to create address:', error);
            alert('Помилка при додаванні адреси');
        }
    };

    return (
        <div className={s.addressesPage}>
            <PersonalContentBlock className={s.contentBlock}>
                <PersonalPageHeader 
                    title={pDict.navigation.deliveryAddresses}
                    logoutLabel={pDict.navigation.logout}
                    onLogout={handleLogout}
                    user={user}
                    navDict={pDict.navigation}
                />

                <h2 className={s.subtitle}>{dict.subtitle}</h2>

                <div className={s.grid}>
                    {addresses.map((address) => (
                        <div key={address.id} className={clsx(s.card, address.isDefault && s.defaultCard)}>
                            <div className={s.cardHeader}>
                                <span className={s.cardTitle}>Моя адреса #{address.id.slice(-2)}</span>
                                <button 
                                    className={s.deleteBtn}
                                    onClick={() => handleDelete(address.id)}
                                    aria-label="Видалити"
                                >
                                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                                        <path d="M1 3.8H2.33333M2.33333 3.8H13M2.33333 3.8V14.3C2.33333 14.6448 2.4703 14.9754 2.71409 15.2192C2.95789 15.463 3.28855 15.6 3.63333 15.6H10.3667C10.7115 15.6 11.0421 15.463 11.2859 15.2192C11.5297 14.9754 11.6667 14.6448 11.6667 14.3V3.8M4.33333 3.8V2.4C4.33333 2.05522 4.4703 1.72456 4.71409 1.48076C4.95789 1.23696 5.28855 1.1 5.63333 1.1H8.36667C8.71145 1.1 9.04211 1.23696 9.28591 1.48076C9.5297 1.72456 9.66667 2.05522 9.66667 2.4V3.8M5.66667 7.3V12.2M8.33333 7.3V12.2" stroke="#999" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                            
                            <div className={s.cardBody}>
                                <p className={s.addressText}>
                                    {address.city}, {address.street}, дім {address.house}
                                    {address.apartment && `, кв. ${address.apartment}`}
                                </p>
                            </div>

                            <div className={s.cardFooter}>
                                {address.isDefault ? (
                                    <div className={s.primaryTag}>
                                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                            <path d="M1 5.5L4 8.5L11 1.5" stroke="#E6000F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span>{dict.primary}</span>
                                    </div>
                                ) : (
                                    <button 
                                        className={s.setPrimaryBtn}
                                        onClick={() => handleSetDefault(address.id)}
                                    >
                                        {dict.makePrimary}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    <button 
                        className={s.addCard}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <div className={s.plusCircle}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M7 1V13M1 7H13" stroke="#999" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span>{dict.addAddress}</span>
                    </button>
                </div>
            </PersonalContentBlock>

            <AddAddressModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddAddress}
            />
        </div>
    );
}
