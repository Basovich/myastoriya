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
import DeleteAddressModal from './DeleteAddressModal';
import Spinner from '@/app/components/ui/Spinner/Spinner';
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
        addressTitle: (index: number) => `Моя адреса №${index}`,
        formatAddress: (city: string, street?: string, house?: string, apartment?: string | number) => {
            const streetStr = street ? (street.startsWith('вул.') ? street : `вул. ${street}`) : '';
            const houseStr = house ? `, буд. ${house}` : '';
            const aptStr = apartment ? `, кв. ${apartment}` : '';
            return `${city}, ${streetStr}${houseStr}${aptStr}`;
        },
        deleteLabel: "Видалити",
    },
    ru: {
        subtitle: "Ваш список",
        addAddress: "Добавить адрес",
        makePrimary: "СДЕЛАТЬ ОСНОВНЫМ",
        primary: "ОСНОВНОЙ",
        deleteConfirm: "Вы уверены, что хотите удалить этот адрес?",
        loading: "Загрузка...",
        error: "Ошибка при загрузке адресов",
        addressTitle: (index: number) => `Мой адрес №${index}`,
        formatAddress: (city: string, street?: string, house?: string, apartment?: string | number) => {
            const streetStr = street ? (street.startsWith('ул.') ? street : `ул. ${street}`) : '';
            const houseStr = house ? `, дом ${house}` : '';
            const aptStr = apartment ? `, кв. ${apartment}` : '';
            return `${city}, ${streetStr}${houseStr}${aptStr}`;
        },
        deleteLabel: "Удалить",
    }
};

export default function AddressesClient({ user, lang }: AddressesClientProps) {
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
    
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

    const handleDelete = (id: string) => {
        setAddressToDelete(id);
    };

    const confirmDeleteAddress = async () => {
        if (!addressToDelete) return;
        
        try {
            const token = await getAccessToken();
            if (token) {
                const address = addresses.find(a => a.id === addressToDelete);
                const wasDefault = address?.isDefault;

                const success = await deleteUserAddressApi(addressToDelete, token);
                if (success) {
                    const remainingAddresses = addresses.filter(a => a.id !== addressToDelete);
                    if (wasDefault && remainingAddresses.length > 0) {
                        const firstAddressId = remainingAddresses[0].id;
                        await markUserAddressAsDefaultApi(firstAddressId, token);
                        setAddresses(remainingAddresses.map((a, idx) => ({
                            ...a,
                            isDefault: idx === 0
                        })));
                    } else {
                        setAddresses(remainingAddresses);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to delete address:', error);
            alert('Помилка при видаленні адреси');
        } finally {
            setAddressToDelete(null);
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
                    streetId: data.streetId ? parseInt(data.streetId, 10) : undefined,
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

                {isLoading ? (
                    <Spinner />
                ) : (
                    <div className={s.grid}>
                        {addresses.map((address, index) => (
                            <div key={address.id} className={clsx(s.card, address.isDefault && s.defaultCard)}>
                                <div className={s.cardHeader}>
                                    <span className={s.cardTitle}>{dict.addressTitle(index + 1)}</span>
                                    <button 
                                        className={s.deleteBtn}
                                        onClick={() => handleDelete(address.id)}
                                        aria-label={dict.deleteLabel}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 12 14" fill="none">
                                            <path d="M11.3333 2.8H8.66667V2.1C8.66667 1.54305 8.45595 1.0089 8.08088 0.615076C7.70581 0.221249 7.1971 0 6.66667 0H5.33333C4.8029 0 4.29419 0.221249 3.91912 0.615076C3.54405 1.0089 3.33333 1.54305 3.33333 2.1V2.8H0.666667C0.489856 2.8 0.320286 2.87375 0.195262 3.00503C0.0702379 3.1363 0 3.31435 0 3.5C0 3.68565 0.0702379 3.8637 0.195262 3.99497C0.320286 4.12625 0.489856 4.2 0.666667 4.2H1.33333V11.9C1.33333 12.457 1.54405 12.9911 1.91912 13.3849C2.29419 13.7788 2.8029 14 3.33333 14H8.66667C9.1971 14 9.70581 13.7788 10.0809 13.3849C10.456 12.9911 10.6667 12.457 10.6667 11.9V4.2H11.3333C11.5101 4.2 11.6797 4.12625 11.8047 3.99497C11.9298 3.8637 12 3.68565 12 3.5C12 3.31435 11.9298 3.1363 11.8047 3.00503C11.6797 2.87375 11.5101 2.8 11.3333 2.8ZM4.66667 2.1C4.66667 1.91435 4.7369 1.7363 4.86193 1.60503C4.98695 1.47375 5.15652 1.4 5.33333 1.4H6.66667C6.84348 1.4 7.01305 1.47375 7.13807 1.60503C7.2631 1.7363 7.33333 1.91435 7.33333 2.1V2.8H4.66667V2.1ZM9.33333 11.9C9.33333 12.0857 9.2631 12.2637 9.13807 12.395C9.01305 12.5263 8.84348 12.6 8.66667 12.6H3.33333C3.15652 12.6 2.98695 12.5263 2.86193 12.395C2.7369 12.2637 2.66667 12.0857 2.66667 11.9V4.2H9.33333V11.9Z" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className={s.cardBody}>
                                    <p className={s.addressText}>
                                        {dict.formatAddress(address.city, address.street, address.house, address.apartment)}
                                    </p>
                                </div>

                                <div className={s.cardFooter}>
                                    {address.isDefault ? (
                                        <div className={s.primaryTag}>
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
                )}
            </PersonalContentBlock>

            <AddAddressModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddAddress}
            />

            <DeleteAddressModal
                isOpen={addressToDelete !== null}
                onClose={() => setAddressToDelete(null)}
                onConfirm={confirmDeleteAddress}
                lang={lang}
            />
        </div>
    );
}
