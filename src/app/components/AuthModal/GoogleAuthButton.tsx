'use client';

import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAppDispatch } from '@/store/hooks';
import clsx from 'clsx';
import { AuthUser, loginAsGuest } from '@/store/slices/authSlice';
import { socialAuthApi, authAsGuestApi } from '@/lib/graphql/queries/auth';
import { setAuthCookies, getAccessToken, clearAuthCookies } from '@/app/actions/authActions';
import { getOrCreateDeviceId } from '@/lib/utils/auth';
import { GraphQLError } from '@/lib/graphql/client';
import s from './GoogleAuthButton.module.scss';

interface GoogleAuthButtonProps {
    onSuccess?: (userData: AuthUser, googleProfile?: any) => void;
    onIncompleteProfile?: (googleProfile: any) => void;
    text?: string;
    variant?: 'default' | 'outline';
}

export default function GoogleAuthButton({ onSuccess, onIncompleteProfile, text, variant = 'default' }: GoogleAuthButtonProps) {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const login = useGoogleLogin({
        scope: 'openid profile email',
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                const deviceId = getOrCreateDeviceId();
                let currentToken = await getAccessToken();
                
                if (!currentToken) {
                    try {
                        const guestResult = await authAsGuestApi(deviceId);
                        await setAuthCookies(guestResult.accessToken, guestResult.refreshToken);
                        dispatch(loginAsGuest());
                        currentToken = guestResult.accessToken;
                    } catch (guestErr) {
                        console.error('Failed to establish guest session:', guestErr);
                    }
                }

                let result;
                try {
                    result = await socialAuthApi('google', tokenResponse.access_token, deviceId, undefined, currentToken || undefined);
                } catch (err) {
                    const isUnauthorized = err instanceof GraphQLError && (err.errors.some(e => e.extensions?.error_code === 401 || e.message === 'Unauthorized'));
                    if (isUnauthorized && currentToken) {
                        await clearAuthCookies();
                        result = await socialAuthApi('google', tokenResponse.access_token, deviceId, undefined, undefined);
                    } else {
                        throw err;
                    }
                }
                
                await setAuthCookies(result.accessToken, result.refreshToken);

                const userData: AuthUser = {
                    id: result.user.id,
                    name: result.user.name || '',
                    surname: result.user.surname || '',
                    email: result.user.email || '',
                    phone: result.user.phone || '',
                };

                // If phone is missing from backend, we might need the completion modal
                if (!userData.phone && onIncompleteProfile) {
                    onIncompleteProfile({
                        name: result.user.name,
                        surname: result.user.surname,
                        email: result.user.email,
                    });
                    return;
                }

                if (onSuccess) {
                    onSuccess(userData);
                }
            } catch (error) {
                console.error('Backend Google Auth Error:', error);
            } finally {
                setIsLoading(false);
            }
        },
        onError: (error) => {
            console.error('Google Login Failed:', error);
            setIsLoading(false);
        },
    });

    return (
        <button
            type="button"
            className={clsx(s.googleBtn, variant === 'outline' && s.outline)}
            onClick={() => {
                setIsLoading(true);
                login();
            }}
            disabled={isLoading}
        >
            <svg className={s.googleIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <g clipPath="url(#clip0_574_9779)">
                    <path d="M4.61559 5.43319C5.39247 4.41119 6.62066 3.75 8.00053 3.75C9.13572 3.75 10.203 4.19206 11.0057 4.99478L11.3372 5.32622L13.9888 2.67459L13.6574 2.34316C12.1464 0.832156 10.1374 0 8.00053 0C5.86366 0 3.85469 0.832156 2.34366 2.34313C2.2065 2.48031 2.07509 2.62169 1.94922 2.76678L4.61559 5.43319Z" fill="black" />
                    <path d="M13.2332 14.051C13.3783 13.9251 13.5197 13.7937 13.6569 13.6565C15.1678 12.1455 16 10.1365 16 7.99964C16 7.51292 15.9559 7.0253 15.869 6.55036L15.7987 6.16602H7.53125V9.91602H11.7954C11.5005 10.5027 11.0786 11.0029 10.5704 11.3882L13.2332 14.051Z" fill="black" />
                    <path d="M9.73809 11.8811C9.204 12.1193 8.61475 12.2496 8.00053 12.2496C6.62066 12.2496 5.39247 11.5884 4.61559 10.5664L1.94922 13.2328C2.07509 13.3779 2.2065 13.5193 2.34366 13.6564C3.85469 15.1674 5.86366 15.9996 8.00053 15.9996C9.62291 15.9996 11.1713 15.5195 12.4843 14.6272L9.73809 11.8811Z" fill="black" />
                    <path d="M4.12072 9.73469C3.88263 9.20453 3.75 8.61716 3.75 7.99934C3.75 7.38153 3.88263 6.79416 4.12072 6.264L1.37234 3.51562C0.480094 4.82859 0 6.37697 0 7.99934C0 9.62172 0.480094 11.1701 1.37234 12.4831L4.12072 9.73469Z" fill="black" />
                </g>
                <defs>
                    <clipPath id="clip0_574_9779">
                        <rect width="16" height="16" fill="white" />
                    </clipPath>
                </defs>
            </svg>
            <span className={s.googleBtnText}>
                {isLoading ? 'ЗАКРИВАЄМО...' : text || 'УВІЙТИ ЧЕРЕЗ GOOGLE'}
            </span>
        </button>
    );
}
