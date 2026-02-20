import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
    items: string[]; // List of product IDs
}

const initialState: WishlistState = {
    items: [],
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        toggleWishlistItem: (state, action: PayloadAction<string>) => {
            const index = state.items.indexOf(action.payload);
            if (index >= 0) {
                // If it exists, remove it
                state.items.splice(index, 1);
            } else {
                // Otherwise, add it
                state.items.push(action.payload);
            }
        },
        clearWishlist: (state) => {
            state.items = [];
        }
    }
});

export const { toggleWishlistItem, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
