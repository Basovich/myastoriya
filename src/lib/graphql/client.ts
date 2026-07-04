const isServer = typeof window === 'undefined';
const GQL_ENDPOINT = 'https://dev-api.myastoriya.com.ua/graphql';

export interface GqlError {
    message: string;
    locations?: { line: number; column: number }[];
    path?: string[];
    extensions?: Record<string, unknown>;
}

export interface GqlResponse<T> {
    data?: T;
    errors?: GqlError[];
}

export class GraphQLError extends Error {
    constructor(
        message: string,
        public readonly errors: GqlError[],
    ) {
        super(message);
        this.name = 'GraphQLError';
    }
}

interface RequestOptions {
    /** Access token for authenticated requests */
    token?: string;
    /** Current locale ('ua' or 'ru') */
    lang?: string;
    /** Next.js cache / revalidate options (server-side only) */
    next?: NextFetchRequestConfig;
    /** Override fetch cache mode (e.g. 'no-store' for paginated requests) */
    cache?: RequestCache;
    /** Internal retry counter */
    _retryCount?: number;
    /** Internal retry flag for token refresh */
    _isRetry?: boolean;
}

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

let activeRefreshPromise: Promise<string | null> | null = null;

/**
 * Helper to detect files/blobs in variables
 */
const isFile = (val: unknown): val is File | Blob => 
    (typeof File !== 'undefined' && val instanceof File) || 
    (typeof Blob !== 'undefined' && val instanceof Blob);

/**
 * Deeply extract files and their paths from a variables object
 */
const getFiles = (obj: unknown, path = ''): Array<{ path: string, file: File | Blob }> => {
    let files: Array<{ path: string, file: File | Blob }> = [];
    if (!obj || typeof obj !== 'object') return files;

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        const currentPath = path ? `${path}.${key}` : `variables.${key}`;
        if (isFile(value)) {
            files.push({ path: currentPath, file: value });
        } else if (value && typeof value === 'object') {
            files = files.concat(getFiles(value, currentPath));
        }
    }
    return files;
};

/**
 * Base GraphQL fetch. Returns typed `data` or throws `GraphQLError`.
 * Implements retry logic for 5xx errors during build.
 */
