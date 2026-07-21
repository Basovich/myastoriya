import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/nextjs';
import {
    getCartApi,
    addProductToCartApi,
    editCartItemQuantityApi,
    removeCartItemApi,
    CartGql
} from '@/lib/graphql/queries/cart';
import { getProductsByIdsApi, resolveProductImageUrl } from '@/lib/graphql/queries/products';
import { RootState } from '..';

export interface CartItemModifier {
    id: number;
    name?: string | null;
    price?: number | null;
}

export interface CartItem {
    id: string; // Product ID
    rowId?: string; // Unique key returned by backend
    quantity: number;
    cost?: number;
    purchaseCost?: number;
    costVariantId?: number | null;
    costVariantName?: string | null;
    modifiers?: CartItemModifier[] | null;
    multiplier?: number;
}

export interface CartPromoCode {
    isApplied: boolean;
    code?: string | null;
    discount?: string | null;
}

export interface RemovedCartItem {
    id: string;
    title: string;
    image: string;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    deletingIds: string[];
    isInitialized: boolean;
    loading: boolean;
    isSyncing: boolean;
    promoCode: CartPromoCode | null;
    cashback: number;
    useBonuses: boolean;
    total: number;
    isCartModalOpen: boolean;
    removedItems: RemovedCartItem[];
    productDetails: Record<string, { title: string; image: string }>;
}

const initialState: CartState = {
    items: [],
    deletingIds: [],
    isInitialized: false,
    loading: false,
    isSyncing: false,
    promoCode: null,
    cashback: 0,
    useBonuses: false,
    total: 0,
    isCartModalOpen: false,
    removedItems: [],
    productDetails: {},
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
        multiplier: item.multiplier,
        modifiers: item.modifiers ? item.modifiers.map(m => ({
            id: m.id,
            name: m.name,
            price: m.price,
        })) : null,
    }));
};

// Helper to merge optimistic items with backend state
const mergeCartItems = (currentItems: CartItem[], backendItems: CartItem[]): CartItem[] => {
    const getMapKey = (item: CartItem) => {
        const modKey = item.modifiers ? [...item.modifiers].map(m => m.id).sort((a, b) => a - b).join(',') : '';
        return `${item.id}_${item.costVariantId ?? ''}_${modKey}`;
    };
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
    async (_, { getState, dispatch, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const useBonuses = state.cart.useBonuses;
            const prevItems = state.cart.items;
            const response = await getCartApi({ useBonuses });
            dispatch(setPromoCode(response.promoCode || null));
            dispatch(setCashback(response.cashback || 0));
            dispatch(setTotal(response.total || 0));

            const newItems = mapCartItems(response);
            const hasUnavailableProducts = response.hasUnavailableProducts || false;

            // Detect removed items here (while we still have prevItems)
            // and dispatch enrichment thunk so modal shows real product names
            if (hasUnavailableProducts) {
                const removedPayload = prevItems
                    .filter(oldItem => !newItems.some(newItem => newItem.id === oldItem.id))
                    .map(item => ({ id: item.id, quantity: item.quantity }));

                if (removedPayload.length > 0) {
                    void dispatch(fetchAndSetRemovedItemsAsync(removedPayload));
                }
            }

            return { items: newItems, hasUnavailableProducts };
        } catch (error: unknown) {
            console.error('[Cart] Failed to fetch cart from backend:', error);
            Sentry.captureException(error);
            return rejectWithValue('Failed to fetch cart');
        }
    }
);

/**
 * When the backend signals unavailable products after a locality change,
 * this thunk fetches real product details (name, image) for all removed items
 * so the cart notification modal shows accurate names instead of a generic fallback.
 */
