'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from 'react-modal';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import s from './AddAddressModal.module.scss';
import useScrollLock from '@/hooks/useScrollLock';
import InputField from '@/app/components/ui/InputField';
import Button from '@/app/components/ui/Button/Button';
import Search from '@/app/components/ui/Search/Search';

interface AddAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (address: { id: string; title: string; street: string }) => void;
}

const containerStyle = {
    width: '100%',
    height: '100%',
};

const center = {
    lat: 50.4501,
    lng: 30.5234
};

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ['places'];

const darkMapStyle = [
    { "featureType": "all", "elementType": "geometry", "stylers": [{ "color": "#1d2c4d" }] },
    { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#8ec3b9" }] },
    { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a3646" }] },
    { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }] },
    { "featureType": "administrative.province", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }] },
    { "featureType": "administrative.land_parcel", "elementType": "labels", "stylers": [{ "visibility": "off" }] },
    { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#64779e" }] },
    { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [{ "color": "#334e87" }] },
    { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#023e58" }] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#283d6a" }] },
    { "featureType": "poi", "elementType": "labels.text", "stylers": [{ "visibility": "off" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#304a7d" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#2c6675" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1626" }] }
];

export default function AddAddressModal({ isOpen, onClose, onAdd }: AddAddressModalProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyBqMW1rDNxXNdeuJD8_z-hUfotocayp5ro',
        libraries
    });

    const [view, setView] = useState<'form' | 'map'>('form');
    const { disableScroll, enableScroll } = useScrollLock();

    // Form state
    const [street, setStreet] = useState('');
    const [house, setHouse] = useState('');
    const [apartment, setApartment] = useState('');
    const [entrance, setEntrance] = useState('');
    const [floor, setFloor] = useState('');
    
    // Map state
    const [mapMarker, setMapMarker] = useState<{lat: number, lng: number} | null>(null);
    const [mapSearch, setMapSearch] = useState('');
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

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
            setStreet('');
            setHouse('');
            setApartment('');
            setEntrance('');
            setFloor('');
            setMapMarker(null);
            setMapSearch('');
        }, 300);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!street || !house) return;
        
        const fullAddress = `вул. ${street}, дім ${house}${apartment ? `, кв. ${apartment}` : ''}`;
        onAdd({
            id: Math.random().toString(36).substr(2, 9),
            title: `Моя адреса №${Math.floor(Math.random() * 10) + 2}`,
            street: fullAddress
        });
        handleClose();
    };

    const handleMapConfirm = () => {
        if (!mapMarker) return;
        onAdd({
            id: Math.random().toString(36).substr(2, 9),
            title: 'Вибрана на карті',
            street: mapSearch || `Координати: ${mapMarker.lat.toFixed(4)}, ${mapMarker.lng.toFixed(4)}`
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
            setMapMarker({ lat, lng });
        }
    }, []);

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
                setMapSearch(place.formatted_address || '');
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
                                <InputField 
                                    id="street"
                                    label="Вулиця"
                                    value={street}
                                    onChange={(e) => setStreet(e.target.value)}
                                    required
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
                                />
                                <InputField 
                                    id="apartment"
                                    label="Квартира"
                                    value={apartment}
                                    onChange={(e) => setApartment(e.target.value)}
                                />
                                <InputField 
                                    id="entrance"
                                    label="Під’їзд"
                                    value={entrance}
                                    onChange={(e) => setEntrance(e.target.value)}
                                />
                                <InputField 
                                    id="floor"
                                    label="Поверх"
                                    value={floor}
                                    onChange={(e) => setFloor(e.target.value)}
                                />
                            </div>
                            <Button variant="red" type="submit" className={s.submitBtn}>
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
                                            componentRestrictions: { country: 'UA' }
                                        }}
                                    >
                                        <Search 
                                            value={mapSearch}
                                            onChange={setMapSearch}
                                            placeholder="Пошук по вулиці"
                                            showButton={false}
                                            className={s.mapSearch}
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
                                        styles: darkMapStyle,
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
