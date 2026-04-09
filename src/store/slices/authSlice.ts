import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    addresses?: { id: string; title: string; street: string }[];
}

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    /** Guest mode — user is authed as guest (no personal data) */
    isGuest: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isGuest: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<AuthUser>) {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isGuest = false;
        },
        loginAsGuest(state) {
            state.user = null;
            state.isAuthenticated = true;
            state.isGuest = true;
        },
        logout(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.isGuest = false;
        },
        setUser(state, action: PayloadAction<AuthUser>) {
            state.user = action.payload;
            state.isGuest = false;
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

export const { login, loginAsGuest, logout, setUser, addAddress } = authSlice.actions;
export default authSlice.reducer;
