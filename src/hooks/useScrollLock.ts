import { useCallback } from 'react';

/**
 * Hook that provides disableScroll / enableScroll helpers.
 * Prevents the page from scrolling (e.g. while a modal or mobile menu is open)
 * and restores the original scroll position when unlocked.
 *
 * Automatically compensates for the scrollbar width so the layout does not jump.
 */
export function useScrollLock() {
    const disableScroll = useCallback(() => {
        if (document.body.classList.contains('disable-scroll')) return;

        const paddingOffset = window.innerWidth - document.body.offsetWidth + 'px';
        const pagePosition = window.pageYOffset;

        document.body.style.paddingRight = paddingOffset;
        document.body.setAttribute('data-scroll-position', String(pagePosition));
        document.body.style.top = `-${pagePosition}px`;
        document.body.style.position = 'fixed';
        document.body.style.left = '0';
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        document.body.classList.add('disable-scroll');
    }, []);

    const enableScroll = useCallback(() => {
        if (!document.body.classList.contains('disable-scroll')) return;

        const pagePosition = Number(document.body.getAttribute('data-scroll-position') ?? 0);

        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.classList.remove('disable-scroll');
        document.body.removeAttribute('data-scroll-position');

        window.scrollTo(0, pagePosition);
    }, []);

    return { disableScroll, enableScroll };
}

export default useScrollLock;
