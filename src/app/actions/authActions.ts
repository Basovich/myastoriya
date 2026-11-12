'use server';

import { cookies } from 'next/headers';
import { refreshTokenApi, authAsGuestApi } from '@/lib/graphql/queries/auth';
import { selectLocalityApi, Locality } from '@/lib/graphql/queries/localities';
import { GraphQLError } from '@/lib/graphql/client';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Access token TTL — 1 hour (backend might differ, but safe default)
const ACCESS_TOKEN_MAX_AGE = 60 * 60;
// Refresh token TTL — 30 days
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
};

export async function setAuthCookies(
    accessToken: string,
    refreshToken: string,
): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: ACCESS_TOKEN_MAX_AGE,
    });
    cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: REFRESH_TOKEN_MAX_AGE,
    });
}

export async function clearAuthCookies(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(ACCESS_TOKEN_KEY);
    cookieStore.delete(REFRESH_TOKEN_KEY);
}

export async function getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_KEY)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_TOKEN_KEY)?.value ?? null;
}

/**
 * Tries to refresh the access token using the refresh cookie.
 * If successful, updates cookies and returns the new access token.
 * Returns null if refresh token is missing or refresh fails.
 */
import * as Sentry from '@sentry/nextjs';

// Module-level in-flight promise deduplication for concurrent refreshToken calls
let inFlightRefreshPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null;
let inFlightRefreshTokenValue: string | null = null;

export interface RefreshActionResult {
    accessToken: string | null;
    status: 'success' | 'no_token' | 'auth_error' | 'network_error';
}

export async function tryRefreshTokenAction(): Promise<string | null> {
    const res = await tryRefreshTokenDetailedAction();
    return res.accessToken;
}

export async function tryRefreshTokenDetailedAction(): Promise<RefreshActionResult> {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;
    if (!refreshToken) return { accessToken: null, status: 'no_token' };

    try {
        let result: { accessToken: string; refreshToken: string } | null = null;

        if (inFlightRefreshPromise && inFlightRefreshTokenValue === refreshToken) {
            result = await inFlightRefreshPromise;
        } else {
            inFlightRefreshTokenValue = refreshToken;
            inFlightRefreshPromise = (async () => {
                try {
                    return await refreshTokenApi(refreshToken);
                } finally {
                    inFlightRefreshPromise = null;
                    inFlightRefreshTokenValue = null;
                }
            })();
            result = await inFlightRefreshPromise;
        }

        if (result) {
            await setAuthCookies(result.accessToken, result.refreshToken);
            return { accessToken: result.accessToken, status: 'success' };
        }
        return { accessToken: null, status: 'network_error' };
    } catch (err) {
        // Race condition guard: before deleting cookies on Unauthorized,
        // check if a concurrent request already updated the refresh_token cookie
        const currentCookieStore = await cookies();
        const currentRefreshToken = currentCookieStore.get(REFRESH_TOKEN_KEY)?.value;
        if (currentRefreshToken && currentRefreshToken !== refreshToken) {
            // A concurrent request already successfully refreshed the token!
            // Do NOT delete the new cookies; return the new access token.
            return {
                accessToken: currentCookieStore.get(ACCESS_TOKEN_KEY)?.value ?? null,
                status: 'success',
            };
        }

        // Only delete cookies if we are sure the token is invalid/expired (logical Auth error from backend)
        const isAuthError = err instanceof GraphQLError && 
            (err.message === 'Unauthorized' || err.errors?.some(e => e.extensions?.category === 'authentication'));

        if (isAuthError) {
            cookieStore.delete(ACCESS_TOKEN_KEY);
            cookieStore.delete(REFRESH_TOKEN_KEY);
            return { accessToken: null, status: 'auth_error' };
        } else {
            // Log unexpected refresh token failures to Sentry
            Sentry.captureException(err, {
                tags: { category: 'auth', action: 'refresh_token_action' },
            });
            return { accessToken: null, status: 'network_error' };
        }
    }
}

/**
 * Initializes a new guest session using deviceId and sets auth cookies.
 * Returns the new guest access token.
 */
export async function initializeGuestSessionAction(deviceId: string): Promise<string> {
    try {
        const result = await authAsGuestApi(deviceId);
        await setAuthCookies(result.accessToken, result.refreshToken);
        return result.accessToken;
    } catch (err) {
        Sentry.captureException(err, {
            tags: { category: 'auth', action: 'initialize_guest_session_action' },
        });
        throw err;
    }
}

/**
 * Selects a locality for the current user or guest session on the backend.
 * Guarantees that an access_token exists in cookies (creating a guest session if needed),
 * and syncs the locality to the backend for that session token.
 */
export async function selectLocalityAction(
    localityId: number,
    lang?: string,
    deviceId?: string,
): Promise<Locality> {
    let token = await getAccessToken();
    if (!token && deviceId) {
        token = await initializeGuestSessionAction(deviceId);
    }
    return await selectLocalityApi(localityId, lang, token ?? undefined);
}
