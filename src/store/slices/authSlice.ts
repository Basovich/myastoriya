import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
    email: string;
    phone: string;
    name?: string;
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
    },
});

export const { login, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
