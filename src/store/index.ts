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
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import createTransform from 'redux-persist/es/createTransform';

import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';

// 30 Days in milliseconds
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

// Transform to handle expiration of persisted state
const expireTransform = createTransform(
    // transform state on its way to being serialized and persisted.
    (inboundState: any, key) => {
        return {
            ...inboundState,
            _persistedAt: Date.now(), // update timestamp on save
        };
    },
    // transform state being rehydrated
    (outboundState: any, key) => {
        const persistedAt = outboundState?._persistedAt;
        if (persistedAt && Date.now() - persistedAt > THIRTY_DAYS) {
            // Data has expired
            // Simplest way for arrays is returning empty for these specific slices, or returning undefined
            return { items: [] } as any;
        }
        return outboundState;
    },
    // define which reducers this transform gets called for.
    { whitelist: ['cart', 'wishlist'] }
);

const persistConfig = {
    key: 'myastoriya-root',
    storage,
    whitelist: ['cart', 'wishlist'], // Things to persist
    transforms: [expireTransform]
};

const rootReducer = combineReducers({
    cart: cartReducer,
    wishlist: wishlistReducer,
});

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
