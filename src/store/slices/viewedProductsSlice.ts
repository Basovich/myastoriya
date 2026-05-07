import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { addProductViewApi } from '@/lib/graphql/queries/products';
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
            const { isAuthenticated } = state.auth;
            
            // Call backend if we have any authentication (guest or user)
            if (isAuthenticated) {
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
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const localItems = state.viewedProducts.items;
            
            if (localItems.length > 0) {

                // Upload all local items to the backend
                await Promise.allSettled(
                    localItems.map(id => addProductViewApi(id))
                );
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

export const { addViewedProduct, clearViewedProducts } = viewedProductsSlice.actions;
export default viewedProductsSlice.reducer;
