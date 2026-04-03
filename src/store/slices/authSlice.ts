import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
    email: string;
    phone: string;
    name?: string;
    addresses?: { id: string; title: string; street: string }[];
}

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: {
        email: 'customer@test.com',
        phone: '380998887766',
        name: 'Олександр Іванов',
        addresses: [
            { id: '1', title: 'Моя адреса №1', street: 'вул. Антонова, дім 45, кв. 34' },
        ],
    },
    isAuthenticated: true,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<AuthUser>) {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        logout(state) {
            state.user = null;
            state.isAuthenticated = false;
        },
        setUser(state, action: PayloadAction<AuthUser>) {
            state.user = action.payload;
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

export const { login, logout, setUser, addAddress } = authSlice.actions;
export default authSlice.reducer;
