/**
 * A no-op storage implementation for server-side rendering.
 * redux-persist/lib/storage directly accesses localStorage, which
 * is not available in a Node.js (server) environment. This stub is
 * used instead so the store can be safely constructed on the server.
 */
export function createNoopStorage() {
    return {
        getItem: (_key: string) => Promise.resolve<string | null>(null),
        setItem: (_key: string, value: string) => Promise.resolve(value),
        removeItem: (_key: string) => Promise.resolve(),
    };
}
