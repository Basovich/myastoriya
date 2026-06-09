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
import { getShopsApi } from '@/lib/graphql';

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
        noResults: "Нічого не знайдено",
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
        noResults: "Ничего не найдено",
    }
};

export default function AddPickupModal({ isOpen, onClose, onAdd, lang }: AddPickupModalProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES,
        language: typeof window !== 'undefined' ? (lang === 'ua' ? 'uk' : 'ru') : 'uk'
    });

    const [stores, setStores] = useState<Store[]>([]);
    const [isLoadingStores, setIsLoadingStores] = useState(false);
    const [view, setView] = useState<'list' | 'map'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const { disableScroll, enableScroll } = useScrollLock();
    const [map, setMap] = useState<google.maps.Map | null>(null);

    useEffect(() => {
        const fetchShops = async () => {
            setIsLoadingStores(true);
            try {
                const res = await getShopsApi({ limit: 100, onlyCompanyStores: true }, lang);
                const mappedStores: Store[] = res.shops.data.map(shop => {
                    const hours = shop.schedule && shop.schedule.length > 0 
                        ? shop.schedule.map(s => `${s.days}: ${s.workTime}`).join(', ') 
                        : '';
                    return {
                        id: shop.id.toString(),
                        name: shop.siteName || shop.name || '',
                        address: shop.siteAddress || '',
                        hours: hours,
                        lat: shop.lat || defaultCenter.lat,
                        lng: shop.lng || defaultCenter.lng,
                    };
                });
                setStores(mappedStores);
            } catch (error) {
                console.error('Failed to fetch real shops:', error);
            } finally {
                setIsLoadingStores(false);
            }
        };

        if (isOpen) {
            fetchShops();
            disableScroll();
            return () => enableScroll();
        }
    }, [isOpen, lang, disableScroll, enableScroll]);

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

    const filteredStores = stores.filter(store => 
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
            <button className={s.closeBtn} onClick={handleClose} aria-label={lang === 'ua' ? 'Закрити' : 'Закрыть'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M11.7625 9.99893L19.6326 2.14129C19.8678 1.90606 20 1.58701 20 1.25434C20 0.921668 19.8678 0.602622 19.6326 0.367388C19.3974 0.132153 19.0783 0 18.7457 0C18.413 0 18.0939 0.132153 17.8587 0.367388L10.0011 8.23752L2.14342 0.367388C1.90819 0.132153 1.58914 2.95361e-07 1.25647 2.97839e-07C0.9238 3.00318e-07 0.604754 0.132153 0.369519 0.367388C0.134285 0.602622 0.00213223 0.921668 0.00213223 1.25434C0.00213223 1.58701 0.134285 1.90606 0.369519 2.14129L8.23966 9.99893L0.369519 17.8566C0.252431 17.9727 0.159496 18.1109 0.0960746 18.2631C0.0326529 18.4153 0 18.5786 0 18.7435C0 18.9084 0.0326529 19.0717 0.0960746 19.224C0.159496 19.3762 0.252431 19.5143 0.369519 19.6305C0.485651 19.7476 0.623817 19.8405 0.776047 19.9039C0.928277 19.9673 1.09156 20 1.25647 20C1.42138 20 1.58467 19.9673 1.7369 19.9039C1.88913 19.8405 2.02729 19.7476 2.14342 19.6305L10.0011 11.7603L17.8587 19.6305C17.9748 19.7476 18.113 19.8405 18.2652 19.9039C18.4175 19.9673 18.5807 20 18.7457 20C18.9106 20 19.0739 19.9673 19.2261 19.9039C19.3783 19.8405 19.5165 19.7476 19.6326 19.6305C19.7497 19.5143 19.8426 19.3762 19.9061 19.224C19.9695 19.0717 20.0021 18.9084 20.0021 18.7435C20.0021 18.5786 19.9695 18.4153 19.9061 18.2631C19.8426 18.1109 19.7497 17.9727 19.6326 17.8566L11.7625 9.99893Z" fill="white"/>
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
                                <span>{t.tabList}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="10" viewBox="0 0 20 10" fill="none">
                                    <path d="M1.71023 8.05304C1.61513 7.98179 1.50298 7.92594 1.38023 7.8887C1.13677 7.81042 0.863694 7.81042 0.620232 7.8887C0.497481 7.92594 0.385336 7.98179 0.290233 8.05304C0.199192 8.12747 0.127827 8.21524 0.0802325 8.31131C0.00365307 8.45383 -0.0172696 8.61091 0.0201045 8.76272C0.0574787 8.91454 0.151475 9.05429 0.290233 9.16435C0.387433 9.23348 0.499048 9.28906 0.620232 9.3287C0.739933 9.3701 0.869362 9.39149 1.00023 9.39149C1.1311 9.39149 1.26053 9.3701 1.38023 9.3287C1.50142 9.28906 1.61303 9.23348 1.71023 9.16435C1.84899 9.05429 1.94299 8.91454 1.98036 8.76272C2.01773 8.61091 1.99681 8.45383 1.92023 8.31131C1.87264 8.21524 1.80127 8.12747 1.71023 8.05304ZM5.00023 1.56522H19.0002C19.2654 1.56522 19.5198 1.48276 19.7073 1.336C19.8949 1.18923 20.0002 0.990169 20.0002 0.782609C20.0002 0.575048 19.8949 0.375989 19.7073 0.229221C19.5198 0.0824533 19.2654 0 19.0002 0H5.00023C4.73502 0 4.48066 0.0824533 4.29313 0.229221C4.10559 0.375989 4.00023 0.575048 4.00023 0.782609C4.00023 0.990169 4.10559 1.18923 4.29313 1.336C4.48066 1.48276 4.73502 1.56522 5.00023 1.56522ZM1.71023 4.14C1.56961 4.03141 1.39104 3.95784 1.19705 3.9286C1.00306 3.89935 0.802343 3.91572 0.620232 3.97565C0.499048 4.01529 0.387433 4.07087 0.290233 4.14C0.199192 4.21443 0.127827 4.30219 0.0802325 4.39826C0.0273273 4.49194 0 4.59323 0 4.69565C0 4.79807 0.0273273 4.89936 0.0802325 4.99304C0.130874 5.08788 0.201902 5.17523 0.290233 5.2513C0.387433 5.32043 0.499048 5.37602 0.620232 5.41565C0.739933 5.45706 0.869362 5.47844 1.00023 5.47844C1.1311 5.47844 1.26053 5.45706 1.38023 5.41565C1.50142 5.37602 1.61303 5.32043 1.71023 5.2513C1.79856 5.17523 1.86959 5.08788 1.92023 4.99304C1.97314 4.89936 2.00047 4.79807 2.00047 4.69565C2.00047 4.59323 1.97314 4.49194 1.92023 4.39826C1.87264 4.30219 1.80127 4.21443 1.71023 4.14ZM19.0002 3.91304H5.00023C4.73502 3.91304 4.48066 3.9955 4.29313 4.14226C4.10559 4.28903 4.00023 4.48809 4.00023 4.69565C4.00023 4.90321 4.10559 5.10227 4.29313 5.24904C4.48066 5.39581 4.73502 5.47826 5.00023 5.47826H19.0002C19.2654 5.47826 19.5198 5.39581 19.7073 5.24904C19.8949 5.10227 20.0002 4.90321 20.0002 4.69565C20.0002 4.48809 19.8949 4.28903 19.7073 4.14226C19.5198 3.9955 19.2654 3.91304 19.0002 3.91304ZM1.71023 0.226956C1.61513 0.155707 1.50298 0.0998564 1.38023 0.0626086C1.19812 0.00267691 0.997409 -0.0136972 0.803419 0.0155521C0.609429 0.0448015 0.430856 0.118364 0.290233 0.226956C0.201902 0.303027 0.130874 0.390377 0.0802325 0.485217C0.0273273 0.578896 0 0.680188 0 0.782609C0 0.885029 0.0273273 0.986321 0.0802325 1.08C0.130874 1.17484 0.201902 1.26219 0.290233 1.33826C0.387433 1.40739 0.499048 1.46298 0.620232 1.50261C0.802343 1.56254 1.00306 1.57891 1.19705 1.54967C1.39104 1.52042 1.56961 1.44685 1.71023 1.33826C1.79856 1.26219 1.86959 1.17484 1.92023 1.08C1.97314 0.986321 2.00047 0.885029 2.00047 0.782609C2.00047 0.680188 1.97314 0.578896 1.92023 0.485217C1.86959 0.390377 1.79856 0.303027 1.71023 0.226956ZM19.0002 7.82609H5.00023C4.73502 7.82609 4.48066 7.90854 4.29313 8.05531C4.10559 8.20208 4.00023 8.40113 4.00023 8.6087C4.00023 8.81626 4.10559 9.01532 4.29313 9.16208C4.48066 9.30885 4.73502 9.3913 5.00023 9.3913H19.0002C19.2654 9.3913 19.5198 9.30885 19.7073 9.16208C19.8949 9.01532 20.0002 8.81626 20.0002 8.6087C20.0002 8.40113 19.8949 8.20208 19.7073 8.05531C19.5198 7.90854 19.2654 7.82609 19.0002 7.82609Z" fill="currentColor"/>
                                </svg>
                            </button>
                            <button 
                                className={clsx(s.tab, view === 'map' && s.active)}
                                onClick={() => setView('map')}
                            >
                                <span>{t.tabMap}</span>
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
                    {isLoadingStores ? (
                        <div className={s.loading}>{t.loading}</div>
                    ) : view === 'list' ? (
                        <div className={s.listView}>
                            <div className={s.storeList}>
                                {filteredStores.length === 0 ? (
                                    <div className={s.noResults}>{t.noResults}</div>
                                ) : (
                                    filteredStores.map(store => (
                                        <div 
                                            key={store.id} 
                                            className={clsx(s.storeCard, selectedStore?.id === store.id && s.selected)}
                                            onClick={() => setSelectedStore(store)}
                                        >
                                            <div className={s.cardLeft}>
                                                <div className={s.logoWrapper}>
                                                    <svg width="27" height="36" viewBox="0 0 27 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path fillRule="evenodd" clipRule="evenodd" d="M20.2803 21.126C19.725 21.8862 17.7075 24.4049 15.2371 24.6605C15.0925 24.6743 14.9489 24.682 14.8104 24.682C10.2204 24.682 9.86347 17.0815 9.86347 14.7514V10.1408L10.0735 10.3362C11.4908 11.6558 11.765 12.9992 11.7417 14.6096C11.7949 15.6562 12.535 16.1279 13.2451 16.1279C13.9666 16.1279 14.7499 15.6465 14.7628 14.5892C14.7848 12.9239 14.9084 11.8067 16.4404 10.3379L16.6511 10.1351V19.5046C16.6511 20.3691 17.323 21.047 18.1801 21.047C19.0517 21.047 19.7081 20.3832 19.7081 19.5046V7.79939C19.7081 7.04992 19.1504 6.39681 18.4114 6.28104C18.3014 6.26197 18.1877 6.25227 18.0721 6.25227C16.4145 6.25227 14.3076 8.14803 13.3684 9.34351L13.2701 9.46865L13.1717 9.34284C12.2435 8.14937 10.1433 6.25461 8.45909 6.25461C8.24275 6.25461 8.03738 6.28706 7.84962 6.3513C7.25045 6.55406 6.83206 7.14996 6.83206 7.79939V14.9164C6.83206 15.3333 6.84435 15.7769 6.86529 16.1664C7.14012 21.23 8.68506 27.35 14.481 27.7468C14.6243 27.7561 14.7652 27.7608 14.9031 27.7608C16.0462 27.7608 17.095 27.4242 18.1103 26.7313L18.5273 26.4462L18.2907 26.8946C17.318 28.7341 15.4511 31.8401 13.8822 31.9672C13.8303 31.9746 13.7702 31.9786 13.71 31.9786C11.2369 31.9793 7.22453 25.1377 6.11658 22.5376C4.72981 19.2884 3.62452 15.5728 3.30184 13.0738L3.24967 12.689C2.88478 10.0214 2.62125 8.09383 5.10267 6.60626C5.22763 6.53131 5.90024 6.13549 6.1538 6.00501C8.55147 4.76603 14.5133 3.03722 18.7776 3.03722C21.3414 3.03722 22.8824 3.64617 23.3566 4.846C25.0896 8.56894 22.6318 18.2211 20.2803 21.126ZM24.3685 1.37917C23.1167 0.464071 21.2015 0 18.6759 0C13.4449 0 6.92182 2.00317 3.63785 3.93976C0.0189073 6.05401 -0.354951 9.04755 0.216304 13.1927C0.584513 15.7664 1.61769 19.9454 3.41321 23.9537C3.92165 25.09 8.53556 35.0563 13.7666 35.0563H13.7672C13.8493 35.0563 13.9311 35.0533 14.0138 35.0489C16.9612 34.8562 19.8832 31.3956 22.6986 24.7651C23.8036 22.1801 24.7205 19.6924 25.4243 17.3704C26.6798 13.1934 27.831 7.44221 26.1817 3.7564C25.7443 2.77105 25.3067 2.0654 24.3685 1.37917Z" fill="white"/>
                                                    </svg>
                                                </div>
                                                <h3 className={s.storeName}>{store.name}</h3>
                                            </div>
                                            <div className={s.cardMiddle}>
                                                <div className={s.infoLabel}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="12" viewBox="0 0 10 12" fill="none">
                                                        <path d="M9.53292 4.32061C9.454 3.49937 9.16377 2.71257 8.69048 2.03681C8.21719 1.36105 7.57697 0.819375 6.83217 0.464519C6.08737 0.109663 5.26337 -0.0462753 4.4404 0.0118894C3.61744 0.0700541 2.82356 0.340339 2.13607 0.796425C1.54545 1.19136 1.04962 1.71221 0.684215 2.32154C0.318808 2.93088 0.09289 3.61358 0.0226904 4.32061C-0.0461731 5.023 0.0421796 5.73192 0.281338 6.39592C0.520497 7.05993 0.904464 7.66237 1.40538 8.15954L4.38436 11.1441C4.43661 11.1968 4.49877 11.2386 4.56727 11.2672C4.63576 11.2957 4.70923 11.3104 4.78343 11.3104C4.85763 11.3104 4.93109 11.2957 4.99958 11.2672C5.06808 11.2386 5.13024 11.1968 5.1825 11.1441L8.15023 8.15954C8.65114 7.66237 9.03511 7.05993 9.27427 6.39592C9.51343 5.73192 9.60178 5.023 9.53292 4.32061ZM7.36333 7.36703L4.7778 9.95255L2.19228 7.36703C1.81125 6.98597 1.51937 6.52523 1.33764 6.01792C1.1559 5.51062 1.08882 4.96934 1.14121 4.43302C1.19394 3.88843 1.36703 3.36237 1.64796 2.89286C1.92888 2.42335 2.31063 2.02214 2.76559 1.71822C3.36192 1.32209 4.0619 1.11079 4.7778 1.11079C5.49371 1.11079 6.19369 1.32209 6.79002 1.71822C7.2436 2.02096 7.62451 2.4204 7.90536 2.88785C8.18622 3.3553 8.36006 3.87916 8.4144 4.42178C8.4685 4.95992 8.40226 5.50336 8.22048 6.01274C8.03869 6.52213 7.74591 6.98472 7.36333 7.36703ZM4.7778 2.28029C4.27755 2.28029 3.78854 2.42863 3.37259 2.70656C2.95665 2.98448 2.63246 3.37951 2.44102 3.84168C2.24958 4.30385 2.19949 4.81241 2.29709 5.30305C2.39468 5.79369 2.63558 6.24437 2.98931 6.5981C3.34304 6.95183 3.79372 7.19273 4.28436 7.29032C4.775 7.38792 5.28356 7.33783 5.74573 7.14639C6.2079 6.95495 6.60293 6.63076 6.88085 6.21482C7.15878 5.79888 7.30712 5.30986 7.30712 4.80961C7.30564 4.13925 7.03868 3.49677 6.56466 3.02275C6.09064 2.54873 5.44816 2.28178 4.7778 2.28029ZM4.7778 6.21478C4.49989 6.21478 4.22821 6.13237 3.99713 5.97797C3.76605 5.82357 3.58595 5.60411 3.47959 5.34734C3.37324 5.09058 3.34541 4.80805 3.39963 4.53547C3.45385 4.26289 3.58768 4.01252 3.7842 3.816C3.98071 3.61948 4.23109 3.48565 4.50367 3.43143C4.77625 3.37721 5.05878 3.40504 5.31554 3.51139C5.5723 3.61775 5.79176 3.79785 5.94617 4.02893C6.10057 4.26001 6.18298 4.53169 6.18298 4.80961C6.18298 5.18228 6.03494 5.53969 5.77141 5.80322C5.50789 6.06674 5.15048 6.21478 4.7778 6.21478Z" fill="black"/>
                                                    </svg>
                                                    {t.addressLabel}
                                                </div>
                                                <div className={s.infoValue}>{store.address}</div>
                                            </div>
                                            <div className={s.cardRight}>
                                                <div className={s.infoLabel}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                                        <path fillRule="evenodd" clipRule="evenodd" d="M7.21851 2.10543C4.3991 2.10543 2.10543 4.3991 2.10543 7.21851C2.10543 10.0379 4.3991 12.3316 7.21851 12.3316C10.0379 12.3316 12.3316 10.0379 12.3316 7.21851C12.3316 4.3991 10.0379 2.10543 7.21851 2.10543ZM7.21851 13.2339C3.90163 13.2339 1.20312 10.5354 1.20312 7.21851C1.20312 3.90163 3.90163 1.20312 7.21851 1.20312C10.5354 1.20312 13.2339 3.90163 13.2339 7.21851C13.2339 10.5354 10.5354 13.2339 7.21851 13.2339Z" fill="black"/>
                                                        <path fillRule="evenodd" clipRule="evenodd" d="M9.28145 9.43998C9.20265 9.43998 9.12325 9.41953 9.05046 9.37682L6.78266 8.02396C6.64672 7.94215 6.5625 7.79477 6.5625 7.63597V4.71971C6.5625 4.47067 6.76462 4.26855 7.01365 4.26855C7.26329 4.26855 7.46481 4.47067 7.46481 4.71971V7.37971L9.51305 8.60083C9.72659 8.72896 9.79697 9.00567 9.66945 9.21982C9.58463 9.36118 9.43485 9.43998 9.28145 9.43998Z" fill="black"/>
                                                    </svg>
                                                    {t.hoursLabel}
                                                </div>
                                                <div className={s.infoValue}>{store.hours}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
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
                                        {filteredStores.map(store => (
                                            <Marker 
                                                key={store.id}
                                                position={{lat: store.lat, lng: store.lng}}
                                                onClick={() => handleMarkerClick(store)}
                                                icon={{
                                                    url: '/icons/logo-red.svg',
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
                                    <div className={s.selectedAddress}>{selectedStore.address}</div>
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
