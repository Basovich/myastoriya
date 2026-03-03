'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const params = useParams();
    const lang = params?.lang as string || 'ua';

    const { isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace(`/${lang}/`);
        }
    }, [isAuthenticated, lang, router]);

    if (!isAuthenticated) return null;

    return <>{children}</>;
}
