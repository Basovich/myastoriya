import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Autocomplete } from '@react-google-maps/api';
import s from './DeliveryZones.module.scss';
import { Store } from '../../OurStores/StoreCard/StoreCard';
import StoreCard from '../../OurStores/StoreCard/StoreCard';
import { DeliveryPageDict, OurStoresPageDict } from '@/i18n/types';
import Search from '@/app/components/ui/Search/Search';
import { Locale } from '@/i18n/config';
import StoreMiniCard from '@/app/pages/DeliveryAndPayment/components/StoreMiniCard/StoreMiniCard';
import { GOOGLE_MAPS_API_KEY, DARK_MAP_STYLE, GOOGLE_MAPS_LIBRARIES } from '@/lib/constants';

interface DeliveryZonesProps {
    stores: Store[];
    dict: DeliveryPageDict;
    storeDict: OurStoresPageDict['storeCard'];
    lang: Locale;
    isMeatBar: boolean;
}

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '20px'
};

const center = {
    lat: 50.4501,
    lng: 30.5234
};



function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

export default function DeliveryZones({ stores, dict, storeDict, lang, isMeatBar }: DeliveryZonesProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_MAPS_LIBRARIES
    });

    const activeTab = isMeatBar ? 'meatbar' : 'restaurants';
    const [searchQuery, setSearchQuery] = useState('');
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [userMarker, setUserMarker] = useState<{ lat: number; lng: number } | null>(null);
    const [checkResult, setCheckResult] = useState<{
        isFree: boolean;
        closestStoreName: string;
        distanceKm: number;
    } | null>(null);

    const filteredStores = stores.filter(store => 
        activeTab === 'restaurants' ? store.type !== 'meatbar' : store.type === 'meatbar'
    );

    const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const performDeliveryCheck = useCallback((lat: number, lng: number) => {
        if (filteredStores.length === 0) return;

        let closestStore = filteredStores[0];
        let minDistance = getDistanceFromLatLonInKm(lat, lng, closestStore.lat, closestStore.lng);

        for (let i = 1; i < filteredStores.length; i++) {
            const store = filteredStores[i];
            const dist = getDistanceFromLatLonInKm(lat, lng, store.lat, store.lng);
            if (dist < minDistance) {
                minDistance = dist;
                closestStore = store;
            }
        }

        const isFree = minDistance <= 3.0;
        setCheckResult({
            isFree,
            closestStoreName: closestStore.name,
            distanceKm: minDistance
        });

        setUserMarker({ lat, lng });
        if (map) {
            map.panTo({ lat, lng });
            map.setZoom(14);
        }
    }, [filteredStores, map]);

    const onPlaceChanged = () => {
        const autocomplete = autocompleteRef.current;
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                setSearchQuery(place.formatted_address || place.name || '');
                performDeliveryCheck(lat, lng);
            }
        }
    };

    const handleSearchSubmit = () => {
        const autocomplete = autocompleteRef.current;
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place && place.geometry && place.geometry.location) {
                performDeliveryCheck(place.geometry.location.lat(), place.geometry.location.lng());
                return;
            }
        }

        if (searchQuery && typeof window !== 'undefined' && window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address: searchQuery, componentRestrictions: { country: 'UA' } }, (results, status) => {
                if (status === 'OK' && results && results[0] && results[0].geometry) {
                    const loc = results[0].geometry.location;
                    setSearchQuery(results[0].formatted_address);
                    performDeliveryCheck(loc.lat(), loc.lng());
                }
            });
        }
    };

    const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance);
    }, []);

    // Fit map bounds whenever the active list of stores changes
    useEffect(() => {
        if (map && filteredStores.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            filteredStores.forEach((store) => {
                bounds.extend({ lat: store.lat, lng: store.lng });
            });
            map.fitBounds(bounds);
        }
    }, [map, filteredStores]);

    // Close InfoWindow if the selected store is filtered out
    useEffect(() => {
        if (selectedStore && !filteredStores.some(s => s.id === selectedStore.id)) {
            setSelectedStore(null);
        }
    }, [filteredStores, selectedStore]);



    return (
        <section className={s.zonesSection}>
            <div className={s.mapWrapper}>
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={12}
                        onLoad={onMapLoad}
                        options={{
                            styles: DARK_MAP_STYLE,
                            disableDefaultUI: true,
                            zoomControl: true,
                        }}
                    >
                        {filteredStores.map((store) => (
                            <Marker
                                key={store.id}
                                position={{ lat: store.lat, lng: store.lng }}
                                onClick={() => setSelectedStore(store)}
                                icon={{
                                    url: '/icons/stores/map-pin.svg',
                                    scaledSize: new window.google.maps.Size(28, 41)
                                }}
                            />
                        ))}

                        {userMarker && (
                            <Marker
                                position={userMarker}
                            />
                        )}

                        {selectedStore && (
                            <InfoWindow
                                position={{ lat: selectedStore.lat, lng: selectedStore.lng }}
                                onCloseClick={() => setSelectedStore(null)}
                                options={{
                                    pixelOffset: new window.google.maps.Size(0, -30)
                                }}
                            >
                                <div className={s.infoWindowContainer}>
                                    <StoreCard
                                        store={selectedStore}
                                        dict={storeDict}
                                        variant="map"
                                        onClose={() => setSelectedStore(null)}
                                    />
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                ) : (
                    <div className={s.mapPlaceholder}>Loading Map...</div>
                )}
            </div>

            <div className={s.searchRow}>
                <p className={s.infoBadge}>
                    А мені безкоштовно?
                </p>
                {isLoaded ? (
                    <div className={s.search}>
                        <Autocomplete
                            onLoad={onAutocompleteLoad}
                            onPlaceChanged={onPlaceChanged}
                            options={{
                                componentRestrictions: { country: 'UA' }
                            }}
                        >
                            <Search
                                value={searchQuery}
                                onChange={(val) => {
                                    setSearchQuery(val);
                                    if (!val) {
                                        setCheckResult(null);
                                        setUserMarker(null);
                                    }
                                }}
                                placeholder={dict.zones.search.placeholder}
                                buttonText={dict.zones.search.button}
                                buttonColor="black"
                                onSubmit={handleSearchSubmit}
                                fullWidthDropdown
                            />
                        </Autocomplete>
                    </div>
                ) : (
                    <div className={s.search}>
                        <Search
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder={dict.zones.search.placeholder}
                            buttonText={dict.zones.search.button}
                            buttonColor="black"
                        />
                    </div>
                )}
            </div>

            {checkResult && (
                <div className={`${s.resultCard} ${checkResult.isFree ? s.free : s.paid}`}>
                    <div className={s.resultIcon}>
                        {checkResult.isFree ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M22 4L12 14.01l-3-3" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="#D84315" strokeWidth="2"/>
                                <line x1="12" y1="8" x2="12" y2="12" stroke="#D84315" strokeWidth="2" strokeLinecap="round"/>
                                <line x1="12" y1="16" x2="12.01" y2="16" stroke="#D84315" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        )}
                    </div>
                    <div className={s.resultText}>
                        {checkResult.isFree ? (
                            <>
                                <strong>Доставка безкоштовна!</strong> Ваша адреса знаходиться в межах 3 км від найближчого закладу <strong>{checkResult.closestStoreName}</strong> (відстань: {checkResult.distanceKm.toFixed(2)} км).
                            </>
                        ) : (
                            <>
                                <strong>Доставка платна.</strong> Ваша адреса знаходиться за межами 3 км від найближчого закладу <strong>{checkResult.closestStoreName}</strong> (відстань: {checkResult.distanceKm.toFixed(2)} км).
                            </>
                        )}
                    </div>
                    <button className={s.clearResultBtn} onClick={() => { setCheckResult(null); setUserMarker(null); setSearchQuery(''); }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            )}


            <div className={s.storesList}>
                {/* Promo card is always first */}
                <StoreMiniCard isPromo={true} />

                {filteredStores.map(store => (
                    <StoreMiniCard key={store.id} store={store} />
                ))}
            </div>
        </section>
    );
}
