"use client";

import React from 'react';
import { useGeocodedAddress } from '@/hooks/useGeocodedAddress';
import { useParams } from 'next/navigation';
import { Locale } from '@/i18n/config';

interface GeocodedAddressClientProps {
    lat?: number | null;
    lng?: number | null;
    fallbackAddress: string;
    className?: string;
}

export default function GeocodedAddressClient({
    lat,
    lng,
    fallbackAddress,
    className
}: GeocodedAddressClientProps) {
    const params = useParams();
    const lang = (params?.lang as Locale) || 'ua';
    const address = useGeocodedAddress(lat, lng, fallbackAddress, lang);

    return <span className={className}>{address}</span>;
}
