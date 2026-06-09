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
    }) => void;
}

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
    const [city, setCity] = useState('');
    const [cityId, setCityId] = useState<number | undefined>(undefined);
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
            setCity('');
            setCityId(undefined);
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
        
        const fullAddress = `вул. ${street}, дім ${house}${apartment ? `, кв. ${apartment}` : ''}`;
        onAdd({
            id: Math.random().toString(36).substr(2, 9),
            title: `Моя адреса №${Math.floor(Math.random() * 10) + 2}`,
            street: street,
            streetId: streetId,
            city,
            house,
            apartment,
            entrance,
            floor,
            fullAddress
        } as any);
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

    const handleCitySearch = useCallback(async (query: string, page: number) => {
        try {
            const res = await getLocalitiesApi(query, 50, page, lang);
            return {
                data: res.data.map(item => ({ id: item.id, name: item.name })),
                hasMore: res.has_more_pages
            };
        } catch (e) {
            console.error('Error fetching cities:', e);
            return { data: [], hasMore: false };
        }
    }, [lang]);

    const handleStreetSearch = useCallback(async (query: string, page: number) => {
        if (!cityId) return { data: [], hasMore: false };
        try {
            const res = await getStreetsApi(cityId, query, 50, page, lang);
            return {
                data: res.data.map(item => ({ id: item.id, name: item.name })),
                hasMore: res.has_more_pages
            };
        } catch (e) {
            console.error('Error fetching streets:', e);
            return { data: [], hasMore: false };
        }
    }, [cityId, lang]);


    const handleCitySelect = useCallback((option: { id: number | string; name: string } | null) => {
        if (option) {
            setCity(option.name);
            setCityId(option.id as number);
        } else {
            setCity('');
            setCityId(undefined);
        }
        // Always reset street and subsequent fields on city change
        setStreet('');
        setStreetId(undefined);
        setHouse('');
        setApartment('');
        setEntrance('');
        setFloor('');
    }, []);

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
        let cityVal = parsedAddress?.city || 'Київ';

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
            streetVal = mapSearch || `Координати: ${mapMarker.lat.toFixed(4)}, ${mapMarker.lng.toFixed(4)}`;
        }

        onAdd({
            id: Math.random().toString(36).substr(2, 9),
            title: 'Вибрана на карті',
            street: streetVal,
            streetId: streetId,
            city: cityVal,
            house: houseVal,
        } as any);
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
            <button className={s.closeBtn} onClick={handleClose} aria-label="Закрити">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            <div className={s.modal}>
                {view === 'form' ? (
                    <div className={s.modalContent}>
                        <h2 className={s.title}>Додати адресу</h2>
                        <form className={s.form} onSubmit={handleFormSubmit}>
                            <div className={s.formRow}>
                                <SearchableSelect
                                    id="city"
                                    label="Місто"
                                    value={city}
                                    onSearch={handleCitySearch}
                                    onSelect={handleCitySelect}
                                    required
                                    className={s.cityField}
                                />
                            </div>
                            <div className={s.formRow}>
                                <SearchableSelect
                                    id="street"
                                    label="Вулиця"
                                    value={street}
                                    onSearch={handleStreetSearch}
                                    onSelect={handleStreetSelect}
                                    required
                                    disabled={!cityId}
                                    className={s.streetField}
                                />
                                <button 
                                    type="button" 
                                    className={s.mapToggleBtn}
                                    onClick={() => setView('map')}
                                >
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path d="M9 16.5C12.3137 16.5 15 13.8137 15 10.5C15 7.18629 12.3137 4.5 9 4.5C5.68629 4.5 3 7.18629 3 10.5C3 13.8137 5.68629 16.5 9 16.5Z" stroke="black" strokeWidth="1.2" />
                                        <path d="M9 12.75V10.5" stroke="black" strokeWidth="1.2" strokeLinecap="round" />
                                        <path d="M9 8.25V7.5" stroke="black" strokeWidth="1.2" strokeLinecap="round" />
                                        <rect x="7.5" y="1.5" width="3" height="3" rx="0.5" stroke="black" strokeWidth="1.2" />
                                    </svg>
                                    Знайти на карті
                                </button>
                            </div>
                            <div className={s.gridFields}>
                                <InputField 
                                    id="house"
                                    label="Будинок"
                                    value={house}
                                    onChange={(e) => setHouse(e.target.value)}
                                    required
                                    disabled={!street}
                                />
                                <InputField 
                                    id="apartment"
                                    label="Квартира"
                                    value={apartment}
                                    onChange={(e) => setApartment(e.target.value)}
                                    disabled={!street}
                                />
                                <InputField 
                                    id="entrance"
                                    label="Під’їзд"
                                    value={entrance}
                                    onChange={(e) => setEntrance(e.target.value)}
                                    disabled={!street}
                                />
                                <InputField 
                                    id="floor"
                                    label="Поверх"
                                    value={floor}
                                    onChange={(e) => setFloor(e.target.value)}
                                    disabled={!street}
                                />
                            </div>
                            <Button variant="red" type="submit" className={s.submitBtn} disabled={!street || !house}>
                                ДОДАТИ АДРЕСУ
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className={s.mapViewLayout}>
                        <div className={s.mapHeader}>
                            <h2 className={s.title} style={{marginBottom: 0}}>Обрати адресу на карті</h2>
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
                                            placeholder="Пошук по вулиці"
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
                                <div className={s.mapPlaceholder}>Loading map...</div>
                            )}
                        </div>

                        <div className={s.mapFooter}>
                            <div className={s.mapAddressText}>
                                {mapSearch || (mapMarker ? `Обране місце` : 'Виберіть місце на карті')}
                            </div>
                            <div className={s.footerButtons}>
                                <Button 
                                    variant="outline-black" 
                                    className={s.backToFormBtn} 
                                    onClick={() => setView('form')}
                                >
                                    ПОВЕРНУТИСЬ
                                </Button>
                                <Button 
                                    variant="red" 
                                    className={s.confirmBtn}
                                    onClick={handleMapConfirm}
                                    disabled={!mapMarker && !mapSearch}
                                >
                                    ПІДТВЕРДИТИ
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
