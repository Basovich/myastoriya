import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import s from './DeliveryZones.module.scss';
import { Store } from '../../OurStores/StoreCard/StoreCard';
import StoreCard from '../../OurStores/StoreCard/StoreCard';
import { DeliveryPageDict, OurStoresPageDict } from '@/i18n/types';
import Search from '@/app/components/ui/Search/Search';
import { Locale } from '@/i18n/config';
import StoreMiniCard from '@/app/pages/DeliveryAndPayment/components/StoreMiniCard/StoreMiniCard';
import { GOOGLE_MAPS_API_KEY, DARK_MAP_STYLE } from '@/lib/constants';


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



export default function DeliveryZones({ stores, dict, storeDict, lang, isMeatBar }: DeliveryZonesProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY
    });

    const activeTab = isMeatBar ? 'meatbar' : 'restaurants';
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);

    const filteredStores = stores.filter(store => 
        activeTab === 'restaurants' ? store.type !== 'meatbar' : store.type === 'meatbar'
    );

    const onMapLoad = useCallback((map: google.maps.Map) => {
        if (filteredStores.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            filteredStores.forEach((store) => {
                bounds.extend({ lat: store.lat, lng: store.lng });
            });
            map.fitBounds(bounds);
        }
    }, [filteredStores]);


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
                <Search
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder={dict.zones.search.placeholder}
                    buttonText={dict.zones.search.button}
                    buttonColor="red"
                    className={s.search}
                />
            </div>


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
