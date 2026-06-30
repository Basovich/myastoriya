import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserAvatars {
    size1x?: string;
    size2x?: string;
    size3x?: string;
}

export interface AuthUser {
    id?: string;
    phone: string;
    name?: string;
    surname?: string;
    email?: string;
    middleName?: string;
    birthday?: string;
    gender?: 'male' | 'female';
    sex?: string;
    avatar?: UserAvatars | null;
    addresses?: { id: string; title: string; street: string }[];
    bonuses?: number;
}

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    /** Guest mode — user is authed as guest (no personal data) */
    isGuest: boolean;
    /** True if the initial auth check (cookies/tokens) has completed */
    isInitialized: boolean;
    /**
     * In-memory access token for direct backend requests (no proxy).
     * Not persisted — refreshed via tryRefreshTokenAction on page reload.
     */
    token: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isGuest: false,
    isInitialized: false,
    token: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<AuthUser & { token?: string }>) {
            const { token, ...user } = action.payload;
            state.user = user;
            state.isAuthenticated = true;
            state.isGuest = false;
            state.isInitialized = true;
            if (token !== undefined) state.token = token;
        },
        loginAsGuest(state, action: PayloadAction<{ token?: string } | undefined>) {
            state.user = null;
            state.isAuthenticated = true;
            state.isGuest = true;
            state.isInitialized = true;
            if (action.payload?.token !== undefined) state.token = action.payload.token;
        },
        logout(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.isGuest = false;
            state.isInitialized = true;
            state.token = null;
        },
        setUser(state, action: PayloadAction<AuthUser & { token?: string }>) {
            const { token, ...user } = action.payload;
            state.user = user;
            state.isAuthenticated = true;
            state.isGuest = false;
            state.isInitialized = true;
            if (token !== undefined) state.token = token;
        },
        setToken(state, action: PayloadAction<string | null>) {
            state.token = action.payload;
        },
        setInitialized(state, action: PayloadAction<boolean>) {
            state.isInitialized = action.payload;
        },
        addAddress(state, action: PayloadAction<{ id: string; title: string; street: string }>) {
            if (state.user) {
                if (!state.user.addresses) {
                    state.user.addresses = [];
                }
                state.user.addresses.push(action.payload);
            }
        },
    },
});

export const { login, loginAsGuest, logout, setUser, setToken, addAddress, setInitialized } = authSlice.actions;
export default authSlice.reducer;
