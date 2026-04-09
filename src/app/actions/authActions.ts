'use server';

import { cookies } from 'next/headers';
import { refreshTokenApi } from '@/lib/graphql/queries/auth';

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
export async function tryRefreshTokenAction(): Promise<string | null> {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;
    if (!refreshToken) return null;

    try {
        const result = await refreshTokenApi(refreshToken);
        await setAuthCookies(result.accessToken, result.refreshToken);
        return result.accessToken;
    } catch {
        // Refresh token invalid or expired — clear cookies
        cookieStore.delete(ACCESS_TOKEN_KEY);
        cookieStore.delete(REFRESH_TOKEN_KEY);
        return null;
    }
}
