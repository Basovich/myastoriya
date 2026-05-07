'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Locale } from '@/i18n/config';
import AddressesClient from '@/app/components/Personal/Addresses/AddressesClient';

export default function AddressesPage() {
    const { user } = useAppSelector((state) => state.auth);
    const params = useParams();
    const lang = (params?.lang as Locale) || 'ua';

    return <AddressesClient user={user} lang={lang} />;
}
