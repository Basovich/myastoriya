'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from 'react-modal';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import s from './AddAddressModal.module.scss';
import useScrollLock from '@/hooks/useScrollLock';
import SearchableSelect from '@/app/components/ui/SearchableSelect';
import { getLocalitiesApi, getStreetsApi } from '@/lib/graphql';
import InputField from '@/app/components/ui/InputField';
import Button from '@/app/components/ui/Button/Button';
import Search from '@/app/components/ui/Search/Search';
import { GOOGLE_MAPS_API_KEY, DARK_MAP_STYLE, GOOGLE_MAPS_LIBRARIES } from '@/lib/constants';
import { useParams } from 'next/navigation';
import { Locale } from '@/i18n/config';
import { cleanAddressText } from '@/lib/utils/address';
import { useAutocompleteCleaner } from '@/hooks/useAutocompleteCleaner';

interface AddAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (address: {
        id: string;
        title: string;
        street: string;
        streetId?: number;
        city?: string;
        house?: string;
        apartment?: string;
        entrance?: string;
        floor?: string;
        fullAddress?: string;
    }) => void;
}

const modalDict = {
    ua: {
        addAddress: 'Додати адресу',
        street: 'Вулиця',
        findOnMap: 'Знайти на карті',
        house: 'Будинок',
        apartment: 'Квартира',
        entrance: 'Під’їзд',
        floor: 'Поверх',
        addAddressBtn: 'ДОДАТИ АДРЕСУ',
        selectOnMapTitle: 'Обрати адресу на карті',
        searchStreetPlaceholder: 'Пошук по вулиці',
        loadingMap: 'Завантаження карти...',
        selectedPlace: 'Обране місце',
        selectPlaceOnMap: 'Виберіть місце на карті',
        backBtn: 'ПОВЕРНУТИСЬ',
        confirmBtn: 'ПІДТВЕРДИТИ',
        coordinates: 'Координати',
        myAddress: 'Моя адреса',
        selectedOnMapTitle: 'Вибрана на карті',
        fullAddressPattern: (street: string, house: string, apartment?: string) => 
            `вул. ${street}, буд. ${house}${apartment ? `, кв. ${apartment}` : ''}`
    },
    ru: {
        addAddress: 'Добавить адрес',
        street: 'Улица',
        findOnMap: 'Найти на карте',
        house: 'Дом',
        apartment: 'Квартира',
        entrance: 'Подъезд',
        floor: 'Этаж',
        addAddressBtn: 'ДОБАВИТЬ АДРЕС',
        selectOnMapTitle: 'Выбрать адрес на карте',
        searchStreetPlaceholder: 'Поиск по улице',
        loadingMap: 'Загрузка карты...',
        selectedPlace: 'Выбранное место',
        selectPlaceOnMap: 'Выберите место на карте',
        backBtn: 'ВЕРНУТЬСЯ',
        confirmBtn: 'ПОДТВЕРДИТЬ',
        coordinates: 'Координаты',
        myAddress: 'Мой адрес',
        selectedOnMapTitle: 'Выбранный на карте',
        fullAddressPattern: (street: string, house: string, apartment?: string) => 
            `ул. ${street}, дом ${house}${apartment ? `, кв. ${apartment}` : ''}`
    }
};

const containerStyle = {
    width: '100%',
    height: '100%',
};

const center = {
    lat: 50.4501,
    lng: 30.5234
};

