'use client';

import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { logoutApi } from '@/lib/graphql/queries/auth';
import { clearAuthCookies, getAccessToken } from '@/app/actions/authActions';
import { useRouter } from 'next/navigation';
import { Locale } from '@/i18n/config';
import PersonalNav from '../PersonalNav/PersonalNav';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs/Breadcrumbs';
import s from '@/app/[lang]/personal/PersonalLayout.module.scss';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { personalDict } from '../Shared/PersonalShared';

interface PersonalLayoutClientProps {
    children: React.ReactNode;
    lang: Locale;
}

export default function PersonalLayoutClient({ children, lang: paramsLang }: PersonalLayoutClientProps) {
    const { user, isGuest, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const hydrated = useIsHydrated();
    const lang: Locale = (paramsLang as Locale) || 'ua';
    const dict: typeof personalDict.ua = (personalDict[lang] || personalDict.ua) as typeof personalDict.ua;

    const breadcrumbItems = [
        { label: lang === 'ua' ? 'Головна' : 'Главная', href: `/${lang === 'ua' ? '' : 'ru'}` },
        { label: dict.title, href: '#' }
    ];

    const handleLogout = async () => {
        try {
            const token = await getAccessToken();
            if (token) await logoutApi(token);
        } catch {
            // Ignore
        } finally {
            await clearAuthCookies();
            dispatch(logout());
            router.replace('/');
        }
    };

    React.useEffect(() => {
        if (hydrated && isInitialized && (!isAuthenticated || isGuest)) {
            router.replace(`/${lang === 'ua' ? '' : lang}`);
        }
    }, [hydrated, isInitialized, isAuthenticated, isGuest, router, lang]);

    if (!hydrated || !isInitialized || !isAuthenticated || isGuest) {
        return null;
    }

    return (
        <main className={s.pageWrapper}>
            <div className={s.personalPage}>
                <div className={s.breadcrumbsWrapper}>
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                <div className={s.layoutBody}>
                    <aside className={s.sidebar}>
                        <PersonalNav
                            dict={dict.navigation} 
                            onLogout={handleLogout} 
                            user={user}
                            isDesktopOnly={true}
                        />
                    </aside>

                    <div className={s.mainContent}>
                        {children}
                    </div>
                </div>
            </div>
        </main>
    );
}
