'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Modal from 'react-modal';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import clsx from 'clsx';
import s from './AddNovaPoshtaModal.module.scss';
import useScrollLock from '@/hooks/useScrollLock';
import Search from '@/app/components/ui/Search/Search';
import Button from '@/app/components/ui/Button/Button';
import { GOOGLE_MAPS_API_KEY, DARK_MAP_STYLE, GOOGLE_MAPS_LIBRARIES } from '@/lib/constants';
import { getWarehousesApi, Warehouse } from '@/lib/graphql';
import Spinner from '@/app/components/ui/Spinner/Spinner';

const NP_MARKER_URL = '/icons/np-marker.svg';

const containerStyle = { width: '100%', height: '100%' };
const KYIV_CENTER = { lat: 50.4501, lng: 30.5234 };
const DEBOUNCE_MS = 400;

const dict = {
    ua: {
        title: 'ОБРАТИ ВІДДІЛЕННЯ',
        tabList: 'СПИСОК',
        tabMap: 'КАРТА',
        searchPlaceholder: 'Пошук відділення...',
        confirmBtn: 'ПІДТВЕРДИТИ',
        loading: 'Завантаження...',
        noResults: 'Відділення не знайдено',
        mapHint: 'Оберіть відділення на карті або в списку',
        npLabel: 'Нова Пошта',
    },
    ru: {
        title: 'ВЫБРАТЬ ОТДЕЛЕНИЕ',
        tabList: 'СПИСОК',
        tabMap: 'КАРТА',
        searchPlaceholder: 'Поиск отделения...',
        confirmBtn: 'ПОДТВЕРДИТЬ',
        loading: 'Загрузка...',
        noResults: 'Отделения не найдено',
        mapHint: 'Выберите отделение на карте или в списке',
        npLabel: 'Новая Почта',
    },
};

// NP logo — letter Н
function NpLogoIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text
                x="12"
                y="18"
                textAnchor="middle"
                fontFamily="Arial, Helvetica, sans-serif"
                fontWeight="900"
                fontSize="17"
                fill="white"
            >Н</text>
        </svg>
    );
}

interface AddNovaPoshtaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (warehouse: Warehouse) => void;
    lang: 'ua' | 'ru';
    localityId: number;
    existingRefs?: string[];
}