export default function AddAddressModal({ isOpen, onClose, onAdd }: AddAddressModalProps) {
    const params = useParams();
    const lang = (params?.lang as Locale) || 'ua';
    const dict = modalDict[lang === 'ru' ? 'ru' : 'ua'];
    useAutocompleteCleaner();

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES,
        language: typeof window !== 'undefined' ? (lang === 'ua' ? 'uk' : 'ru') : 'uk'
    });

    const [view, setView] = useState<'form' | 'map'>('form');
    const { disableScroll, enableScroll } = useScrollLock();

    // Form state
    const [city, setCity] = useState('м. Київ');
    const [cityId, setCityId] = useState<number | undefined>(2581);
    const [street, setStreet] = useState('');
    const [streetId, setStreetId] = useState<number | undefined>(undefined);
    const [house, setHouse] = useState('');
    const [apartment, setApartment] = useState('');
    const [entrance, setEntrance] = useState('');
    const [floor, setFloor] = useState('');
    
    // Map state
    const [mapMarker, setMapMarker] = useState<{lat: number, lng: number} | null>(null);
    const [mapSearch, setMapSearch] = useState('');
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [parsedAddress, setParsedAddress] = useState<{
        city: string;
        street: string;
        house: string;
    } | null>(null);

    useEffect(() => {
        if (isOpen) {
            disableScroll();
            return () => enableScroll();
        }
    }, [isOpen, disableScroll, enableScroll]);

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setView('form');
            setCity('м. Київ');
            setCityId(2581);
            setStreet('');
            setStreetId(undefined);
            setHouse('');
            setApartment('');
            setEntrance('');
            setFloor('');
            setMapMarker(null);
            setMapSearch('');
            setParsedAddress(null);
        }, 300);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!street || !house) return;
        
        const fullAddress = dict.fullAddressPattern(street, house, apartment);
        onAdd({
            id: Math.random().toString(36).substr(2, 9),
            title: `${dict.myAddress} №${Math.floor(Math.random() * 10) + 2}`,
            street: street,
            streetId: streetId,
            city,
            house,
            apartment,
            entrance,
            floor,
            fullAddress
        });
        handleClose();
    };

    const updateFormFromGeocode = useCallback(async (gCity: string, gStreet: string, gHouse: string) => {
        setStreet(gStreet);
        setHouse(gHouse);
        
        if (gCity) {
            try {
                const res = await getLocalitiesApi(gCity, 5, 1, lang);
                if (res.data && res.data.length > 0) {
                    const matched = res.data.find(c => 
                        c.name.toLowerCase().includes(gCity.toLowerCase()) || 
                        gCity.toLowerCase().includes(c.name.toLowerCase())
                    ) || res.data[0];
                    
                    setCity(matched.name);
                    setCityId(matched.id);

                    if (gStreet) {
                        const streetsRes = await getStreetsApi(matched.id, gStreet, 5, 1, lang);
                        if (streetsRes.data && streetsRes.data.length > 0) {
                            const matchedStreet = streetsRes.data.find(s => 
                                s.name.toLowerCase().includes(gStreet.toLowerCase()) || 
                                gStreet.toLowerCase().includes(s.name.toLowerCase())
                            ) || streetsRes.data[0];
                            setStreetId(matchedStreet.id);
                        } else {
                            setStreetId(undefined);
                        }
                    } else {
                        setStreetId(undefined);
                    }
                } else {
                    setCity(gCity);
                    setCityId(undefined);
                    setStreetId(undefined);
                }
            } catch (e) {
                console.error('Failed to map geocoded city:', e);
                setCity(gCity);
                setCityId(undefined);
                setStreetId(undefined);
            }
        } else {
            setCityId(undefined);
            setStreetId(undefined);
        }
    }, [lang]);
    const handleStreetSearch = useCallback(async (query: string, page: number) => {
        const targetCityId = cityId || 2581;
        try {
            const res = await getStreetsApi(targetCityId, query, 50, page, lang);
            return {
                data: res.data.map(item => ({ id: item.id, name: item.name })),
                hasMore: res.has_more_pages
            };
        } catch (e) {
            console.error('Error fetching streets:', e);
            return { data: [], hasMore: false };
        }
    }, [cityId, lang]);

    const handleStreetSelect = useCallback((option: { id: number | string; name: string } | null) => {
        if (option) {
            setStreet(option.name);
            setStreetId(option.id as number);
        } else {
            setStreet('');
            setStreetId(undefined);
            // Reset subsequent fields on street clear
            setHouse('');
            setApartment('');
            setEntrance('');
            setFloor('');
        }
    }, []);

    const geocodePosition = useCallback((pos: { lat: number; lng: number }) => {
        if (typeof window === 'undefined' || !window.google) return;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: pos }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const result = results[0];
                const components = result.address_components || [];
                let parsedStreet = '';
                let parsedHouse = '';
                let parsedCity = 'Київ';

                for (const component of components) {
                    const types = component.types;
                    if (types.includes('route')) {
                        parsedStreet = component.long_name;
                    } else if (types.includes('street_number')) {
                        parsedHouse = component.long_name;
                    } else if (types.includes('locality')) {
                        parsedCity = component.long_name;
                    }
                }

                setParsedAddress({
                    city: parsedCity,
                    street: parsedStreet,
                    house: parsedHouse
                });
                
                setMapSearch(cleanAddressText(result.formatted_address || ''));
                updateFormFromGeocode(parsedCity, parsedStreet, parsedHouse);
            }
        });
    }, [updateFormFromGeocode]);

    const handleMapConfirm = () => {
        if (!mapMarker) return;

        let streetVal = parsedAddress?.street || '';
        let houseVal = parsedAddress?.house || '';
        const cityVal = parsedAddress?.city || 'Київ';

        if (!streetVal && mapSearch) {
            const parts = mapSearch.split(',');
            if (parts.length > 0) {
                streetVal = parts[0].trim();
            }
            if (parts.length > 1) {
                houseVal = parts[1].trim();
            }
        }

        if (!streetVal) {
            streetVal = mapSearch || `${dict.coordinates}: ${mapMarker.lat.toFixed(4)}, ${mapMarker.lng.toFixed(4)}`;
        }

        onAdd({
            id: Math.random().toString(36).substr(2, 9),
            title: dict.selectedOnMapTitle,
            street: streetVal,
            streetId: streetId,
            city: cityVal,
            house: houseVal,
        });
        handleClose();
    };

    const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance);
    }, []);

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            const pos = { lat, lng };
            setMapMarker(pos);
            geocodePosition(pos);
        }
    }, [geocodePosition]);

    const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const onPlaceChanged = () => {
        const autocomplete = autocompleteRef.current;
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const newPos = { lat, lng };
                
                setMapMarker(newPos);
                if (map) {
                    map.panTo(newPos);
                    map.setZoom(16);
                }

                // Parse address components
                const components = place.address_components || [];
                let parsedStreet = '';
                let parsedHouse = '';
                let parsedCity = 'Київ';

                for (const component of components) {
                    const types = component.types;
                    if (types.includes('route')) {
                        parsedStreet = component.long_name;
                    } else if (types.includes('street_number')) {
                        parsedHouse = component.long_name;
                    } else if (types.includes('locality')) {
                        parsedCity = component.long_name;
                    }
                }

                setParsedAddress({
                    city: parsedCity,
                    street: parsedStreet,
                    house: parsedHouse
                });

                setMapSearch(cleanAddressText(place.formatted_address || ''));
                updateFormFromGeocode(parsedCity, parsedStreet, parsedHouse);
            }
        }
    };

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
                {view === 'form' ? (
                    <div className={s.modalContent}>
                        <h2 className={s.title}>{dict.addAddress}</h2>
                        <form className={s.form} onSubmit={handleFormSubmit}>
                            <div className={s.formRow}>
                                <SearchableSelect
                                    id="street"
                                    label={dict.street}
                                    value={street}
                                    onSearch={handleStreetSearch}
                                    onSelect={handleStreetSelect}
                                    required
                                    className={s.streetField}
                                />
                                <button 
                                    type="button" 
                                    className={s.mapToggleBtn}
                                    onClick={() => setView('map')}
                                >
                                    <span>{dict.findOnMap}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="14" viewBox="0 0 11 14" fill="none">
                                        <path d="M5.5 6.15314C5.77195 6.15314 6.03779 6.07096 6.26391 5.91699C6.49003 5.76302 6.66626 5.54418 6.77033 5.28814C6.8744 5.0321 6.90163 4.75036 6.84858 4.47855C6.79553 4.20674 6.66457 3.95706 6.47227 3.7611C6.27997 3.56513 6.03497 3.43168 5.76825 3.37761C5.50153 3.32354 5.22506 3.35129 4.97381 3.45735C4.72256 3.5634 4.50782 3.743 4.35673 3.97343C4.20564 4.20386 4.125 4.47478 4.125 4.75191C4.125 5.12354 4.26987 5.47995 4.52773 5.74273C4.78559 6.00551 5.13533 6.15314 5.5 6.15314ZM5.01188 10.9944C5.07579 11.06 5.15183 11.1122 5.2356 11.1477C5.31938 11.1833 5.40924 11.2016 5.5 11.2016C5.59076 11.2016 5.68062 11.1833 5.7644 11.1477C5.84817 11.1122 5.92421 11.06 5.98812 10.9944L8.8 8.12186C9.45309 7.45666 9.89793 6.60902 10.0782 5.68615C10.2586 4.76328 10.1663 3.80665 9.81302 2.93725C9.45977 2.06785 8.86145 1.32473 8.09373 0.801899C7.326 0.279065 6.42337 0 5.5 0C4.57663 0 3.674 0.279065 2.90628 0.801899C2.13855 1.32473 1.54023 2.06785 1.18698 2.93725C0.833734 3.80665 0.741432 4.76328 0.92175 5.68615C1.10207 6.60902 1.54691 7.45666 2.2 8.12186L5.01188 10.9944ZM2.22062 4.42963C2.2676 3.93011 2.42345 3.44758 2.6768 3.01728C2.93015 2.58697 3.2746 2.21976 3.685 1.94246C4.22414 1.58171 4.85503 1.3895 5.5 1.3895C6.14497 1.3895 6.77586 1.58171 7.315 1.94246C7.72266 2.21881 8.06516 2.5838 8.31788 3.01116C8.57059 3.43852 8.72723 3.91764 8.77653 4.41407C8.82584 4.91049 8.76658 5.41188 8.60303 5.88218C8.43947 6.35248 8.17568 6.78 7.83063 7.134L5.5 9.50907L3.16937 7.134C2.82392 6.78343 2.55951 6.35879 2.39539 5.89097C2.23127 5.42315 2.17157 4.92393 2.22062 4.42963ZM10.3125 12.5988H0.6875C0.505164 12.5988 0.330295 12.6726 0.201364 12.804C0.072433 12.9354 0 13.1136 0 13.2994C0 13.4852 0.072433 13.6634 0.201364 13.7948C0.330295 13.9262 0.505164 14 0.6875 14H10.3125C10.4948 14 10.6697 13.9262 10.7986 13.7948C10.9276 13.6634 11 13.4852 11 13.2994C11 13.1136 10.9276 12.9354 10.7986 12.804C10.6697 12.6726 10.4948 12.5988 10.3125 12.5988Z" fill="black"/>
                                    </svg>
                                </button>
                            </div>
                            <div className={s.gridFields}>
                                <InputField 
                                    id="house"
                                    label={dict.house}
                                    value={house}
                                    onChange={(e) => setHouse(e.target.value)}
                                    required
                                    disabled={!street}
                                />
                                <InputField 
                                    id="apartment"
                                    label={dict.apartment}
                                    value={apartment}
                                    onChange={(e) => setApartment(e.target.value)}
                                    disabled={!street}
                                />
                                <InputField 
                                    id="entrance"
                                    label={dict.entrance}
                                    value={entrance}
                                    onChange={(e) => setEntrance(e.target.value)}
                                    disabled={!street}
                                />
                                <InputField 
                                    id="floor"
                                    label={dict.floor}
                                    value={floor}
                                    onChange={(e) => setFloor(e.target.value)}
                                    disabled={!street}
                                />
                            </div>
                            <Button 
                                variant="red" 
                                type="submit" 
                                className={s.submitBtn} 
                                disabled={!street || !house}
                            >
                                {lang === 'ua' ? 'ДОДАТИ АДРЕСУ' : 'ДОБАВИТЬ АДРЕС'}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className={s.mapViewLayout}>
                        <div className={s.mapHeader}>
                            <h2 className={s.title} style={{marginBottom: 0}}>{dict.selectOnMapTitle}</h2>
                            {isLoaded && (
                                <div className={s.mapSearchWrapper}>
                                    <Autocomplete
                                        onLoad={onAutocompleteLoad}
                                        onPlaceChanged={onPlaceChanged}
                                        options={{
                                            componentRestrictions: { country: 'UA' },
                                            bounds: new window.google.maps.LatLngBounds(
                                                new window.google.maps.LatLng(50.25, 30.20),
                                                new window.google.maps.LatLng(50.60, 30.85)
                                            ),
                                            strictBounds: true,
                                            types: ['address']
                                        }}
                                    >
                                        <Search 
                                            value={mapSearch}
                                            onChange={setMapSearch}
                                            placeholder={dict.searchStreetPlaceholder}
                                            showButton={false}
                                            className={s.mapSearch}
                                            fullWidthDropdown
                                        />
                                    </Autocomplete>
                                </div>
                            )}
                        </div>

                        <div className={s.mapContainer}>
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={containerStyle}
                                    center={mapMarker || center}
                                    zoom={14}
                                    onLoad={onMapLoad}
                                    onClick={onMapClick}
                                    options={{
                                        styles: DARK_MAP_STYLE,
                                        disableDefaultUI: true,
                                        zoomControl: true,
                                    }}
                                >
                                    {mapMarker && <Marker position={mapMarker} />}
                                </GoogleMap>
                            ) : (
                                <div className={s.mapPlaceholder}>{dict.loadingMap}</div>
                            )}
                        </div>

                        <div className={s.mapFooter}>
                            <div className={s.mapAddressText}>
                                {mapSearch || (mapMarker ? dict.selectedPlace : dict.selectPlaceOnMap)}
                            </div>
                            <div className={s.footerButtons}>
                                <Button 
                                    variant="outline-black" 
                                    className={s.backToFormBtn} 
                                    onClick={() => setView('form')}
                                >
                                    {dict.backBtn}
                                </Button>
                                <Button 
                                    variant="red" 
                                    className={s.confirmBtn}
                                    onClick={handleMapConfirm}
                                    disabled={!mapMarker && !mapSearch}
                                >
                                    {dict.confirmBtn}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
