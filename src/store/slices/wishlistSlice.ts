import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { addToFavoritesApi, removeFromFavoritesApi, getFavoritesPayloadApi } from '@/lib/graphql/queries/favorites';
import { RootState } from '../index';

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
            const state = getState() as RootState;
            const wishlistItems = state.wishlist.items;
            const isFavorite = wishlistItems.includes(productId);
            const { isAuthenticated, isGuest } = state.auth;
            

            
            // Only call backend if user is fully authenticated (not a guest)
            if (isAuthenticated && !isGuest) {
                if (isFavorite) {
                    await removeFromFavoritesApi(Number(productId));
                } else {
                    await addToFavoritesApi(Number(productId));
                }
            } else {

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
            const payload = await getFavoritesPayloadApi();
            return payload.map(String);
        } catch (error: any) {
            console.error('[Wishlist] Failed to fetch payload:', error);
            return rejectWithValue('Failed to fetch wishlist');
        }
    }
);

// Keep track of sync status per session to avoid loops
let isSyncingCurrentSession = false;

// Sync local items to backend (used after login/register)
export const syncWishlistOnAuthAsync = createAsyncThunk(
    'wishlist/syncOnAuthAsync',
    async (_, { getState, dispatch, rejectWithValue }) => {
        if (isSyncingCurrentSession) return false;
        
        try {
            const state = getState() as RootState;
            const localItems = state.wishlist.items;
            
            if (localItems.length > 0) {
                isSyncingCurrentSession = true;

                // Upload all local items to the backend
                // Using map instead of for-loop for parallel requests (as per current design)
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
        } finally {
            isSyncingCurrentSession = false;
        }
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        toggleWishlistItem: (state, action: PayloadAction<string>) => {
            const productId = action.payload;
            const index = state.items.indexOf(productId);
            if (index >= 0) {
                // Remove all instances if duplicates somehow leaked in
                state.items = state.items.filter(id => id !== productId);
            } else {
                state.items.push(productId);
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
                    // Remove all instances if duplicates somehow leaked in
                    state.items = state.items.filter(id => id !== productId);
                } else {
                    state.items.push(productId);
                }
            })
            .addCase(toggleWishlistAsync.rejected, (state, action) => {
                state.loadingIds = (state.loadingIds ?? []).filter((id) => id !== action.meta.arg);
            })
            // fetchWishlistPayloadAsync
            .addCase(fetchWishlistPayloadAsync.fulfilled, (state, action) => {
                // Deduplicate items from backend
                state.items = Array.from(new Set(action.payload));
                state.isInitialized = true;
            });
    },
});

export const { toggleWishlistItem, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
