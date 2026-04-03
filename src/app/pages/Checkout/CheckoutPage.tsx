'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Locale } from '@/i18n/config';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs/Breadcrumbs';
import Step1 from './Step1/Step1';
import Step2 from './Step2/Step2';
import s from './CheckoutPage.module.scss';

interface CheckoutPageProps {
    lang: Locale;
}

function CheckoutContent({ lang }: CheckoutPageProps) {
    const searchParams = useSearchParams();
    const stepParam = searchParams.get('step');
    const currentStep = stepParam ? parseInt(stepParam, 10) : 1;

    const breadcrumbs = [
        { label: 'Головна', href: '/' },
        { label: 'Оформлення замовлення' },
    ];

    return (
        <>
            <Header lang={lang} />
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
                </div>
            </main>
            <Footer lang={lang} />
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
