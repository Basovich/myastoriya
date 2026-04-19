import { useState, useEffect } from 'react';

/**
 * Returns `true` only after the component has mounted on the client.
 *
 * Use this to defer rendering of any UI that depends on client-only state
 * (e.g. Redux Persist rehydration from localStorage) to avoid React hydration
 * mismatches between server-rendered HTML and client state.
 *
 * @example
 * const hydrated = useIsHydrated();
 * return <span>{hydrated ? count : null}</span>;
 */
export function useIsHydrated(): boolean {
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
    }, []);

    return hydrated;
}
