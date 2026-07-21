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
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        ? require('redux-persist/lib/storage').default
        : createNoopStorage();

import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import authReducer from './slices/authSlice';
import localityReducer from './slices/localitySlice';
import viewedProductsReducer from './slices/viewedProductsSlice';

const SIX_HOURS = 6 * 60 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

// Auth session expiration transform — now applied directly to the auth slice.
const authExpireTransform = createTransform(
    (inboundState: object) => ({
        ...inboundState,
        _persistedAt: Date.now(),
    }),
    (outboundState: object & { _persistedAt?: number }) => {
        const persistedAt = outboundState?._persistedAt;
        if (persistedAt && Date.now() - persistedAt > SIX_HOURS) {
            return { user: null, isAuthenticated: false, isGuest: false, isInitialized: false } as object;
        }
        return outboundState;
    }
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
    { whitelist: ['cart', 'wishlist', 'viewedProducts'] }
);

const localityPersistConfig = {
    key: 'locality',
    storage,
    blacklist: ['isManualSelectionOpen', 'isPromptVisible', 'allCities', 'isLoadingCities'],
};

const authPersistConfig = {
    key: 'auth',
    storage,
    blacklist: ['isInitialized'],
    transforms: [authExpireTransform],
};

// Cart gets its own persist config so transient state (loading, deletingIds)
// is never written to localStorage — prevents eternal spinner on next load.
const cartPersistConfig = {
    key: 'cart',
    storage,
    blacklist: ['loading', 'deletingIds', 'useBonuses', 'total', 'isCartModalOpen', 'removedItems', 'isSyncing'],
};

const wishlistPersistConfig = {
    key: 'wishlist',
    storage,
    // isSyncing is a transient guard flag — never persist it
    blacklist: ['isSyncing'],
    transforms: [generalExpireTransform],
};

const rootReducer = combineReducers({
    cart: persistReducer(cartPersistConfig, cartReducer),
    wishlist: persistReducer(wishlistPersistConfig, wishlistReducer),
    auth: persistReducer(authPersistConfig, authReducer),
    locality: persistReducer(localityPersistConfig, localityReducer),
    viewedProducts: viewedProductsReducer,
});

const persistConfig = {
    key: 'myastoriya-root',
    storage,
    // cart, wishlist, auth and locality each have their own persistReducer
    whitelist: ['viewedProducts'],
    transforms: [generalExpireTransform]
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
