import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/nextjs';
import {
    getCartApi,
    addProductToCartApi,
    editCartItemQuantityApi,
    removeCartItemApi,
    CartGql,
    CartPromoCodeGql
} from '@/lib/graphql/queries/cart';
import { RootState } from '../index';

export interface CartItem {
    id: string; // Product ID
    rowId?: string; // Unique key returned by backend
    quantity: number;
    cost?: number;
    purchaseCost?: number;
    costVariantId?: number | null;
    costVariantName?: string | null;
}

export interface CartPromoCode {
    isApplied: boolean;
    code?: string | null;
    discount?: string | null;
}

interface CartState {
    items: CartItem[];
    deletingIds: string[];
    isInitialized: boolean;
    loading: boolean;
    promoCode: CartPromoCode | null;
}

const initialState: CartState = {
    items: [],
    deletingIds: [],
    isInitialized: false,
    loading: false,
    promoCode: null,
};

// Helper to map CartGql to local CartItem[]
const mapCartItems = (cart: CartGql): CartItem[] => {
    return (cart.items ?? []).map(item => ({
        id: String(item.productId),
        rowId: item.rowId,
        quantity: item.quantity,
        cost: item.cost,
        purchaseCost: item.purchaseCost,
        costVariantId: item.costVariantId,
        costVariantName: item.costVariantName,
    }));
};

// Helper to merge optimistic items with backend state
const mergeCartItems = (currentItems: CartItem[], backendItems: CartItem[]): CartItem[] => {
    const getMapKey = (item: CartItem) => `${item.id}_${item.costVariantId ?? ''}`;
    const backendMap = new Map(backendItems.map(item => [getMapKey(item), item]));
    const optimisticItems = currentItems.filter(item => !item.rowId);
    const merged = [...backendItems];

    for (const optItem of optimisticItems) {
        const key = getMapKey(optItem);
        if (!backendMap.has(key)) {
            merged.push(optItem);
        }
    }
    return merged;
};

// Async Thunks
export const fetchCartAsync = createAsyncThunk(
    'cart/fetch',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await getCartApi();
            dispatch(setPromoCode(response.promoCode || null));
            return mapCartItems(response);
        } catch (error: any) {
            console.error('[Cart] Failed to fetch cart from backend:', error);
            Sentry.captureException(error);
            return rejectWithValue('Failed to fetch cart');
        }
    }
);

export const addToCartAsync = createAsyncThunk(
    'cart/add',
    async (
        payload: { id: string; quantity: number; costVariantId?: number },
        { getState, dispatch, rejectWithValue }
    ) => {
        try {
            const state = getState() as RootState;

            // Auth hasn't completed yet — no access_token cookie exists.
            // The item is already stored optimistically by the pending reducer.
            // syncCartOnAuthAsync will push it to the backend once auth is ready.
            if (!state.auth.isInitialized) {
                return null;
            }

            const existingItem = state.cart.items.find(
                item => item.id === payload.id && item.costVariantId === (payload.costVariantId ?? null)
            );

            let response;
            if (existingItem && existingItem.rowId) {
                response = await editCartItemQuantityApi({
                    rowId: existingItem.rowId,
                    quantity: existingItem.quantity,
                });
            } else {
                response = await addProductToCartApi({
                    productId: Number(payload.id),
                    quantity: payload.quantity,
                    costVariantId: payload.costVariantId,
                });
            }
            dispatch(setPromoCode(response.promoCode || null));
            return mapCartItems(response);
        } catch (error: unknown) {
            console.error('[Cart] Failed to add or update product in backend cart:', error);
            Sentry.captureException(error, { extra: { payload } });
            return rejectWithValue('Failed to add product to cart');
        }
    }
);

export const updateQuantityAsync = createAsyncThunk(
    'cart/updateQuantity',
    async (
        payload: { id: string; rowId?: string; quantity: number },
        { getState, dispatch, rejectWithValue }
    ) => {
        try {
            const state = getState() as RootState;
            const item = state.cart.items.find(
                i => payload.rowId ? i.rowId === payload.rowId : i.id === payload.id
            );

            if (item?.rowId) {
                const response = await editCartItemQuantityApi({
                    rowId: item.rowId,
                    quantity: payload.quantity,
                });
                dispatch(setPromoCode(response.promoCode || null));
                return mapCartItems(response);
            } else {
                return rejectWithValue('No rowId found');
            }
        } catch (error: any) {
            console.error('[Cart] Failed to update cart item quantity:', error);
            void dispatch(fetchCartAsync());
            return rejectWithValue('Failed to update quantity');
        }
    }
);

