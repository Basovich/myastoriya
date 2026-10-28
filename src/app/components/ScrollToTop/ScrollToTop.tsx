'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function ScrollToTop() {
    const pathname = usePathname();
    const prevPathnameRef = useRef(pathname);

    useEffect(() => {
        if (prevPathnameRef.current !== pathname) {
            prevPathnameRef.current = pathname;

            // Якщо присутній якір (#hash), дозволяємо скрол до відповідного елемента
            if (window.location.hash) {
                const id = decodeURIComponent(window.location.hash.slice(1));
                const targetElement = document.getElementById(id);
                if (targetElement) {
                    targetElement.scrollIntoView();
                    return;
                }
            }

            // Миттєво скидаємо скрол вікна та кореневих елементів на початок
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }
    }, [pathname]);

    return null;
}
