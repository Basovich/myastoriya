'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function ScrollToTop() {
    const pathname = usePathname();
    const prevPathnameRef = useRef(pathname);

    useEffect(() => {
        const scrollToHash = () => {
            if (!window.location.hash) return false;
            const id = decodeURIComponent(window.location.hash.slice(1));
            const targetElement = document.getElementById(id);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                return true;
            }
            return false;
        };

        if (prevPathnameRef.current !== pathname) {
            prevPathnameRef.current = pathname;

            // Якщо присутній якір (#hash), дозволяємо плавний скрол до відповідного елемента
            if (window.location.hash) {
                if (scrollToHash()) return;

                // Якщо елемент ще рендериться / гідрується в DOM — повторюємо спробу через таймери
                const t1 = setTimeout(scrollToHash, 100);
                const t2 = setTimeout(scrollToHash, 300);
                const t3 = setTimeout(scrollToHash, 600);
                return () => {
                    clearTimeout(t1);
                    clearTimeout(t2);
                    clearTimeout(t3);
                };
            }

            // Миттєво скидаємо скрол вікна та кореневих елементів на початок
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        } else if (window.location.hash) {
            // При першому завантаженні сторінки з хешем
            scrollToHash();
            const t1 = setTimeout(scrollToHash, 150);
            const t2 = setTimeout(scrollToHash, 500);
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
            };
        }
    }, [pathname]);

    return null;
}
