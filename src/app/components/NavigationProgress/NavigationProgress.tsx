'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import PageLoader from '@/app/components/PageLoader/PageLoader';
import s from './NavigationProgress.module.scss';

export default function NavigationProgress() {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const isLoadingRef = useRef(false);
    const isInitialMount = useRef(true);
    const pathnameRef = useRef(pathname);

    // Ховаємо initial loader після гідратації
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFadingOut(true);
            const hideTimer = setTimeout(() => {
                setIsLoading(false);
                setIsFadingOut(false);
                isInitialMount.current = false;
            }, 300);
            return () => clearTimeout(hideTimer);
        }, 150);
        return () => clearTimeout(timer);
    }, []);

    // Ховаємо loader після завершення навігації та відмалювання нової сторінки
    useEffect(() => {
        if (!isInitialMount.current && isLoadingRef.current) {
            if (!window.location.hash) {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }
            const timer = setTimeout(() => {
                setIsFadingOut(true);
                const hideTimer = setTimeout(() => {
                    setIsLoading(false);
                    setIsFadingOut(false);
                    isLoadingRef.current = false;
                    if (!window.location.hash) {
                        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    }
                }, 300);
                return () => clearTimeout(hideTimer);
            }, 200);
            return () => clearTimeout(timer);
        }
        pathnameRef.current = pathname;
    }, [pathname]);

    // Перехоплюємо кліки по посиланнях та кнопки назад/вперед
    useEffect(() => {
        const showLoader = () => {
            isLoadingRef.current = true;
            setIsFadingOut(false);
            setIsLoading(true);
        };

        const handleClick = (e: MouseEvent) => {
            const anchor = (e.target as Element).closest('a[href]');
            if (!anchor) return;
            if (
                anchor.hasAttribute('data-no-progress') ||
                anchor.closest('[data-no-progress="true"]')
            ) {
                return;
            }
            const href = anchor.getAttribute('href') ?? '';
            // Пропускаємо зовнішні посилання, якорі, mailto, tel
            if (/^(https?:|\/\/|#|mailto:|tel:)/.test(href)) return;

            // Пропускаємо поточну сторінку (відсікаємо ?search та #hash)
            const cleanHref = href.split('?')[0].split('#')[0];
            const cleanPathname = (pathnameRef.current || '').replace(/\/$/, '') || '/';
            const normalizedTarget = cleanHref.replace(/\/$/, '') || '/';

            // Якщо шлях збігається з поточним (або /ua і /) — це та сама сторінка
            if (
                normalizedTarget === cleanPathname ||
                (normalizedTarget === '/' && cleanPathname === '/ua') ||
                (normalizedTarget === '/ua' && cleanPathname === '/')
            ) {
                return;
            }

            showLoader();
        };

        document.addEventListener('click', handleClick);
        window.addEventListener('popstate', showLoader);

        return () => {
            document.removeEventListener('click', handleClick);
            window.removeEventListener('popstate', showLoader);
        };
    }, []);

    // Safety timeout — максимум 10 секунд
    useEffect(() => {
        if (!isLoading) return;
        const t = setTimeout(() => {
            setIsFadingOut(true);
            const hideTimer = setTimeout(() => {
                setIsLoading(false);
                setIsFadingOut(false);
                isLoadingRef.current = false;
            }, 300);
            return () => clearTimeout(hideTimer);
        }, 10_000);
        return () => clearTimeout(t);
    }, [isLoading]);

    if (!isLoading) return null;

    const className = `${s.loaderWrapper} ${isFadingOut ? s.fadeOut : ''}`;
    return <PageLoader className={className} />;
}
