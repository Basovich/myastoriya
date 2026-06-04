import React, { useCallback, useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import s from "./StoreMap.module.scss";
import { type Store } from "../StoreCard/StoreCard";
import StoreCard from "../StoreCard/StoreCard";
import { GOOGLE_MAPS_API_KEY, DARK_MAP_STYLE, GOOGLE_MAPS_LIBRARIES } from "@/lib/constants";

// Dark map style


const containerStyle = {
    width: "100%",
    height: "600px",
    borderRadius: "16px"
};

const center = {
    lat: 50.4501,
    lng: 30.5234
};

interface StoreMapProps {
    stores: Store[];
    dict: {
        workingHours: string;
        details: string;
        route: string;
        open: string;
        closed: string;
        address: string;
        workingHoursLabel: string;
        phoneLabel: string;
    };
}

// Google Maps loader options must be a stable module-level constant.
// useJsApiLoader is a singleton — calling it with different options (e.g. a
// different `language` after a locale switch) throws a runtime error.
// We read the locale from the URL once at module initialisation time.
const initialLang = typeof window !== 'undefined'
    ? (window.location.pathname.startsWith('/ru') ? 'ru' : 'uk')
    : 'uk';

const MAPS_LOADER_OPTIONS = {
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
    language: initialLang,
} as const;

export default function StoreMap({ stores, dict }: StoreMapProps) {
    const { isLoaded } = useJsApiLoader(MAPS_LOADER_OPTIONS);

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);

    const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance);
    }, []);

    // Fit map bounds whenever the active list of stores changes
    useEffect(() => {
        if (map && stores.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            stores.forEach((store) => {
                if (store.lat && store.lng) {
                    bounds.extend({ lat: store.lat, lng: store.lng });
                }
            });
            map.fitBounds(bounds);
        }
    }, [map, stores]);

    // Close InfoWindow if the selected store is filtered out
    useEffect(() => {
        if (selectedStore && !stores.some(s => s.id === selectedStore.id)) {
            setSelectedStore(null);
        }
    }, [stores, selectedStore]);


    return isLoaded ? (
        <div className={s.mapWrapper}>
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
                {stores.map((store) => (
                    <Marker
                        key={store.id}
                        position={{ lat: store.lat, lng: store.lng }}
                        onClick={() => setSelectedStore(store)}
                        icon={{
                            url: "/icons/stores/map-pin.svg",
                            scaledSize: new window.google.maps.Size(28, 41)
                        }}
                    />
                ))}

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
                                dict={dict} 
                                variant="map" 
                                onClose={() => setSelectedStore(null)}
                            />
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    ) : (
        <div className={s.loading}>Loading Map...</div>
    );
}