export const fetchAndSetRemovedItemsAsync = createAsyncThunk(
    'cart/fetchAndSetRemovedItems',
    async (removedItems: { id: string; quantity: number }[], { getState, dispatch }) => {
        const state = getState() as RootState;
        const detailsCache = state.cart.productDetails;

        const missingIds: number[] = [];
        const enriched: RemovedCartItem[] = removedItems.map(item => {
            const cached = detailsCache[item.id];
            if (!cached) missingIds.push(Number(item.id));
            return {
                id: item.id,
                title: cached?.title || '',
                image: cached?.image || '/images/product-placeholder.svg',
                quantity: item.quantity,
            };
        });

        if (missingIds.length > 0) {
            try {
                const fetched = await getProductsByIdsApi(missingIds);
                const fetchedMap = new Map(fetched.map(p => [String(p.id), p]));

                const detailsToSave: Record<string, { title: string; image: string }> = {};
                for (const p of fetched) {
                    detailsToSave[String(p.id)] = {
                        title: p.name,
                        image: resolveProductImageUrl(p) || '/images/product-placeholder.svg',
                    };
                }
                dispatch(saveProductDetails(detailsToSave));

                enriched.forEach(item => {
                    const p = fetchedMap.get(item.id);
                    if (p) {
                        item.title = p.name;
                        item.image = resolveProductImageUrl(p) || '/images/product-placeholder.svg';
                    } else if (!item.title) {
                        item.title = 'Товар';
                    }
                });
            } catch (err) {
                console.warn('[Cart] Failed to fetch removed product details:', err);
                enriched.forEach(item => { if (!item.title) item.title = 'Товар'; });
            }
        } else {
            enriched.forEach(item => { if (!item.title) item.title = 'Товар'; });
        }

        return enriched;
    }
);

export const toggleUseBonusesAsync = createAsyncThunk(
    'cart/toggleUseBonuses',
    async (useBonuses: boolean, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setUseBonuses(useBonuses));
            const response = await getCartApi({ useBonuses });
            dispatch(setPromoCode(response.promoCode || null));
            dispatch(setCashback(response.cashback || 0));
            dispatch(setTotal(response.total || 0));
            return mapCartItems(response);
        } catch (error: unknown) {
            console.error('[Cart] Failed to toggle useBonuses:', error);
            Sentry.captureException(error);
            return rejectWithValue('Failed to toggle useBonuses');
        }
    }
);

export const addToCartAsync = createAsyncThunk(
    'cart/add',
    async (
        payload: { id: string; quantity: number; costVariantId?: number; modifierIds?: number[] },
        { getState, dispatch, rejectWithValue }
    ) => {
        try {
            const state = getState() as RootState;
            const useBonuses = state.cart.useBonuses;

            // Auth hasn't completed yet — no access_token cookie exists.
            // The item is already stored optimistically by the pending reducer.
            // syncCartOnAuthAsync will push it to the backend once auth is ready.
            if (!state.auth.isInitialized) {
                return null;
            }

            const payloadModIds = payload.modifierIds ? [...payload.modifierIds].sort((a, b) => a - b) : [];
            const existingItem = state.cart.items.find(item => {
                if (item.id !== payload.id || item.costVariantId !== (payload.costVariantId ?? null)) {
                    return false;
                }
                const itemModIds = item.modifiers ? item.modifiers.map(m => m.id).sort((a, b) => a - b) : [];
                return (
                    itemModIds.length === payloadModIds.length &&
                    itemModIds.every((id, idx) => id === payloadModIds[idx])
                );
            });

            let response;
            if (existingItem && existingItem.rowId) {
                response = await editCartItemQuantityApi({
                    rowId: existingItem.rowId,
                    quantity: existingItem.quantity,
                    useBonuses,
                });
            } else {
                response = await addProductToCartApi({
                    productId: Number(payload.id),
                    quantity: payload.quantity,
                    costVariantId: payload.costVariantId,
                    modifierIds: payload.modifierIds,
                    useBonuses,
                });
            }
            dispatch(setPromoCode(response.promoCode || null));
            dispatch(setCashback(response.cashback || 0));
            dispatch(setTotal(response.total || 0));
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
            const useBonuses = state.cart.useBonuses;
            const item = state.cart.items.find(
                i => payload.rowId ? i.rowId === payload.rowId : i.id === payload.id
            );

            if (item?.rowId) {
                const response = await editCartItemQuantityApi({
                    rowId: item.rowId,
                    quantity: payload.quantity,
                    useBonuses,
                });
                dispatch(setPromoCode(response.promoCode || null));
                dispatch(setCashback(response.cashback || 0));
                dispatch(setTotal(response.total || 0));
                return mapCartItems(response);
            } else {
                return rejectWithValue('No rowId found');
            }
        } catch (error: unknown) {
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
            const state = getState() as RootState;
            const useBonuses = state.cart.useBonuses;
            const rowId = payload.rowId || state.cart.items.find(i => i.id === payload.id)?.rowId;

            if (rowId) {
                const response = await removeCartItemApi({
                    rowId,
                    useBonuses,
                });
                dispatch(setPromoCode(response.promoCode || null));
                dispatch(setCashback(response.cashback || 0));
                dispatch(setTotal(response.total || 0));
                return mapCartItems(response);
            } else {
                return rejectWithValue('No rowId found');
            }
        } catch (error: unknown) {
            console.error('[Cart] Failed to remove cart item from backend:', error);
            void dispatch(fetchCartAsync());
            return rejectWithValue('Failed to remove from cart');
        }
    }
);

