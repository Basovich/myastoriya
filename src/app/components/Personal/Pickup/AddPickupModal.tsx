'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import Image from 'next/image';
import clsx from 'clsx';
import s from './AddPickupModal.module.scss';
import useScrollLock from '@/hooks/useScrollLock';
import Search from '@/app/components/ui/Search/Search';
import Button from '@/app/components/ui/Button/Button';
import { GOOGLE_MAPS_API_KEY, DARK_MAP_STYLE, GOOGLE_MAPS_LIBRARIES } from '@/lib/constants';

interface Store {
    id: string;
    name: string;
    address: string;
    hours: string;
    lat: number;
    lng: number;
}

interface AddPickupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (store: Store) => void;
    lang: 'ua' | 'ru';
}

const MOCK_STORES: Store[] = [
    {
        id: '101',
        name: 'М\'ЯСТОРІЯ НА ПОЗНЯКАХ',
        address: 'М\'ясторія | Київ, просп. Володимира Івасюка, 8',
        hours: 'Пн.-Нд.: 10:00-22:00',
        lat: 50.4950,
        lng: 30.6010
    },
    {
        id: '102',
        name: 'М\'ЯСТОРІЯ НА ОБОЛОНІ',
        address: 'М\'ясторія | Київ, просп. Героїв Сталінграда, 12г',
        hours: 'Пн.-Нд.: 10:00-22:00',
        lat: 50.5050,
        lng: 30.5110
    },
    {
        id: '103',
        name: 'М\'ЯСТОРІЯ В ЦЕНТРІ',
        address: 'М\'ясторія | Київ, вул. Хрещатик, 15',
        hours: 'Пн.-Нд.: 10:00-22:00',
        lat: 50.4501,
        lng: 30.5234
    },
    {
        id: '104',
        name: 'М\'ЯСТОРІЯ НА ПЕЧЕРСЬКУ',
        address: 'М\'ясторія | Київ, вул. Коновальця, 36в',
        hours: 'Пн.-Нд.: 10:00-22:00',
        lat: 50.4250,
        lng: 30.5350
    }
];

const containerStyle = {
    width: '100%',
    height: '100%',
};

const defaultCenter = {
    lat: 50.4501,
    lng: 30.5234
};

const dict = {
    ua: {
        title: "ОБРАТИ ЗАКЛАД",
        tabList: "СПИСОК",
        tabMap: "КАРТА",
        searchPlaceholder: "Пошук по вулиці",
        addressLabel: "АДРЕСА",
        hoursLabel: "ЧАС РОБОТИ:",
        confirmBtn: "ПІДТВЕРДИТИ",
        recenterBtn: "Re-center",
        loading: "Завантаження...",
    },
    ru: {
        title: "ВЫБРАТЬ ЗАВЕДЕНИЕ",
        tabList: "СПИСОК",
        tabMap: "КАРТА",
        searchPlaceholder: "Поиск по улице",
        addressLabel: "АДРЕС",
        hoursLabel: "ВРЕМЯ РАБОТЫ:",
        confirmBtn: "ПОДТВЕРДИТЬ",
        recenterBtn: "Центрировать",
        loading: "Загрузка...",
    }
};

