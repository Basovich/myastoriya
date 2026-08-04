import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { logoutApi } from '@/lib/graphql/queries/auth';
import { clearAuthCookies, getAccessToken } from '@/app/actions/authActions';
import { Locale } from '@/i18n/config';

export function useLogout(lang: Locale | string = 'ua') {
    const dispatch = useAppDispatch();
    const { token: storeToken } = useAppSelector((state) => state.auth);

    return async () => {
        try {
            const token = storeToken || await getAccessToken();
            if (token) {
                await logoutApi(token);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            await clearAuthCookies();
            dispatch(logout());
            window.location.href = lang === 'ua' ? '/' : `/${lang}`;
        }
    };
}