export default function AddNovaPoshtaModal({
    isOpen,
    onClose,
    onAdd,
    lang,
    localityId,
    existingRefs = [],
}: AddNovaPoshtaModalProps) {
    const t = dict[lang] ?? dict.ua;

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES,
        language: lang === 'ua' ? 'uk' : 'ru',
    });

    const [view, setView] = useState<'list' | 'map'>('map');
    const [searchQuery, setSearchQuery] = useState('');
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selected, setSelected] = useState<Warehouse | null>(null);
    const { disableScroll, enableScroll } = useScrollLock();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchWarehouses = useCallback(async (query: string) => {
        setIsLoading(true);
        try {
            const res = await getWarehousesApi(localityId, query || undefined, 50, 1, lang);
            setWarehouses(res.data);
        } catch (err) {
            console.error('[AddNovaPoshtaModal] Failed to fetch warehouses:', err);
            setWarehouses([]);
        } finally {
            setIsLoading(false);
        }
    }, [localityId, lang]);

    // Initial load + debounced search
    useEffect(() => {
        if (!isOpen) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            void fetchWarehouses(searchQuery);
        }, searchQuery ? DEBOUNCE_MS : 0);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [isOpen, searchQuery, fetchWarehouses]);

    useEffect(() => {
        if (isOpen) {
            disableScroll();
            return () => enableScroll();
        }
    }, [isOpen, disableScroll, enableScroll]);

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setView('map');
            setSearchQuery('');
            setSelected(null);
            setWarehouses([]);
        }, 300);
    };

    const handleConfirm = () => {
        if (selected) {
            onAdd(selected);
            handleClose();
        }
    };

    // Filter out already-added warehouses
    const availableWarehouses = warehouses.filter(
        (w) => !existingRefs.includes(w.ref)
    );

    // Map center: first warehouse with coords, fallback to Kyiv
    const mapCenter = availableWarehouses.find(w => w.lat && w.lng)
        ? { lat: availableWarehouses[0].lat!, lng: availableWarehouses[0].lng! }
        : KYIV_CENTER;

    const selectedCenter = selected?.lat && selected?.lng
        ? { lat: selected.lat, lng: selected.lng }
        : undefined;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            className={{
                base: s.modalWrapper,
                afterOpen: s.modalWrapperOpen,
                beforeClose: s.modalWrapperBeforeClose,
            }}
            overlayClassName={{
                base: s.overlay,
                afterOpen: s.overlayAfterOpen,
                beforeClose: s.overlayBeforeClose,
            }}
            ariaHideApp={false}
            closeTimeoutMS={200}
        >
            <button
                className={s.closeBtn}
                onClick={handleClose}
                aria-label={lang === 'ua' ? 'Закрити' : 'Закрыть'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M11.7625 9.99893L19.6326 2.14129C19.8678 1.90606 20 1.58701 20 1.25434C20 0.921668 19.8678 0.602622 19.6326 0.367388C19.3974 0.132153 19.0783 0 18.7457 0C18.413 0 18.0939 0.132153 17.8587 0.367388L10.0011 8.23752L2.14342 0.367388C1.90819 0.132153 1.58914 2.95361e-07 1.25647 2.97839e-07C0.9238 3.00318e-07 0.604754 0.132153 0.369519 0.367388C0.134285 0.602622 0.00213223 0.921668 0.00213223 1.25434C0.00213223 1.58701 0.134285 1.90606 0.369519 2.14129L8.23966 9.99893L0.369519 17.8566C0.252431 17.9727 0.159496 18.1109 0.0960746 18.2631C0.0326529 18.4153 0 18.5786 0 18.7435C0 18.9084 0.0326529 19.0717 0.0960746 19.224C0.159496 19.3762 0.252431 19.5143 0.369519 19.6305C0.485651 19.7476 0.623817 19.8405 0.776047 19.9039C0.928277 19.9673 1.09156 20 1.25647 20C1.42138 20 1.58467 19.9673 1.7369 19.9039C1.88913 19.8405 2.02729 19.7476 2.14342 19.6305L10.0011 11.7603L17.8587 19.6305C17.9748 19.7476 18.113 19.8405 18.2652 19.9039C18.4175 19.9673 18.5807 20 18.7457 20C18.9106 20 19.0739 19.9673 19.2261 19.9039C19.3783 19.8405 19.5165 19.7476 19.6326 19.6305C19.7497 19.5143 19.8426 19.3762 19.9061 19.224C19.9695 19.0717 20.0021 18.9084 20.0021 18.7435C20.0021 18.5786 19.9695 18.4153 19.9061 18.2631C19.8426 18.1109 19.7497 17.9727 19.6326 17.8566L11.7625 9.99893Z" fill="white"/>
                </svg>
            </button>

            <div className={s.modal}>
                <div className={s.modalHeader}>
                    <div className={s.headerLeft}>
                        <div className={s.npBadge}>
                            <div className={s.npBadgeIcon}>
                                <NpLogoIcon />
                            </div>
                            <span className={s.npBadgeText}>{t.npLabel}</span>
                        </div>
                        <h2 className={s.title}>{t.title}</h2>
                    </div>

                    <div className={s.controls}>
                        <div className={s.tabs}>
                            <button
                                className={clsx(s.tab, view === 'list' && s.active)}
                                onClick={() => setView('list')}
                            >
                                <span>{t.tabList}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="10" viewBox="0 0 20 10" fill="none">
                                    <path d="M1.71023 8.05304C1.61513 7.98179 1.50298 7.92594 1.38023 7.8887C1.13677 7.81042 0.863694 7.81042 0.620232 7.8887C0.497481 7.92594 0.385336 7.98179 0.290233 8.05304C0.199192 8.12747 0.127827 8.21524 0.0802325 8.31131C0.00365307 8.45383 -0.0172696 8.61091 0.0201045 8.76272C0.0574787 8.91454 0.151475 9.05429 0.290233 9.16435C0.387433 9.23348 0.499048 9.28906 0.620232 9.3287C0.739933 9.3701 0.869362 9.39149 1.00023 9.39149C1.1311 9.39149 1.26053 9.3701 1.38023 9.3287C1.50142 9.28906 1.61303 9.23348 1.71023 9.16435C1.84899 9.05429 1.94299 8.91454 1.98036 8.76272C2.01773 8.61091 1.99681 8.45383 1.92023 8.31131C1.87264 8.21524 1.80127 8.12747 1.71023 8.05304ZM5.00023 1.56522H19.0002C19.2654 1.56522 19.5198 1.48276 19.7073 1.336C19.8949 1.18923 20.0002 0.990169 20.0002 0.782609C20.0002 0.575048 19.8949 0.375989 19.7073 0.229221C19.5198 0.0824533 19.2654 0 19.0002 0H5.00023C4.73502 0 4.48066 0.0824533 4.29313 0.229221C4.10559 0.375989 4.00023 0.575048 4.00023 0.782609C4.00023 0.990169 4.10559 1.18923 4.29313 1.336C4.48066 1.48276 4.73502 1.56522 5.00023 1.56522ZM5.00023 5.47826H19.0002C19.2654 5.47826 19.5198 5.39581 19.7073 5.24904C19.8949 5.10227 20.0002 4.90321 20.0002 4.69565C20.0002 4.48809 19.8949 4.28903 19.7073 4.14226C19.5198 3.9955 19.2654 3.91304 19.0002 3.91304H5.00023C4.73502 3.91304 4.48066 3.9955 4.29313 4.14226C4.10559 4.28903 4.00023 4.48809 4.00023 4.69565C4.00023 4.90321 4.10559 5.10227 4.29313 5.24904C4.48066 5.39581 4.73502 5.47826 5.00023 5.47826ZM19.0002 7.82609H5.00023C4.73502 7.82609 4.48066 7.90854 4.29313 8.05531C4.10559 8.20208 4.00023 8.40113 4.00023 8.6087C4.00023 8.81626 4.10559 9.01532 4.29313 9.16208C4.48066 9.30885 4.73502 9.3913 5.00023 9.3913H19.0002C19.2654 9.3913 19.5198 9.30885 19.7073 9.16208C19.8949 9.01532 20.0002 8.81626 20.0002 8.6087C20.0002 8.40113 19.8949 8.20208 19.7073 8.05531C19.5198 7.90854 19.2654 7.82609 19.0002 7.82609Z" fill="currentColor"/>
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
                    {isLoading ? (
                        <div className={s.loading}>
                            <Spinner />
                        </div>
                    ) : view === 'list' ? (
                        <div className={s.listView}>
                            <div className={s.warehouseList}>
                                {availableWarehouses.length === 0 ? (
                                    <div className={s.noResults}>{t.noResults}</div>
                                ) : (
                                    availableWarehouses.map((warehouse) => {
                                        const scheduleText = warehouse.schedule && warehouse.schedule.length > 0
                                            ? warehouse.schedule.map(sc => `${sc.days ?? ''}: ${sc.workTime ?? ''}`).join(', ')
                                            : '';
                                        return (
                                            <div
                                                key={warehouse.ref}
                                                className={clsx(s.warehouseCard, selected?.ref === warehouse.ref && s.selected)}
                                                onClick={() => setSelected(warehouse)}
                                            >
                                                <div className={s.warehouseLogo}>
                                                    <NpLogoIcon />
                                                </div>
                                                <div className={s.warehouseInfo}>
                                                    <span className={s.warehouseName}>{warehouse.name}</span>
                                                    {scheduleText && (
                                                        <span className={s.warehouseSchedule}>{scheduleText}</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <div className={s.footer}>
                                <Button
                                    variant="red"
                                    className={s.confirmBtn}
                                    onClick={handleConfirm}
                                    disabled={!selected}
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
                                        center={selectedCenter ?? mapCenter}
                                        zoom={selectedCenter ? 15 : 12}
                                        options={{
                                            styles: DARK_MAP_STYLE,
                                            disableDefaultUI: true,
                                            zoomControl: true,
                                        }}
                                    >
                                        {availableWarehouses
                                            .filter(w => w.lat && w.lng)
                                            .map((warehouse) => (
                                                <Marker
                                                    key={warehouse.ref}
                                                    position={{ lat: warehouse.lat!, lng: warehouse.lng! }}
                                                    onClick={() => setSelected(warehouse)}
                                                    icon={{
                                                        url: NP_MARKER_URL,
                                                        scaledSize: new window.google.maps.Size(
                                                            selected?.ref === warehouse.ref ? 48 : 36,
                                                            selected?.ref === warehouse.ref ? 62 : 46
                                                        ),
                                                    }}
                                                />
                                            ))}
                                    </GoogleMap>
                                ) : (
                                    <div className={s.loading}><Spinner /></div>
                                )}
                            </div>
                            <div className={s.mapInfo}>
                                {selected ? (
                                    <span className={s.selectedAddress}>{selected.name}</span>
                                ) : (
                                    <span className={s.mapHint}>{t.mapHint}</span>
                                )}
                                <Button
                                    variant="red"
                                    className={s.confirmBtn}
                                    onClick={handleConfirm}
                                    disabled={!selected}
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