export default function AddPickupModal({ isOpen, onClose, onAdd, lang }: AddPickupModalProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES,
        language: typeof window !== 'undefined' ? (lang === 'ua' ? 'uk' : 'ru') : 'uk'
    });

    const [view, setView] = useState<'list' | 'map'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const { disableScroll, enableScroll } = useScrollLock();
    const [map, setMap] = useState<google.maps.Map | null>(null);

    useEffect(() => {
        if (isOpen) {
            disableScroll();
            return () => enableScroll();
        }
    }, [isOpen, disableScroll, enableScroll]);

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setView('list');
            setSearchQuery('');
            setSelectedStore(null);
        }, 300);
    };

    const handleConfirm = () => {
        if (selectedStore) {
            onAdd(selectedStore);
            handleClose();
        }
    };

    const filteredStores = MOCK_STORES.filter(store => 
        store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance);
    }, []);

    const handleMarkerClick = (store: Store) => {
        setSelectedStore(store);
    };

    const t = dict[lang];

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            className={{
                base: s.modalWrapper,
                afterOpen: s.modalWrapperOpen,
                beforeClose: s.modalWrapperBeforeClose
            }}
            overlayClassName={{
                base: s.overlay,
                afterOpen: s.overlayAfterOpen,
                beforeClose: s.overlayBeforeClose
            }}
            ariaHideApp={false}
            closeTimeoutMS={200}
        >
            <button className={s.closeBtn} onClick={handleClose} aria-label="Закрити">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            <div className={s.modal}>
                <div className={s.modalHeader}>
                    <h2 className={s.title}>{t.title}</h2>
                    <div className={s.controls}>
                        <div className={s.tabs}>
                            <button 
                                className={clsx(s.tab, view === 'list' && s.active)}
                                onClick={() => setView('list')}
                            >
                                {t.tabList}
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M2.33333 3.5H11.6667M2.33333 7H11.6667M2.33333 10.5H11.6667" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                                </svg>
                            </button>
                            <button 
                                className={clsx(s.tab, view === 'map' && s.active)}
                                onClick={() => setView('map')}
                            >
                                {t.tabMap}
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M4.66667 1.75V12.25M9.33333 1.75V12.25M1.75 3.5L4.66667 1.75L9.33333 3.5L12.25 1.75V10.5L9.33333 12.25L4.66667 10.5L1.75 12.25V3.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        <Search 
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder={t.searchPlaceholder}
                            showButton={false}
                            className={s.search}
                        />
                    </div>
                </div>

                <div className={s.modalContent}>
                    {view === 'list' ? (
                        <div className={s.listView}>
                            <div className={s.storeList}>
                                {filteredStores.map(store => (
                                    <div 
                                        key={store.id} 
                                        className={clsx(s.storeCard, selectedStore?.id === store.id && s.selected)}
                                        onClick={() => setSelectedStore(store)}
                                    >
                                        <div className={s.cardLeft}>
                                            <div className={s.logoWrapper}>
                                                <Image src="/icons/logo-red.svg" alt="Logo" width={24} height={24} />
                                            </div>
                                            <div className={s.nameWrapper}>
                                                <span className={s.storeName}>{store.name}</span>
                                            </div>
                                        </div>
                                        <div className={s.cardMiddle}>
                                            <div className={s.infoLabel}>{t.addressLabel}</div>
                                            <div className={s.infoValue}>{store.address}</div>
                                        </div>
                                        <div className={s.cardRight}>
                                            <div className={s.infoLabel}>{t.hoursLabel}</div>
                                            <div className={s.infoValue}>{store.hours}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className={s.footer}>
                                <Button 
                                    variant="red" 
                                    className={s.confirmBtn}
                                    onClick={handleConfirm}
                                    disabled={!selectedStore}
                                >
                                    {t.confirmBtn}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className={s.mapView}>
                            <div className={s.mapContainer}>
                                {isLoaded ? (
                                    <GoogleMap
                                        mapContainerStyle={containerStyle}
                                        center={selectedStore ? {lat: selectedStore.lat, lng: selectedStore.lng} : defaultCenter}
                                        zoom={12}
                                        onLoad={onMapLoad}
                                        options={{
                                            styles: DARK_MAP_STYLE,
                                            disableDefaultUI: true,
                                            zoomControl: true,
                                        }}
                                    >
                                        {MOCK_STORES.map(store => (
                                            <Marker 
                                                key={store.id}
                                                position={{lat: store.lat, lng: store.lng}}
                                                onClick={() => handleMarkerClick(store)}
                                                icon={{
                                                    url: selectedStore?.id === store.id ? '/icons/logo-red.svg' : '/icons/logo-red.svg', // In real project might use different icon for active
                                                    scaledSize: new window.google.maps.Size(32, 32)
                                                }}
                                            />
                                        ))}
                                    </GoogleMap>
                                ) : (
                                    <div className={s.loading}>{t.loading}</div>
                                )}
                            </div>
                            <div className={s.mapInfo}>
                                {selectedStore && (
                                    <div className={s.selectedStoreInfo}>
                                        <div className={s.selectedAddress}>{selectedStore.address}</div>
                                        <button className={s.recenterBtn} onClick={() => map?.panTo({lat: selectedStore.lat, lng: selectedStore.lng})}>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M8 2V4M8 12V14M2 8H4M12 8H14M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            {t.recenterBtn}
                                        </button>
                                    </div>
                                )}
                                <Button 
                                    variant="red" 
                                    className={s.confirmBtn}
                                    onClick={handleConfirm}
                                    disabled={!selectedStore}
                                >
                                    {t.confirmBtn}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
