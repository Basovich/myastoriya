'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginAsGuest } from '@/store/slices/authSlice';
import { authAsGuestApi } from '@/lib/graphql/queries/auth';
import { setAuthCookies } from '@/app/actions/authActions';

/**
 * Runs once on mount. If there is no active session (no access_token cookie
 * AND Redux has no authenticated user), initialises a guest session so the
 * backend can track cart/wishlist state via the API token.
 *
 * The guest token is stored in httpOnly cookies via the Server Action and
 * also reflected in Redux via `loginAsGuest`.
 */
export default function AuthInitializer() {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const initialised = useRef(false);

    useEffect(() => {
        if (initialised.current || isAuthenticated) return;
        initialised.current = true;

        const cookie = document.cookie
            .split(';')
            .some((c) => c.trim().startsWith('access_token='));

        if (cookie) return; // Already have a token (real user or existing guest)

        const deviceId = getOrCreateDeviceId();

        authAsGuestApi(deviceId)
            .then(async (result) => {
                await setAuthCookies(result.accessToken, result.refreshToken);
                dispatch(loginAsGuest());
            })
            .catch((err) => {
                console.warn('[AuthInitializer] Guest auth failed:', err);
            });
    }, [isAuthenticated, dispatch]);

    return null;
}

function getOrCreateDeviceId(): string {
    const KEY = 'mya_device_id';
    let id = localStorage.getItem(KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(KEY, id);
    }
    return id;
}
