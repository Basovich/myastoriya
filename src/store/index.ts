import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import { createNoopStorage } from './noopStorage';
import createTransform from 'redux-persist/es/createTransform';

const storage =
    typeof window !== 'undefined'
        ? require('redux-persist/lib/storage').default
        : createNoopStorage();

import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import authReducer from './slices/authSlice';
import localityReducer from './slices/localitySlice';

const SIX_HOURS = 6 * 60 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

// Auth session expiration transform — applies only to the auth slice.
const authExpireTransform = createTransform(
    (inboundState: object) => ({
        ...inboundState,
        _persistedAt: Date.now(),
    }),
    (outboundState: object & { _persistedAt?: number }) => {
        const persistedAt = outboundState?._persistedAt;
        if (persistedAt && Date.now() - persistedAt > SIX_HOURS) {
            return { user: null, isAuthenticated: false };
        }
        return outboundState;
    },
    { whitelist: ['auth'] }
);

// General expiration transform for cart and wishlist
// Expires after 30 days
const generalExpireTransform = createTransform(
    (inboundState: object) => ({
        ...inboundState,
        _persistedAt: Date.now(),
    }),
    (outboundState: object & { _persistedAt?: number }) => {
        const persistedAt = outboundState?._persistedAt;
        if (persistedAt && Date.now() - persistedAt > THIRTY_DAYS) {
            return undefined as unknown as object;
        }
        return outboundState;
    },
    { whitelist: ['cart', 'wishlist'] }
);

const localityPersistConfig = {
    key: 'locality',
    storage,
    blacklist: ['isManualSelectionOpen', 'isPromptVisible'],
};

const rootReducer = combineReducers({
    cart: cartReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
    locality: persistReducer(localityPersistConfig, localityReducer),
});

const persistConfig = {
    key: 'myastoriya-root',
    storage,
    whitelist: ['cart', 'wishlist', 'auth'], // Removed 'locality' from here as it's now nested
    transforms: [authExpireTransform, generalExpireTransform]
};

const persistedReducer = persistReducer<ReturnType<typeof rootReducer>>(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
