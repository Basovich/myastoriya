import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { addProductViewApi } from '@/lib/graphql/queries/products';
import { GraphQLError } from '@/lib/graphql/client';
import { RootState } from '../index';

interface ViewedProductsState {
    items: string[]; // List of product IDs
    loadingIds: string[];
}

const initialState: ViewedProductsState = {
    items: [],
    loadingIds: [],
};

// Record a product view in backend if authorized, otherwise just update local state
export const recordProductViewAsync = createAsyncThunk(
    'viewedProducts/recordAsync',
    async (productId: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const { isAuthenticated, isGuest } = state.auth;
            
            // Call backend if user is fully authenticated (not a guest)
            if (isAuthenticated && !isGuest) {
                await addProductViewApi(productId);
            }
            
            return productId;
        } catch (error: any) {
            console.error('[ViewedProducts] Failed to record view:', productId, error);
            return rejectWithValue(productId);
        }
    }
);

// Sync local items to backend (used after login/register)
export const syncViewedProductsOnAuthAsync = createAsyncThunk(
    'viewedProducts/syncOnAuthAsync',
    async (_, { getState, dispatch, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const localItems = state.viewedProducts.items;
            
            // Deduplicate items before syncing
            const uniqueIds = Array.from(new Set(localItems));
            
            if (uniqueIds.length > 0) {
                // Upload all local items to the backend sequentially to avoid 504 Gateway Timeouts
                for (const id of uniqueIds) {
                    try {
                        await addProductViewApi(id);
                        // Add a small delay between sequential mutations to avoid 504 Gateway Timeouts on dev-api
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (error) {
                        if (error instanceof GraphQLError) {
                            // Product no longer exists on server — remove stale ID from local state
                            dispatch(removeViewedProduct(id));
                            console.warn(`[ViewedProducts Sync] Product ${id} not found on server, removing from local state.`);
                        } else {
                            console.error(`[ViewedProducts Sync] Failed to record view for ${id}:`, error);
                        }
                        // Continue even if one fails
                    }
                }
            }
            
            return true;
        } catch (error) {
            console.error('[ViewedProducts] Failed to sync on auth:', error);
            return rejectWithValue('Failed to sync viewed products');
        }
    }
);

const viewedProductsSlice = createSlice({
    name: 'viewedProducts',
    initialState,
    reducers: {
        addViewedProduct: (state, action: PayloadAction<string>) => {
            const productId = action.payload;
            // Remove if exists to move to top (most recent)
            state.items = state.items.filter(id => id !== productId);
            state.items.unshift(productId);
            // Limit to e.g. 50 items
            if (state.items.length > 50) {
                state.items = state.items.slice(0, 50);
            }
        },
        clearViewedProducts: (state) => {
            state.items = [];
        },
        removeViewedProduct: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(id => id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(recordProductViewAsync.fulfilled, (state, action) => {
                const productId = action.payload;
                state.items = state.items.filter(id => id !== productId);
                state.items.unshift(productId);
                if (state.items.length > 50) {
                    state.items = state.items.slice(0, 50);
                }
            });
    },
});

export const { addViewedProduct, clearViewedProducts, removeViewedProduct } = viewedProductsSlice.actions;
export default viewedProductsSlice.reducer;
