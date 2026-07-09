import { useSyncExternalStore } from 'react';

/**
 * An empty subscribe function since the hydration status is static once mounted on the client.
 * Because the hydration state transitions from false (server-side) to true (client-side)
 * immediately upon mounting and does not change dynamically thereafter, no external store
 * event subscription is needed.
 */
const emptySubscribe = () => () => {};

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
    return useSyncExternalStore(
        emptySubscribe,
        () => true,  // Client snapshot
        () => false  // Server snapshot
    );
}