export async function gqlRequest<T>(
    query: string,
    variables?: Record<string, unknown>,
    options?: RequestOptions,
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (!isServer) {
        const deviceId = localStorage.getItem('mya_device_id');
        if (deviceId) {
            headers['device-id'] = deviceId;
        }
    }

    if (options?.token) {
        headers['Authorization'] = `Bearer ${options.token}`;
    } else if (!isServer) {
        // No explicit token — try to get from Redux store
        try {
            const { store } = await import('@/store');
            const storeToken = store.getState().auth.token;
            if (storeToken) {
                headers['Authorization'] = `Bearer ${storeToken}`;
            }
        } catch {
            // store not available yet (e.g. during SSR hydration)
        }
    }

    const langHeader = options?.lang === 'ru' ? 'ru_RU' : 'uk_UA';
    headers['Content-Language'] = langHeader;

    let body: BodyInit = JSON.stringify({ query, variables });

    // Handle File Uploads (GraphQL Multipart Request Spec)
    const files = getFiles(variables);
    if (files.length > 0) {
        const formData = new FormData();
        
        // 1. operations - replace files with null
        const variablesWithNulls = JSON.parse(JSON.stringify(variables, (_key, value) => {
            // Check if value is one of the files we found
            if (files.some(f => f.file === value)) return null;
            return value;
        }));
        
        formData.append('operations', JSON.stringify({ query, variables: variablesWithNulls }));

        // 2. map - map indexes to variable paths
        const map: Record<string, string[]> = {};
        files.forEach((fileInfo, index) => {
            map[index.toString()] = [fileInfo.path];
        });
        formData.append('map', JSON.stringify(map));

        // 3. files - append binary data
        files.forEach((fileInfo, index) => {
            formData.append(index.toString(), fileInfo.file);
        });

        body = formData;
        delete headers['Content-Type']; // Let browser set boundary
    }

    // All requests go directly to the backend — no proxy needed.
    const endpoint = GQL_ENDPOINT;

    let text = "";
    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers,
            body,
            ...(isServer ? {} : { credentials: 'include' }),
            ...(options?.cache ? { cache: options.cache } : options?.next ? { next: options.next } : {}),
        });

        if (!res.ok) {
            // Handle retries for 5xx errors (like 504 Gateway Timeout)
            const currentRetry = options?._retryCount ?? 0;
            if (res.status >= 500 && currentRetry < MAX_RETRIES) {
                const nextRetry = currentRetry + 1;
                // Add jitter: base delay * retry + random(0-500ms)
                const delay = (RETRY_DELAY_MS * nextRetry) + Math.floor(Math.random() * 500);
                
                console.warn(`[GQL] ${res.status} error on ${endpoint}. Retrying in ${delay}ms... (${nextRetry}/${MAX_RETRIES})`);
                
                await new Promise(resolve => setTimeout(resolve, delay));
                return gqlRequest(query, variables, { ...options, _retryCount: nextRetry });
            }
            
            throw new Error(`Network error: ${res.status} ${res.statusText}`);
        }

        text = await res.text();
        if (!text) {
            throw new Error("Empty response body from GraphQL API");
        }
        const json: GqlResponse<T> = JSON.parse(text);

        if (json.errors?.length) {
            const error = json.errors[0];
            
            // JWT Interceptor for Unauthorized (401) errors on the client side
            const isUnauthorized = error.message === 'Unauthorized' || error.extensions?.category === 'authentication';
            if (!isServer && isUnauthorized && !options?._isRetry) {
                try {
                    if (!activeRefreshPromise) {
                        activeRefreshPromise = (async () => {
                            try {
                                const { tryRefreshTokenAction, initializeGuestSessionAction } = await import('@/app/actions/authActions');
                                let freshToken = await tryRefreshTokenAction();
                                
                                if (!freshToken) {
                                    const deviceId = localStorage.getItem('mya_device_id');
                                    if (deviceId) {
                                        freshToken = await initializeGuestSessionAction(deviceId);
                                    }
                                }
                                
                                if (freshToken) {
                                    // Dynamically import store and actions to update UI state
                                    const { store } = await import('@/store');
                                    const { loginAsGuest, setUser, setToken } = await import('@/store/slices/authSlice');
                                    const { getMeApi } = await import('@/lib/graphql/queries/auth');
                                    
                                    try {
                                        const user = await getMeApi(freshToken);
                                        if (user && (user.phone || user.email)) {
                                            store.dispatch(setUser({ ...user, token: freshToken }));
                                        } else {
                                            store.dispatch(loginAsGuest({ token: freshToken }));
                                        }
                                    } catch {
                                        store.dispatch(loginAsGuest({ token: freshToken }));
                                    }
                                    store.dispatch(setToken(freshToken));
                                }
                                return freshToken;
                            } catch (refreshErr) {
                                console.error('[GQL Interceptor] Automatic token refresh failed:', refreshErr);
                                return null;
                            } finally {
                                activeRefreshPromise = null;
                            }
                        })();
                    }

                    const freshToken = await activeRefreshPromise;
                    
                    if (freshToken) {
                        // Retry original request with the fresh token
                        return gqlRequest(query, variables, {
                            ...options,
                            token: freshToken,
                            _isRetry: true,
                        });
                    }
                } catch (refreshErr) {
                    console.error('[GQL Interceptor] Error waiting for token refresh:', refreshErr);
                }
            }
            
            if (isServer) {
                // If it's the known backend crash, don't log the full trace to keep build logs clean
                if (error.message === 'Internal server error' && error.path?.includes('blogTypes')) {
                    console.error('[GQL] Known Backend Bug: blogTypes() failed (Call to undefined method sorted())');
                } else {
                    console.error('GraphQL errors:', JSON.stringify(json.errors, null, 2));
                }
            }

            let errorMessage = error.message;

            // Extract deep validation messages if present
            if (error.extensions && error.extensions.validation) {
                const validation = error.extensions.validation as Record<string, string[]>;
                const firstKey = Object.keys(validation)[0];
                if (firstKey && validation[firstKey] && validation[firstKey].length > 0) {
                    errorMessage = validation[firstKey][0];
                }
            }

            throw new GraphQLError(errorMessage, json.errors);
        }

        if (json.data === undefined) {
            throw new Error('No data returned from GraphQL');
        }

        return json.data;

    } catch (err) {
        if (isServer) {
            console.error(`[gqlRequest] Error: ${err instanceof Error ? err.message : String(err)}. Response text: "${text.substring(0, 500)}"`);
        }

        // Don't retry if it's a GraphQLError (means API actually answered with a logical error)
        if (err instanceof GraphQLError) {
            throw err;
        }

        // Handle network timeouts/failures
        const currentRetry = options?._retryCount ?? 0;
        
        if (currentRetry < MAX_RETRIES) {
            const nextRetry = currentRetry + 1;
            const delay = (RETRY_DELAY_MS * nextRetry) + Math.floor(Math.random() * 500);
            
            console.warn(`[GQL] Network/Timeout error on ${query.split('{')[0].trim()}... Retrying in ${delay}ms... (${nextRetry}/${MAX_RETRIES})`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return gqlRequest(query, variables, { ...options, _retryCount: nextRetry });
        }

        // Final attempt failed - report to Sentry before crashing the build
        if (isServer) {
            try {
                void import("@sentry/nextjs").then((Sentry) => {
                    Sentry.captureException(err, {
                        tags: { 
                            component: 'gqlRequest',
                            query: query.split('{')[0].trim() || 'unknown',
                        },
                        extra: { variables, options }
                    });
                    void Sentry.flush(2000).catch(() => {});
                }).catch(() => {});
            } catch {
                // Ignore sentry import errors during build/static rendering
            }
        }

        throw err;
    }
}