// Sync local items to backend (used after login/register)
export const syncCartOnAuthAsync = createAsyncThunk(
    'cart/syncOnAuth',
    async (_, { getState, dispatch, rejectWithValue }) => {
        const state = getState() as RootState;
        // Guard against concurrent syncs — isSyncing is stored in Redux state
        // so it correctly resets on logout unlike a module-level variable.
        if (state.cart.isSyncing) return false;

        try {
            const localItems = state.cart.items;

            // Deduplicate items before syncing (including modifiers)
            const uniqueItems = Array.from(
                new Map(localItems.map(item => {
                    const modKey = item.modifiers ? [...item.modifiers].map(m => m.id).sort((a, b) => a - b).join(',') : '';
                    const key = `${item.id}_${item.costVariantId ?? ''}_${modKey}`;
                    return [key, item];
                })).values()
            );

            if (uniqueItems.length > 0) {
                // Sync local items in parallel via Promise.all for performance
                await Promise.all(
                    uniqueItems.map(async (item) => {
                        try {
                            const modifierIds = item.modifiers ? item.modifiers.map(m => m.id) : undefined;
                            await addProductToCartApi({
                                productId: Number(item.id),
                                quantity: item.quantity,
                                costVariantId: item.costVariantId || undefined,
                                modifierIds,
                            });
                        } catch (error) {
                            console.warn(`[Cart Sync] Failed to add product ${item.id}:`, error instanceof Error ? error.message : error);
                        }
                    })
                );
            }

            // Fetch the combined result from the backend
            await dispatch(fetchCartAsync()).unwrap();
            return true;
        } catch (error) {
            console.warn('[Cart] Failed to sync cart on auth:', error instanceof Error ? error.message : error);
            return rejectWithValue('Failed to sync cart');
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
            state.useBonuses = false;
            state.total = 0;
        },
        setPromoCode: (state, action: PayloadAction<CartPromoCode | null>) => {
            state.promoCode = action.payload;
        },
        setCashback: (state, action: PayloadAction<number>) => {
            state.cashback = action.payload;
        },
        setUseBonuses: (state, action: PayloadAction<boolean>) => {
            state.useBonuses = action.payload;
        },
        setTotal: (state, action: PayloadAction<number>) => {
            state.total = action.payload;
        },
        setCartModalOpen: (state, action: PayloadAction<boolean>) => {
            state.isCartModalOpen = action.payload;
        },
        saveProductDetails: (state, action: PayloadAction<Record<string, { title: string; image: string }>>) => {
            state.productDetails = {
                ...state.productDetails,
                ...action.payload
            };
        },
        clearRemovedItems: (state) => {
            state.removedItems = [];
            state.isCartModalOpen = false;
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
                // Removed item detection and modal dispatch happen in the fetchCartAsync thunk itself
                // (via fetchAndSetRemovedItemsAsync). Here we just update the items list.
                state.items = mergeCartItems(state.items, action.payload.items).filter(
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
                const { id, quantity, costVariantId, modifierIds } = action.meta.arg;
                const payloadModIds = modifierIds ? [...modifierIds].sort((a, b) => a - b) : [];
                const existingItem = state.items.find(item => {
                    if (item.id !== id || item.costVariantId !== (costVariantId ?? null)) {
                        return false;
                    }
                    const itemModIds = item.modifiers ? item.modifiers.map(m => m.id).sort((a, b) => a - b) : [];
                    return (
                        itemModIds.length === payloadModIds.length &&
                        itemModIds.every((idVal, idx) => idVal === payloadModIds[idx])
                    );
                });
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    state.items.push({
                        id,
                        quantity,
                        costVariantId: costVariantId ?? null,
                        modifiers: modifierIds ? modifierIds.map(mId => ({ id: mId })) : null,
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
                    const { id, quantity, costVariantId, modifierIds } = action.meta.arg;
                    const payloadModIds = modifierIds ? [...modifierIds].sort((a, b) => a - b) : [];
                    const existingItem = state.items.find(item => {
                        if (item.id !== id || item.costVariantId !== (costVariantId ?? null)) {
                            return false;
                        }
                        const itemModIds = item.modifiers ? item.modifiers.map(m => m.id).sort((a, b) => a - b) : [];
                        return (
                            itemModIds.length === payloadModIds.length &&
                            itemModIds.every((idVal, idx) => idVal === payloadModIds[idx])
                        );
                    });
                    if (existingItem) {
                        existingItem.quantity -= quantity;
                        if (existingItem.quantity <= 0) {
                            state.items = state.items.filter(item => {
                                if (item.id !== id || item.costVariantId !== (costVariantId ?? null)) {
                                    return true;
                                }
                                const itemModIds = item.modifiers ? item.modifiers.map(m => m.id).sort((a, b) => a - b) : [];
                                const isMatch = itemModIds.length === payloadModIds.length &&
                                    itemModIds.every((idVal, idx) => idVal === payloadModIds[idx]);
                                return !isMatch;
                            });
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
            })
            // toggleUseBonusesAsync
            .addCase(toggleUseBonusesAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(toggleUseBonusesAsync.fulfilled, (state, action) => {
                if (!state.deletingIds) {
                    state.deletingIds = [];
                }
                state.items = mergeCartItems(state.items, action.payload).filter(
                    item => !state.deletingIds.includes(item.rowId || item.id)
                );
                state.isInitialized = true;
                state.loading = false;
            })
            .addCase(toggleUseBonusesAsync.rejected, (state) => {
                state.loading = false;
            })
            // syncCartOnAuthAsync
            .addCase(syncCartOnAuthAsync.pending, (state) => {
                state.loading = true;
                state.isSyncing = true;
            })
            .addCase(syncCartOnAuthAsync.fulfilled, (state) => {
                state.loading = false;
                state.isSyncing = false;
            })
            .addCase(syncCartOnAuthAsync.rejected, (state) => {
                state.loading = false;
                state.isSyncing = false;
            })
            // fetchAndSetRemovedItemsAsync — opens cart modal with enriched product data
            .addCase(fetchAndSetRemovedItemsAsync.fulfilled, (state, action) => {
                if (action.payload && action.payload.length > 0) {
                    state.removedItems = action.payload;
                    state.isCartModalOpen = true;
                }
            });
    }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setPromoCode, setCashback, setUseBonuses, setTotal, setCartModalOpen, saveProductDetails, clearRemovedItems } = cartSlice.actions;
export default cartSlice.reducer;
