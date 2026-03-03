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
import authReducer from './slices/authSlice';

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

// Auth session expiration transform — applies only to the auth slice.
// Wishlist and cart are intentionally NOT expired, so they persist indefinitely.
const expireTransform = createTransform(
    (inboundState: any) => ({
        ...inboundState,
        _persistedAt: Date.now(),
    }),
    (outboundState: any) => {
        const persistedAt = outboundState?._persistedAt;
        if (persistedAt && Date.now() - persistedAt > THIRTY_DAYS) {
            return { user: null, isAuthenticated: false } as any;
        }
        return outboundState;
    },
    { whitelist: ['auth'] }
);

const persistConfig = {
    key: 'myastoriya-root',
    storage,
    whitelist: ['cart', 'wishlist', 'auth'], // Things to persist
    transforms: [expireTransform]
};

const rootReducer = combineReducers({
    cart: cartReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
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
