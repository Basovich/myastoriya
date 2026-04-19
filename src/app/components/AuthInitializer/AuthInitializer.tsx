'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginAsGuest, setUser, setInitialized } from '@/store/slices/authSlice';
import { authAsGuestApi, getMeApi } from '@/lib/graphql/queries/auth';
import { setAuthCookies, getAccessToken, tryRefreshTokenAction } from '@/app/actions/authActions';
import { getOrCreateDeviceId } from '@/lib/utils/auth';
import * as Sentry from "@sentry/nextjs";

/**
 * Runs once on mount. Restores an existing session from cookies or
 * initialises a guest session so the backend can track cart/wishlist state.
 *
 * Token refresh flow:
 *  1. Try access_token cookie → getMeApi.
 *  2. If getMeApi fails (token expired) → tryRefreshTokenAction → retry getMeApi.
 *  3. If refresh also fails → fall through to authAsGuest.
 *  4. If no access_token at all → authAsGuest immediately.
 */
export default function AuthInitializer() {
    const dispatch = useAppDispatch();
    const initialised = useRef(false);
    const { user, isAuthenticated, isGuest } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && user) {
            Sentry.setUser({
                id: user.id,
                email: user.email,
                username: `${user.name || ''} ${user.surname || ''}`.trim() || user.phone,
            });
            Sentry.setTag("user_type", "customer");
        } else if (isAuthenticated && isGuest) {
            Sentry.setUser(null);
            Sentry.setTag("user_type", "guest");
        } else {
            Sentry.setUser(null);
            Sentry.setTag("user_type", "anonymous");
        }
    }, [user, isAuthenticated, isGuest]);

    useEffect(() => {
        if (initialised.current) return;
        initialised.current = true;

        void initAuth(dispatch);
    }, [dispatch]);

    return null;
}

async function initAuth(dispatch: ReturnType<typeof useAppDispatch>) {
    try {
        const token = await getAccessToken();

        if (token) {
            const user = await tryGetMe(token, dispatch);
            if (user !== null) return;
            // getMeApi failed — access token expired, try refresh
        }

        // No token OR access token expired — attempt refresh
        const freshToken = await tryRefreshTokenAction();

        if (freshToken) {
            const user = await tryGetMe(freshToken, dispatch);
            if (user !== null) return;
            // Refresh token also rejected by API — fall through to guest
        }

        // No valid session — start as guest
        await startGuestSession(dispatch);

    } catch (err) {
        console.warn('[AuthInitializer] Unexpected error during auth init:', err);
        dispatch(setInitialized(true));
    }
}

/**
 * Calls getMeApi and dispatches setUser / loginAsGuest on success.
 * Returns the user on success or null if the token was rejected.
 */
async function tryGetMe(
    token: string,
    dispatch: ReturnType<typeof useAppDispatch>,
) {
    try {
        const user = await getMeApi(token);
        // Real users always have a phone or email. Guests have both null.
        if (user && (user.phone || user.email)) {
            dispatch(setUser(user));
        } else {
            dispatch(loginAsGuest());
        }
        return user;
    } catch {
        // Token invalid / expired — let caller decide what to do next
        return null;
    }
}

/**
 * Creates a new guest session and stores the tokens in httpOnly cookies.
 */
async function startGuestSession(dispatch: ReturnType<typeof useAppDispatch>) {
    try {
        const deviceId = getOrCreateDeviceId();
        const result = await authAsGuestApi(deviceId);
        await setAuthCookies(result.accessToken, result.refreshToken);
        dispatch(loginAsGuest());
    } catch (err) {
        console.warn('[AuthInitializer] Guest auth failed:', err);
        dispatch(setInitialized(true));
    }
}
