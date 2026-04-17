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
}

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    /** Guest mode — user is authed as guest (no personal data) */
    isGuest: boolean;
    /** True if the initial auth check (cookies/tokens) has completed */
    isInitialized: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isGuest: false,
    isInitialized: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<AuthUser>) {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isGuest = false;
            state.isInitialized = true;
        },
        loginAsGuest(state) {
            state.user = null;
            state.isAuthenticated = true;
            state.isGuest = true;
            state.isInitialized = true;
        },
        logout(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.isGuest = false;
            state.isInitialized = true;
        },
        setUser(state, action: PayloadAction<AuthUser>) {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isGuest = false;
            state.isInitialized = true;
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

export const { login, loginAsGuest, logout, setUser, addAddress, setInitialized } = authSlice.actions;
export default authSlice.reducer;
