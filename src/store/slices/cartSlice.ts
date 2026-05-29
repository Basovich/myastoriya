import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    getCartApi,
    addProductToCartApi,
    editCartItemQuantityApi,
    removeCartItemApi,
    CartGql
} from '@/lib/graphql/queries/cart';
import { RootState } from '../index';

export interface CartItem {
    id: string; // Product ID
    rowId?: string; // Unique key returned by backend
    quantity: number;
}

interface CartState {
    items: CartItem[];
    isInitialized: boolean;
    loading: boolean;
}

const initialState: CartState = {
    items: [],
    isInitialized: false,
    loading: false,
};

// Helper to map CartGql to local CartItem[]
const mapCartItems = (cart: CartGql): CartItem[] => {
    return (cart.items ?? []).map(item => ({
        id: String(item.productId),
        rowId: item.rowId,
        quantity: item.quantity,
    }));
};

// Async Thunks
export const fetchCartAsync = createAsyncThunk(
    'cart/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getCartApi();
            return mapCartItems(response);
        } catch (error: any) {
            console.error('[Cart] Failed to fetch cart from backend:', error);
            return rejectWithValue('Failed to fetch cart');
        }
    }
);

export const addToCartAsync = createAsyncThunk(
    'cart/add',
    async (
        payload: { id: string; quantity: number; costVariantId?: number },
        { dispatch, rejectWithValue }
    ) => {
        try {
            const response = await addProductToCartApi({
                productId: Number(payload.id),
                quantity: payload.quantity,
                costVariantId: payload.costVariantId,
            });
            return mapCartItems(response);
        } catch (error: any) {
            console.error('[Cart] Failed to add product to backend cart:', error);
            // Optimistic / fallback: update locally if backend request fails
            dispatch(addToCart(payload));
            return rejectWithValue('Failed to add product to cart');
        }
    }
);

export const updateQuantityAsync = createAsyncThunk(
    'cart/updateQuantity',
    async (
        payload: { id: string; quantity: number },
        { getState, dispatch, rejectWithValue }
    ) => {
        try {
            const state = getState() as RootState;
            const item = state.cart.items.find(i => i.id === payload.id);

            if (item?.rowId) {
                const response = await editCartItemQuantityApi({
                    rowId: item.rowId,
                    quantity: payload.quantity,
                });
                return mapCartItems(response);
            } else {
                // No rowId, update locally
                dispatch(updateQuantity(payload));
                return rejectWithValue('No rowId found');
            }
        } catch (error: any) {
            console.error('[Cart] Failed to update cart item quantity:', error);
            // Fallback: update locally if backend request fails
            dispatch(updateQuantity(payload));
            return rejectWithValue('Failed to update quantity');
        }
    }
);

export const removeFromCartAsync = createAsyncThunk(
    'cart/remove',
    async (
        productId: string,
        { getState, dispatch, rejectWithValue }
    ) => {
        try {
            const state = getState() as RootState;
            const item = state.cart.items.find(i => i.id === productId);

            if (item?.rowId) {
                const response = await removeCartItemApi({
                    rowId: item.rowId,
                });
                return mapCartItems(response);
            } else {
                // No rowId, remove locally
                dispatch(removeFromCart(productId));
                return rejectWithValue('No rowId found');
            }
        } catch (error: any) {
            console.error('[Cart] Failed to remove cart item from backend:', error);
            // Fallback: remove locally if backend request fails
            dispatch(removeFromCart(productId));
            return rejectWithValue('Failed to remove from cart');
        }
    }
);

// Keep track of sync status per session to avoid loops
let isSyncingCurrentSession = false;

// Sync local items to backend (used after login/register)
export const syncCartOnAuthAsync = createAsyncThunk(
    'cart/syncOnAuth',
    async (_, { getState, dispatch, rejectWithValue }) => {
        if (isSyncingCurrentSession) return false;

        try {
            const state = getState() as RootState;
            const localItems = state.cart.items;

            // Deduplicate items before syncing
            const uniqueItems = Array.from(
                new Map(localItems.map(item => [item.id, item])).values()
            );

            if (uniqueItems.length > 0) {
                isSyncingCurrentSession = true;

                // Sync local items sequentially to avoid 504 errors on dev-api
                for (const item of uniqueItems) {
                    try {
                        await addProductToCartApi({
                            productId: Number(item.id),
                            quantity: item.quantity,
                        });
                        // Small delay to prevent rate limits
                        await new Promise(resolve => setTimeout(resolve, 300));
                    } catch (error) {
                        console.error(`[Cart Sync] Failed to add product ${item.id}:`, error);
                    }
                }
            }

            // Fetch the combined result from the backend
            await dispatch(fetchCartAsync()).unwrap();
            return true;
        } catch (error) {
            console.error('[Cart] Failed to sync cart on auth:', error);
            return rejectWithValue('Failed to sync cart');
        } finally {
            isSyncingCurrentSession = false;
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const existingItem = state.items.find(item => item.id === action.payload.id);
            if (existingItem) {
                existingItem.quantity += action.payload.quantity;
            } else {
                state.items.push({
                    id: action.payload.id,
                    quantity: action.payload.quantity,
                });
            }
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.id !== action.payload);
        },
        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const item = state.items.find(item => item.id === action.payload.id);
            if (item) {
                item.quantity = action.payload.quantity;
            }
        },
        clearCart: (state) => {
            state.items = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchCartAsync
            .addCase(fetchCartAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCartAsync.fulfilled, (state, action) => {
                state.items = action.payload;
                state.isInitialized = true;
                state.loading = false;
            })
            .addCase(fetchCartAsync.rejected, (state) => {
                state.loading = false;
            })
            // addToCartAsync
            .addCase(addToCartAsync.fulfilled, (state, action) => {
                state.items = action.payload;
            })
            // updateQuantityAsync
            .addCase(updateQuantityAsync.fulfilled, (state, action) => {
                state.items = action.payload;
            })
            // removeFromCartAsync
            .addCase(removeFromCartAsync.fulfilled, (state, action) => {
                state.items = action.payload;
            });
    }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