export const removeFromCartAsync = createAsyncThunk(
    'cart/remove',
    async (
        payload: { id: string; rowId?: string },
        { getState, dispatch, rejectWithValue }
    ) => {
        try {
            const rowId = payload.rowId || (getState() as RootState).cart.items.find(i => i.id === payload.id)?.rowId;

            if (rowId) {
                const response = await removeCartItemApi({
                    rowId,
                });
                dispatch(setPromoCode(response.promoCode || null));
                return mapCartItems(response);
            } else {
                return rejectWithValue('No rowId found');
            }
        } catch (error: any) {
            console.error('[Cart] Failed to remove cart item from backend:', error);
            void dispatch(fetchCartAsync());
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
                new Map(localItems.map(item => [`${item.id}_${item.costVariantId ?? ''}`, item])).values()
            );

            if (uniqueItems.length > 0) {
                isSyncingCurrentSession = true;

                // Sync local items sequentially to avoid 504 errors on dev-api
                for (const item of uniqueItems) {
                    try {
                        await addProductToCartApi({
                            productId: Number(item.id),
                            quantity: item.quantity,
                            costVariantId: item.costVariantId || undefined,
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
        addToCart: (state, action: PayloadAction<{ id: string; quantity: number; costVariantId?: number }>) => {
            const existingItem = state.items.find(
                item => item.id === action.payload.id && item.costVariantId === (action.payload.costVariantId ?? null)
            );
            if (existingItem) {
                existingItem.quantity += action.payload.quantity;
            } else {
                state.items.push({
                    id: action.payload.id,
                    quantity: action.payload.quantity,
                    costVariantId: action.payload.costVariantId ?? null,
                });
            }
        },
        removeFromCart: (state, action: PayloadAction<{ id: string; rowId?: string } | string>) => {
            const targetId = typeof action.payload === 'string' ? action.payload : action.payload.id;
            const targetRowId = typeof action.payload === 'string' ? undefined : action.payload.rowId;
            state.items = state.items.filter(
                item => targetRowId ? item.rowId !== targetRowId : item.id !== targetId
            );
        },
        updateQuantity: (state, action: PayloadAction<{ id: string; rowId?: string; quantity: number }>) => {
            const item = state.items.find(
                item => action.payload.rowId ? item.rowId === action.payload.rowId : item.id === action.payload.id
            );
            if (item) {
                item.quantity = action.payload.quantity;
            }
        },
        clearCart: (state) => {
            state.items = [];
        },
        setPromoCode: (state, action: PayloadAction<CartPromoCode | null>) => {
            state.promoCode = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchCartAsync
            .addCase(fetchCartAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCartAsync.fulfilled, (state, action) => {
                if (!state.deletingIds) {
                    state.deletingIds = [];
                }
                // Merge backend state with local optimistic items (no rowId yet)
                // so items added before auth was ready are not wiped.
                state.items = mergeCartItems(state.items, action.payload).filter(
                    item => !state.deletingIds.includes(item.rowId || item.id)
                );
                state.isInitialized = true;
                state.loading = false;
            })
            .addCase(fetchCartAsync.rejected, (state) => {
                state.loading = false;
            })
            // addToCartAsync
            .addCase(addToCartAsync.pending, (state, action) => {
                state.loading = true;
                const { id, quantity, costVariantId } = action.meta.arg;
                const existingItem = state.items.find(
                    item => item.id === id && item.costVariantId === (costVariantId ?? null)
                );
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    state.items.push({
                        id,
                        quantity,
                        costVariantId: costVariantId ?? null,
                    });
                }
            })
            .addCase(addToCartAsync.fulfilled, (state, action) => {
                // null payload = local-only add (auth not ready), state already set by pending
                if (action.payload === null) {
                    state.loading = false;
                    return;
                }
                if (!state.deletingIds) {
                    state.deletingIds = [];
                }
                state.items = mergeCartItems(state.items, action.payload).filter(
                    item => !state.deletingIds.includes(item.rowId || item.id)
                );
                state.loading = false;
            })
            .addCase(addToCartAsync.rejected, (state, action) => {
                state.loading = false;
                if (action.meta.arg) {
                    const { id, quantity, costVariantId } = action.meta.arg;
                    const existingItem = state.items.find(
                        item => item.id === id && item.costVariantId === (costVariantId ?? null)
                    );
                    if (existingItem) {
                        existingItem.quantity -= quantity;
                        if (existingItem.quantity <= 0) {
                            state.items = state.items.filter(
                                item => !(item.id === id && item.costVariantId === (costVariantId ?? null))
                            );
                        }
                    }
                }
            })
            // updateQuantityAsync
            .addCase(updateQuantityAsync.pending, (state, action) => {
                state.loading = true;
                const { id, rowId, quantity } = action.meta.arg;
                const item = state.items.find(i => rowId ? i.rowId === rowId : i.id === id);
                if (item) {
                    item.quantity = quantity;
                }
            })
            .addCase(updateQuantityAsync.fulfilled, (state, action) => {
                if (!state.deletingIds) {
                    state.deletingIds = [];
                }
                state.items = mergeCartItems(state.items, action.payload).filter(
                    item => !state.deletingIds.includes(item.rowId || item.id)
                );
                state.loading = false;
            })
            .addCase(updateQuantityAsync.rejected, (state) => {
                state.loading = false;
            })
            // removeFromCartAsync
            .addCase(removeFromCartAsync.pending, (state, action) => {
                state.loading = true;
                const { id, rowId } = action.meta.arg;
                if (!state.deletingIds) {
                    state.deletingIds = [];
                }
                const key = rowId || id;
                if (!state.deletingIds.includes(key)) {
                    state.deletingIds.push(key);
                }
                state.items = state.items.filter(item => rowId ? item.rowId !== rowId : item.id !== id);
            })
            .addCase(removeFromCartAsync.fulfilled, (state, action) => {
                const { id, rowId } = action.meta.arg;
                if (!state.deletingIds) {
                    state.deletingIds = [];
                }
                const key = rowId || id;
                state.deletingIds = state.deletingIds.filter(dId => dId !== key);
                state.items = mergeCartItems(state.items, action.payload).filter(
                    item => !state.deletingIds.includes(item.rowId || item.id)
                );
                state.loading = false;
            })
            .addCase(removeFromCartAsync.rejected, (state, action) => {
                state.loading = false;
                if (action.meta.arg) {
                    const { id, rowId } = action.meta.arg;
                    if (!state.deletingIds) {
                        state.deletingIds = [];
                    }
                    const key = rowId || id;
                    state.deletingIds = state.deletingIds.filter(dId => dId !== key);
                }
            });
    }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setPromoCode } = cartSlice.actions;
export default cartSlice.reducer;
