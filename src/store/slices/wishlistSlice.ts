import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
    items: string[]; // List of product IDs
    loadingIds: string[]; // IDs currently being toggled (pending API)
}

const initialState: WishlistState = {
    items: [],
    loadingIds: [],
};

// Fake API call — замінити на реальний endpoint пізніше
export const toggleWishlistAsync = createAsyncThunk(
    'wishlist/toggleAsync',
    async (productId: string) => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        // TODO: replace with real API call, e.g.:
        // await fetch(`/api/wishlist/toggle`, { method: 'POST', body: JSON.stringify({ productId }) });
        return productId;
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        // Keep synchronous action for compatibility
        toggleWishlistItem: (state, action: PayloadAction<string>) => {
            const index = state.items.indexOf(action.payload);
            if (index >= 0) {
                state.items.splice(index, 1);
            } else {
                state.items.push(action.payload);
            }
        },
        clearWishlist: (state) => {
            state.items = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(toggleWishlistAsync.pending, (state, action) => {
                if (!(state.loadingIds ?? []).includes(action.meta.arg)) {
                    (state.loadingIds ?? (state.loadingIds = [])).push(action.meta.arg);
                }
            })
            .addCase(toggleWishlistAsync.fulfilled, (state, action) => {
                const productId = action.payload;
                // Remove from loading
                state.loadingIds = (state.loadingIds ?? []).filter((id) => id !== productId);
                // Toggle in list
                const index = state.items.indexOf(productId);
                if (index >= 0) {
                    state.items.splice(index, 1);
                } else {
                    state.items.push(productId);
                }
            })
            .addCase(toggleWishlistAsync.rejected, (state, action) => {
                // Remove from loading on error
                state.loadingIds = (state.loadingIds ?? []).filter((id) => id !== action.meta.arg);
            });
    },
});

export const { toggleWishlistItem, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
