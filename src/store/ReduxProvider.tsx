'use client';

import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './index';
import { GOOGLE_CLIENT_ID } from '@/lib/constants';

/**
 * Provides the Redux store and Google OAuth context to the application.
 *
 * PersistGate has been intentionally removed. It blocked the entire render
 * tree until localStorage was rehydrated, causing the server-rendered HTML to
 * appear blank on the client until hydration completed.
 *
 * redux-persist still runs in the background — cart, wishlist, and auth state
 * are rehydrated silently after first paint via the REHYDRATE action.
 */
export default function ReduxProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                {children}
            </GoogleOAuthProvider>
        </Provider>
    );
}
