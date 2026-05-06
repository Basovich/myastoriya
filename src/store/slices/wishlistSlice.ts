import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { addToFavoritesApi, removeFromFavoritesApi, getFavoritesPayloadApi } from '@/lib/graphql/queries/favorites';

interface WishlistState {
    items: string[]; // List of product IDs
    loadingIds: string[]; // IDs currently being toggled (pending API)
    isInitialized: boolean;
}

const initialState: WishlistState = {
    items: [],
    loadingIds: [],
    isInitialized: false,
};

// Toggle item in backend and return product ID
export const toggleWishlistAsync = createAsyncThunk(
    'wishlist/toggleAsync',
    async (productId: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as any;
            const wishlistItems = state.wishlist.items as string[];
            const isFavorite = wishlistItems.includes(productId);
            
            console.log(`[Wishlist] ${isFavorite ? 'Removing' : 'Adding'} product:`, productId);
            
            if (isFavorite) {
                await removeFromFavoritesApi(Number(productId));
            } else {
                await addToFavoritesApi(Number(productId));
            }
            
            return productId;
        } catch (error: any) {
            console.error('[Wishlist] Failed to toggle item:', productId, error);
            return rejectWithValue(productId);
        }
    }
);

// Fetch favorites from backend to sync state
export const fetchWishlistPayloadAsync = createAsyncThunk(
    'wishlist/fetchPayloadAsync',
    async (_, { rejectWithValue }) => {
        try {
            console.log('[Wishlist] Fetching payload from server...');
            const payload = await getFavoritesPayloadApi();
            console.log('[Wishlist] Fetched payload:', payload);
            return payload.map(String);
        } catch (error: any) {
            console.error('[Wishlist] Failed to fetch payload:', error);
            return rejectWithValue('Failed to fetch wishlist');
        }
    }
);

// Sync local items to backend (used after login/register)
export const syncWishlistOnAuthAsync = createAsyncThunk(
    'wishlist/syncOnAuthAsync',
    async (_, { getState, dispatch, rejectWithValue }) => {
        try {
            const state = getState() as any;
            const localItems = state.wishlist.items as string[];
            
            if (localItems.length > 0) {
                console.log('[Wishlist] Syncing local items to server:', localItems);
                // Upload all local items to the backend
                await Promise.allSettled(
                    localItems.map(id => addToFavoritesApi(Number(id)))
                );
            }
            
            // Fetch the combined result from the backend
            await dispatch(fetchWishlistPayloadAsync()).unwrap();
            
            return true;
        } catch (error) {
            console.error('[Wishlist] Failed to sync wishlist on auth:', error);
            return rejectWithValue('Failed to sync wishlist');
        }
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
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
            // toggleWishlistAsync
            .addCase(toggleWishlistAsync.pending, (state, action) => {
                if (!(state.loadingIds ?? []).includes(action.meta.arg)) {
                    (state.loadingIds ?? (state.loadingIds = [])).push(action.meta.arg);
                }
            })
            .addCase(toggleWishlistAsync.fulfilled, (state, action) => {
                const productId = action.payload;
                state.loadingIds = (state.loadingIds ?? []).filter((id) => id !== productId);
                
                const index = state.items.indexOf(productId);
                if (index >= 0) {
                    state.items.splice(index, 1);
                } else {
                    state.items.push(productId);
                }
            })
            .addCase(toggleWishlistAsync.rejected, (state, action) => {
                state.loadingIds = (state.loadingIds ?? []).filter((id) => id !== action.meta.arg);
            })
            // fetchWishlistPayloadAsync
            .addCase(fetchWishlistPayloadAsync.fulfilled, (state, action) => {
                state.items = action.payload;
                state.isInitialized = true;
            });
    },
});

export const { toggleWishlistItem, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
