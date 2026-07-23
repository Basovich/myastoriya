'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Locale } from '@/i18n/config';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs/Breadcrumbs';
import Step1 from './Step1/Step1';
import Step2 from './Step2/Step2';
import Step3 from './Step3/Step3';
import s from './CheckoutPage.module.scss';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUseBonuses } from '@/store/slices/cartSlice';
import StatusModals from '@/app/components/StatusModals/StatusModals';

interface CheckoutPageProps {
    lang: Locale;
}

function CheckoutContent({ lang }: CheckoutPageProps) {
    const searchParams = useSearchParams();
    const stepParam = searchParams.get('step');
    const currentStep = stepParam ? parseInt(stepParam, 10) : 1;

    const dispatch = useAppDispatch();
    const { isAuthenticated, isGuest, isInitialized } = useAppSelector(state => state.auth);
    const prevAuthRef = useRef({ isAuthenticated, isGuest });

    useEffect(() => {
        dispatch(setUseBonuses(false));
    }, [dispatch]);

    // Redirect to step 1 if logged out while on step 2 or 3
    useEffect(() => {
        if (!isInitialized) return;

        const wasAuthedUser = prevAuthRef.current.isAuthenticated && !prevAuthRef.current.isGuest;
        const isNowLoggedOut = !isAuthenticated || isGuest;

        if (currentStep > 1 && (wasAuthedUser && isNowLoggedOut)) {
            const url = new URL(window.location.href);
            url.searchParams.set('step', '1');
            window.history.pushState({}, '', url.toString());
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        prevAuthRef.current = { isAuthenticated, isGuest };
    }, [isAuthenticated, isGuest, isInitialized, currentStep]);

    const breadcrumbs = [
        { label: 'Головна', href: '/' },
        { label: 'Оформлення замовлення' },
    ];

    return (
        <>
            <main className={s.main}>
                <div className={s.container}>
                    <Breadcrumbs items={breadcrumbs} className={s.breadcrumbs} />
                    <div className={s.pageHeader}>
                        <h1 className={s.pageTitle}>ОФОРМЛЕННЯ ЗАМОВЛЕННЯ</h1>
                        <div className={s.stepDots}>
                            <span className={s.dot} />
                            <span className={s.dot} />
                            <span className={s.dot} />
                        </div>
                    </div>

                    {currentStep === 1 && <Step1 />}
                    {currentStep === 2 && <Step2 />}
                    {currentStep === 3 && <Step3 lang={lang} />}
                </div>
            </main>
            <StatusModals lang={lang} isCheckout={true} />
        </>
    );
}

export default function CheckoutPage({ lang }: CheckoutPageProps) {
    return (
        <Suspense>
            <CheckoutContent lang={lang} />
        </Suspense>
    );
}
