import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { addToFavoritesApi, removeFromFavoritesApi, getFavoritesApi } from '@/lib/graphql/queries/favorites';
import { GraphQLError } from '@/lib/graphql/client';
import { RootState } from '..';

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
        } catch (error) {
            console.error('[Wishlist] Failed to toggle item:', productId, error);
            return rejectWithValue(productId);
        }
    }
);

// Fetch favorites from backend to sync state
export const fetchWishlistPayloadAsync = createAsyncThunk(
    'wishlist/fetchPayloadAsync',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const { isAuthenticated, isGuest } = state.auth;
            
            // Only fetch from backend if user is fully authenticated (not a guest)
            if (!isAuthenticated || isGuest) {
                return state.wishlist.items;
            }

            const response = await getFavoritesApi({ full: false });
            return response.data.map(item => item.id);
        } catch (error) {
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
            
            // Deduplicate items before syncing
            const uniqueIds = Array.from(new Set(localItems));
            
            if (uniqueIds.length > 0) {
                isSyncingCurrentSession = true;

                // Upload local items to the backend sequentially to avoid 504 Gateway Timeouts
                for (const id of uniqueIds) {
                    try {
                        await addToFavoritesApi(Number(id));
                        // Add a small delay between sequential mutations to avoid 504 Gateway Timeouts on dev-api
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (error) {
                        if (error instanceof GraphQLError) {
                            // Product no longer exists on server — remove stale ID from local state
                            dispatch(toggleWishlistItem(id));
                            console.warn(`[Wishlist Sync] Product ${id} not found on server, removing from local state.`);
                        } else {
                            console.error(`[Wishlist Sync] Failed to add product ${id}:`, error);
                        }
                        // Continue with next items even if one fails
                    }
                }
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
