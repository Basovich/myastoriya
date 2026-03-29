import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import s from './DeliveryZones.module.scss';
import clsx from 'clsx';
import { Store } from '../../OurStores/StoreCard/StoreCard';
import { DeliveryPageDict, OurStoresPageDict } from '@/i18n/types';
import SectionHeader from '@/app/components/ui/SectionHeader/SectionHeader';
import Button from '@/app/components/ui/Button/Button';
import { Locale } from '@/i18n/config';

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
    { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
    { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

export default function DeliveryZones({ stores, dict, storeDict, lang, isMeatBar }: DeliveryZonesProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyBqMW1rDNxXNdeuJD8_z-hUfotocayp5ro'
    });

    const activeTab = isMeatBar ? 'meatbar' : 'restaurants';
    const [searchQuery, setSearchQuery] = useState('');

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
                            variant="black"
                            active={!isMeatBar}
                            className={s.tab}
                        >
                            {dict.zones.tabs.restaurants}
                        </Button>
                        <Button 
                            href={`${langPrefix}/delivery-meat-bar`}
                            variant="outline-black"
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
                                    icon={{
                                        url: '/icons/stores/map-pin.svg',
                                        scaledSize: new window.google.maps.Size(40, 48)
                                    }}
                                />
                            ))}
                        </GoogleMap>
                    ) : (
                        <div className={s.mapPlaceholder}>Loading Map...</div>
                    )}
                </div>

                <div className={s.searchRow}>
                    <div className={s.searchInputWrapper}>
                        <input 
                            type="text" 
                            placeholder={dict.zones.search.placeholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={s.searchInput}
                        />
                        <button className={s.searchBtn}>
                            {dict.zones.search.button}
                        </button>
                    </div>
                    <div className={s.infoBadge}>
                        <span className={s.dot}></span>
                        {dict.zones.info}
                    </div>
                </div>

                <div className={s.storesList}>
                    {filteredStores.map(store => (
                        <div key={store.id} className={s.storeMiniCard}>
                            <h4 className={s.storeName}>{store.name}</h4>
                            <div className={s.storeDetails}>
                                <p>{store.address}</p>
                                <p>{store.workingHours}</p>
                                <p>{store.phone}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
