'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Locale } from '@/i18n/config';
import PickupClient from '@/app/components/Personal/Pickup/PickupClient';

export default function PickupPointsPage() {
    const { user } = useAppSelector((state) => state.auth);
    const params = useParams();
    const lang = (params?.lang as Locale) || 'ua';

    return <PickupClient user={user} lang={lang} />;
}
