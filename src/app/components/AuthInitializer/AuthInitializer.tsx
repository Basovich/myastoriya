'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginAsGuest, setUser, setInitialized } from '@/store/slices/authSlice';
import { authAsGuestApi, getMeApi } from '@/lib/graphql/queries/auth';
import { setAuthCookies, getAccessToken } from '@/app/actions/authActions';
import { getOrCreateDeviceId } from '@/lib/utils/auth';

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
        if (initialised.current) return;
        initialised.current = true;

        getAccessToken().then(token => {
            if (token) {
                // Restore user session
                getMeApi(token)
                    .then((user) => {
                        dispatch(setUser(user));
                    })
                    .catch((err) => {
                        console.warn('[AuthInitializer] Session restoration failed:', err);
                        dispatch(setInitialized(true));
                    });
                return;
            }

            const deviceId = getOrCreateDeviceId();

            authAsGuestApi(deviceId)
                .then(async (result) => {
                    await setAuthCookies(result.accessToken, result.refreshToken);
                    dispatch(loginAsGuest());
                })
                .catch((err) => {
                    console.warn('[AuthInitializer] Guest auth failed:', err);
                    dispatch(setInitialized(true));
                });
        });

    }, [dispatch]);

    return null;
}
