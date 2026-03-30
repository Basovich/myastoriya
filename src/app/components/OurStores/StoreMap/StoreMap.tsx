import React, { useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import s from "./StoreMap.module.scss";
import { type Store } from "../StoreCard/StoreCard";
import StoreCard from "../StoreCard/StoreCard";

// Dark map style
const darkMapStyle = [
    {
        "featureType": "all",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#1d2c4d"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#8ec3b9"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#1a3646"
            }
        ]
    },
    {
        "featureType": "administrative.country",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#4b6878"
            }
        ]
    },
    {
        "featureType": "administrative.province",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#4b6878"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#64779e"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#334e87"
            }
        ]
    },
    {
        "featureType": "landscape.natural",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#023e58"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#283d6a"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#6f9ba5"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#1d2c4d"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#023e58"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#3C7680"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#304a7d"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#98a5be"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#1d2c4d"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#2c6675"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#255763"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#b0d5ce"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#023e58"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#98a5be"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#1d2c4d"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#283d6a"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#3a4762"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#0e1626"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#4e6d70"
            }
        ]
    }
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
