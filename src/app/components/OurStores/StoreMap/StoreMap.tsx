import React, { useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import s from "./StoreMap.module.scss";
import { type Store } from "../StoreCard/StoreCard";
import StoreCard from "../StoreCard/StoreCard";

// Dark map style
const darkMapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
    { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
    { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
    { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
    { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
    { "featureType": "poi.park", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1b1b1b" }] },
    { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
    { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#373737" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] },
    { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#4e4e4e" }] },
    { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
    { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d3d3d" }] }
];

const containerStyle = {
    width: "100%",
    height: "500px",
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
        googleMapsApiKey: "AIzaSyBqMW1rDNxXNdeuJD8_z-hUfotocayp5ro"
    });

    const [selectedStore, setSelectedStore] = useState<Store | null>(null);

    const onMapLoad = useCallback((map: any) => {
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
                    styles: darkMapStyle,
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
                            scaledSize: new window.google.maps.Size(40, 48)
                        }}
                    />
                ))}

                {selectedStore && (
                    <InfoWindow
                        position={{ lat: selectedStore.lat, lng: selectedStore.lng }}
                        onCloseClick={() => setSelectedStore(null)}
                    >
                        <div className={s.infoWindow}>
                            <StoreCard store={selectedStore} dict={dict} variant="map" />
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    ) : (
        <div className={s.loading}>Loading Map...</div>
    );
}
