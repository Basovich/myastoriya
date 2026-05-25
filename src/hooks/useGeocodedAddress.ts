import { useState, useEffect } from 'react';
import { GOOGLE_MAPS_API_KEY } from '@/lib/constants';

const addressCache = new Map<string, string>();

interface AddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
}

function translateToRussian(text: string): string {
    return text
        .replace(/(?<![а-яА-ЯёЁіІїЇєЄґҐ])Київ(?![а-яА-ЯёЁіІїЇєЄґҐ])/g, 'Киев')
        .replace(/(?<![а-яА-ЯёЁіІїЇєЄґҐ])вулиця(?![а-яА-ЯёЁіІїЇєЄґҐ])/gi, 'улица')
        .replace(/(?<![а-яА-ЯёЁіІїЇєЄґҐ])вул\.(?![а-яА-ЯёЁіІїЇєЄґҐ])/gi, 'ул.')
        .replace(/(?<![а-яА-ЯёЁіІїЇєЄґҐ])провулок(?![а-яА-ЯёЁіІїЇєЄґҐ])/gi, 'переулок')
        .replace(/(?<![а-яА-ЯёЁіІїЇєЄґҐ])пров\.(?![а-яА-ЯёЁіІїЇєЄґҐ])/gi, 'пер.')
        .replace(/(?<![а-яА-ЯёЁіІїЇєЄґҐ])площа(?![а-яА-ЯёЁіІїЇєЄґҐ])/gi, 'площадь')
        .replace(/(?<![а-яА-ЯёЁіІїЇєЄґҐ])шосе(?![а-яА-ЯёЁіІїЇєЄґҐ])/gi, 'шоссе')
        .replace(/(?<![а-яА-ЯёЁіІїЇєЄґҐ])набережна(?![а-яА-ЯёЁіІїЇєЄґҐ])/gi, 'набережная')
        .replace(/(?<![а-яА-ЯёЁіІїЇєЄґҐ])колишня(?![а-яА-ЯёЁіІїЇєЄґҐ])/gi, 'бывшая');
}

function parseAndFormatAddress(components: AddressComponent[], fallbackFormatted: string): string {
    let city = '';
    let route = '';
    let streetNumber = '';

    for (const comp of components) {
        if (comp.types.includes('locality')) {
            city = comp.long_name;
        } else if (comp.types.includes('route')) {
            route = comp.long_name;
        } else if (comp.types.includes('street_number')) {
            streetNumber = comp.long_name;
        }
    }

    // Fallback for city/locality
    if (!city) {
        for (const comp of components) {
            if (comp.types.includes('administrative_area_level_2') || comp.types.includes('administrative_area_level_1')) {
                city = comp.long_name;
                break;
            }
        }
    }

    if (city && route) {
        const parts = [city, route];
        if (streetNumber) {
            parts.push(streetNumber);
        }
        return parts.join(', ');
    }

    // Fallback: strip country and postal code from formatted address
    let cleaned = fallbackFormatted;
    cleaned = cleaned.replace(/,\s*(Україна|Украина|Ukraine)(,\s*\d{5})?$/i, '');
    cleaned = cleaned.replace(/(,\s*\d{5})?\s*,\s*(Україна|Украина|Ukraine)$/i, '');
    cleaned = cleaned.replace(/,\s*\d{5}$/, '');
    return cleaned.trim();
}

export function useGeocodedAddress(
    lat: number | undefined | null,
    lng: number | undefined | null,
    fallbackAddress: string,
    lang: string
) {
    const [address, setAddress] = useState(fallbackAddress);

    useEffect(() => {
        if (!lat || !lng) {
            setAddress(fallbackAddress);
            return;
        }

        const cacheKey = `${lat},${lng},${lang}`;
        if (addressCache.has(cacheKey)) {
            setAddress(addressCache.get(cacheKey)!);
            return;
        }

        const googleLanguage = lang === 'ua' ? 'uk' : 'ru';
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=${googleLanguage}`;

        let isMounted = true;
        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error('Network response not OK');
                return res.json();
            })
            .then((data) => {
                if (isMounted && data.status === 'OK' && data.results && data.results[0]) {
                    const formatted = parseAndFormatAddress(
                        data.results[0].address_components,
                        data.results[0].formatted_address
                    );
                    const finalAddress = lang === 'ru' ? translateToRussian(formatted) : formatted;
                    addressCache.set(cacheKey, finalAddress);
                    setAddress(finalAddress);
                }
            })
            .catch((err) => {
                console.error('Failed to reverse geocode coordinate:', lat, lng, err);
                if (isMounted) {
                    setAddress(fallbackAddress);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [lat, lng, fallbackAddress, lang]);

    return address;
}
