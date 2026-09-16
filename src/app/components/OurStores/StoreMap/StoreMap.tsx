import React, { useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import s from "./StoreMap.module.scss";
import { type Store } from "../StoreCard/StoreCard";
import StoreCard from "../StoreCard/StoreCard";
import { GOOGLE_MAPS_API_KEY, DARK_MAP_STYLE, GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_LOADER_OPTIONS } from "@/lib/constants";

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
    const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_LOADER_OPTIONS);

    const [selectedStore, setSelectedStore] = useState<Store | null>(null);

    // If selectedStore is filtered out, clear it during render (derived state pattern)
    const activeSelectedStore = selectedStore && stores.some(s => s.id === selectedStore.id)
        ? selectedStore
        : null;

    return isLoaded ? (
        <div className={s.mapWrapper}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={11}
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

                {activeSelectedStore && (
                    <InfoWindow
                        position={{ lat: activeSelectedStore.lat, lng: activeSelectedStore.lng }}
                        onCloseClick={() => setSelectedStore(null)}
                        options={{
                            pixelOffset: new window.google.maps.Size(0, -30)
                        }}
                    >
                        <div className={s.infoWindowContainer}>
                            <StoreCard 
                                store={activeSelectedStore} 
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
