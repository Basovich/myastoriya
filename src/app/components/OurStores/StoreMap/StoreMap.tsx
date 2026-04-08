import React, { useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import s from "./StoreMap.module.scss";
import { type Store } from "../StoreCard/StoreCard";
import StoreCard from "../StoreCard/StoreCard";
import { GOOGLE_MAPS_API_KEY, DARK_MAP_STYLE } from "@/lib/constants";

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

export default function StoreMap({ stores, dict }: StoreMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: GOOGLE_MAPS_API_KEY
    });

    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const onMapLoad = useCallback((map: google.maps.Map) => {
        const bounds = new window.google.maps.LatLngBounds();
        stores.forEach((store) => {
            bounds.extend({ lat: store.lat, lng: store.lng });
        });
        if (stores.length > 0) {
            map.fitBounds(bounds);
        }
    }, [stores]);

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
