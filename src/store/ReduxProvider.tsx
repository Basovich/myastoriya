'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store, persistor } from './index';

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '857890084502-u85p6cp357bu5cpntjlcodkcsdm45d9a.apps.googleusercontent.com';

    if (!clientId) {
        return (
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    {children}
                </PersistGate>
            </Provider>
        );
    }

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <GoogleOAuthProvider clientId={clientId}>
                    {children}
                </GoogleOAuthProvider>
            </PersistGate>
        </Provider>
    );
}
