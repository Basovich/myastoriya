import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import s from './DeliveryZones.module.scss';
import clsx from 'clsx';
import { Store } from '../../OurStores/StoreCard/StoreCard';
import StoreCard from '../../OurStores/StoreCard/StoreCard';
import { DeliveryPageDict, OurStoresPageDict } from '@/i18n/types';
import SectionHeader from '@/app/components/ui/SectionHeader/SectionHeader';
import Button from '@/app/components/ui/Button/Button';
import Search from '@/app/components/ui/Search/Search';
import { Locale } from '@/i18n/config';
import StoreMiniCard from '@/app/pages/DeliveryAndPayment/components/StoreMiniCard/StoreMiniCard';


interface DeliveryZonesProps {
    stores: Store[];
    dict: DeliveryPageDict;
    storeDict: OurStoresPageDict['storeCard'];
    lang: Locale;
    isMeatBar: boolean;
}

const containerStyle = {
    width: '100%',
    height: '450px',
    borderRadius: '20px'
};

const center = {
    lat: 50.4501,
    lng: 30.5234
};

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

export default function DeliveryZones({ stores, dict, storeDict, lang, isMeatBar }: DeliveryZonesProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyBqMW1rDNxXNdeuJD8_z-hUfotocayp5ro'
    });

    const activeTab = isMeatBar ? 'meatbar' : 'restaurants';
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);

    const filteredStores = stores.filter(store => 
        activeTab === 'restaurants' ? store.type !== 'meatbar' : store.type === 'meatbar'
    );

    const onMapLoad = useCallback((map: any) => {
        if (filteredStores.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            filteredStores.forEach((store) => {
                bounds.extend({ lat: store.lat, lng: store.lng });
            });
            map.fitBounds(bounds);
        }
    }, [filteredStores]);

    const langPrefix = lang === 'ua' ? '' : `/${lang}`;

    return (
        <section className={s.zonesSection}>
            <div className={s.container}>
                <div className={s.header}>
                    <SectionHeader title={dict.zones.title} classNameWrapper={s.sectionHeader} />
                    <div className={s.tabs}>
                        <Button 
                            href={`${langPrefix}/delivery`}
                            variant={!isMeatBar ? "black" : "outline-black"}
                            active={!isMeatBar}
                            className={s.tab}
                        >
                            {dict.zones.tabs.restaurants}
                        </Button>
                        <Button 
                            href={`${langPrefix}/delivery-meat-bar`}
                            variant={isMeatBar ? "black" : "outline-black"}
                            active={isMeatBar}
                            className={s.tab}
                        >
                            {dict.zones.tabs.meatbar}
                        </Button>
                    </div>
                </div>

                <div className={s.mapWrapper}>
                    {isLoaded ? (
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
                    <Search
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={dict.zones.search.placeholder}
                        buttonText={dict.zones.search.button}
                        buttonColor="black"
                        className={s.search}
                    />
                    <div className={s.infoBadge}>
                        <span className={s.dot}></span>
                        {dict.zones.info}
                    </div>
                </div>


                <div className={s.storesList}>
                    {/* Promo card is always first */}
                    <StoreMiniCard isPromo={true} />
                    
                    {filteredStores.map(store => (
                        <StoreMiniCard key={store.id} store={store} />
                    ))}
                </div>
            </div>
        </section>
    );
}
