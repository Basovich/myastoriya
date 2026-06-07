import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { getProductsByIdsApi, resolveProductImageUrl, type Product } from '@/lib/graphql/queries/products';
import { getSpecialsApi } from '@/lib/graphql/queries/pages/home/specials';
import { MOCK_PRODUCTS, FALLBACK_PRODUCT } from '@/app/components/CartModal/products_mock';

// Module-level cache to share fetched products across CartModal, CartSummary, etc.
// Use Product | null so we can cache failed/missing lookups as null and avoid refetching.
const globalProductCache: Record<string, Product | null> = {};
const pendingRequests = new Set<number>();

let globalSpecialsCache: any[] | null = null;
let pendingSpecialsRequest: Promise<any> | null = null;

const listeners = new Set<() => void>();
function emitCacheUpdate() {
    listeners.forEach(l => l());
}

export interface PopulatedCartItem {
    id: string;
    rowId?: string;
    quantity: number;
    product: {
        id: string;
        title: string;
        weight: string;
        price: number;
        image: string;
        slug?: string;
        costVariantName?: string | null;
    };
}

export function useCartProducts() {
    const cartItems = useAppSelector(state => state.cart.items);
    const { isInitialized } = useAppSelector(state => state.auth);
    const [cacheVersion, setCacheVersion] = useState(0);

    useEffect(() => {
        const listener = () => {
            setCacheVersion(prev => prev + 1);
        };
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }, []);

    useEffect(() => {
        if (!isInitialized) return;
        if (globalSpecialsCache === null && !pendingSpecialsRequest) {
            pendingSpecialsRequest = getSpecialsApi(100, 1)
                .then(resp => {
                    const data = resp?.data || [];
                    globalSpecialsCache = data;
                    emitCacheUpdate();
                })
                .catch(err => {
                    console.error('[useCartProducts] Failed to fetch specials:', err);
                    globalSpecialsCache = [];
                    emitCacheUpdate();
                });
        }
    }, [isInitialized]);

    useEffect(() => {
        if (!isInitialized) return;
        if (cartItems.length === 0) {
            return;
        }

        // Immediately mark non-numeric IDs as null in the cache so they don't block loading
        let cacheChanged = false;
        cartItems.forEach(item => {
            if (isNaN(Number(item.id)) && globalProductCache[item.id] === undefined) {
                globalProductCache[item.id] = null;
                cacheChanged = true;
            }
        });
        if (cacheChanged) {
            emitCacheUpdate();
        }

        const missingIds = cartItems
            .map(item => Number(item.id))
            .filter(id => !isNaN(id) && globalProductCache[String(id)] === undefined && !pendingRequests.has(id));

        if (missingIds.length === 0) {
            return;
        }

        // Mark as pending
        missingIds.forEach(id => pendingRequests.add(id));

        getProductsByIdsApi(missingIds)
            .then(fetchedProducts => {
                missingIds.forEach(id => pendingRequests.delete(id));

                const fetchedMap = new Map((fetchedProducts || []).map(p => [String(p.id), p]));

                // Always update the module-level cache, even if the effect re-ran.
                // pendingRequests already prevents duplicate in-flight calls.
                missingIds.forEach(id => {
                    const idStr = String(id);
                    const found = fetchedMap.get(idStr);
                    if (!found) {
                        console.warn(`[useCartProducts] Product ID ${idStr} not found in API response.`);
                    }
                    globalProductCache[idStr] = found || null;
                });

                // Trigger re-render to reflect the newly populated cache.
                emitCacheUpdate();
            })
            .catch(err => {
                console.error('[useCartProducts] Failed to fetch product details:', err);
                missingIds.forEach(id => {
                    pendingRequests.delete(id);
                    // Prevent infinite refetch loop on API failure by setting to null
                    globalProductCache[String(id)] = null;
                });
                emitCacheUpdate();
            });
    }, [cartItems, isInitialized]);

    const populatedItems = useMemo(() => {
        // Reference cacheVersion to re-evaluate when cache updates
        void cacheVersion;

        const baseItems = cartItems.map(item => {
            const dbProduct = globalProductCache[item.id];
            if (dbProduct) {
                const weightSpec = dbProduct.specifications?.find(s => 
                    s.name.toLowerCase().includes("вага") || 
                    s.name.toLowerCase().includes("об'єм")
                );
                const weight = weightSpec && weightSpec.values.length > 0
                    ? weightSpec.values[0]
                    : (dbProduct.multiplier ? `${dbProduct.multiplier} ${dbProduct.unit}` : dbProduct.unit);

                // Use purchaseCost from the cart API as the base price (true retail price, e.g. 127 ₴).
                // dbProduct.cost (98 ₴) is the catalog promotional price which is already discounted.
                // When a bundle is active, absolutePriceMap will override this with the bundle price (88 ₴).
                // When a bundle is broken, the item correctly reverts to its full retail price (127 ₴).
                const initialPrice = item.purchaseCost ?? dbProduct.cost;
                const originalPrice = item.purchaseCost ?? dbProduct.oldCost ?? initialPrice;
                return {
                    id: item.id,
                    rowId: item.rowId,
                    quantity: item.quantity,
                    product: {
                        id: dbProduct.id,
                        title: dbProduct.name,
                        weight: weight,
                        price: initialPrice,
                        originalPrice: originalPrice,
                        image: resolveProductImageUrl(dbProduct) || "/images/cat-branded.png",
                        slug: dbProduct.slug || dbProduct.id,
                        costVariantName: item.costVariantName
                    }
                };
            }

            // Fallback to mock dictionary
            const mockProduct = MOCK_PRODUCTS[item.id] || FALLBACK_PRODUCT;
            return {
                id: item.id,
                rowId: item.rowId,
                quantity: item.quantity,
                product: {
                    ...mockProduct,
                    originalPrice: mockProduct.price,
                    slug: mockProduct.id,
                    costVariantName: item.costVariantName || null
                }
            };
        });

        if (globalSpecialsCache && globalSpecialsCache.length > 0) {
            // Build a map of pid → absolute discounted bundle price.
            // We check freshly whether ALL items of a bundle are present in the cart.
            // If they are, the bundle price overrides the catalog price.
            // If not (e.g. one item removed), no override happens and catalog price is kept.
            const absolutePriceMap = new Map<string, number>();

            for (const special of globalSpecialsCache) {
                const specialProducts = special.products || [];
                if (specialProducts.length < 2) continue;

                // Check if every bundle item is currently in the cart
                const freshQty = new Map<string, number>();
                baseItems.forEach(item => {
                    freshQty.set(item.id, (freshQty.get(item.id) || 0) + item.quantity);
                });
                let times = Infinity;
                for (const spProduct of specialProducts) {
                    const qty = freshQty.get(String(spProduct.id)) || 0;
                    if (qty === 0) { times = 0; break; }
                    times = Math.min(times, qty);
                }
                // If the bundle is not fully present in the cart, skip — no discount
                if (times <= 0 || times === Infinity) continue;

                // Use purchaseCost (true retail price) as the base for proportional discount distribution.
                // Falling back to oldCost then cost prevents wrong results when purchaseCost is unavailable.
                const totalPrice = specialProducts.reduce((sum: number, p: any) => sum + (p.purchaseCost || p.oldCost || p.cost || 0), 0);
                const specialCost = special.cost || 0;
                if (totalPrice <= 0 || specialCost <= 0 || specialCost >= totalPrice) continue;

                // Distribute the bundle total price proportionally across products
                const factor = specialCost / totalPrice;
                let sumDiscounted = 0;
                specialProducts.forEach((spProduct: any, index: number) => {
                    const pid = String(spProduct.id);
                    const origPrice = spProduct.purchaseCost || spProduct.oldCost || spProduct.cost || 0;
                    let discPrice: number;
                    if (index === specialProducts.length - 1) {
                        // Last item takes the remainder to ensure the total is exact
                        discPrice = specialCost - sumDiscounted;
                    } else {
                        discPrice = Math.round(origPrice * factor);
                        sumDiscounted += discPrice;
                    }
                    // Absolute bundle price overrides the catalog price only when bundle is complete
                    absolutePriceMap.set(pid, discPrice);
                });
            }

            // Apply absolute bundle prices to items in a complete bundle
            baseItems.forEach(item => {
                const bundlePrice = absolutePriceMap.get(item.id);
                if (bundlePrice !== undefined && bundlePrice > 0) {
                    item.product.price = bundlePrice;
                }
            });
        }

        return baseItems;
    }, [cartItems, cacheVersion]);

    const cartLoading = useAppSelector(state => state.cart.loading);
    void cartLoading; // used only to invalidate memoization during active operations

    const someItemUndefined = cartItems.some(item => {
        return globalProductCache[item.id] === undefined;
    });


    return {
        populatedItems,
        // Show spinner until:
        // 1. Auth is ready (isInitialized)
        // 2. Specials are loaded — prevents the 562→478 price flicker on bundle items
        // 3. All cart item product details are in cache
        // We intentionally do NOT include cartLoading here — add/remove/update
        // operations are reflected optimistically in state.items (via pending reducer),
        // and cartLoading is now blacklisted from localStorage to avoid eternal spinners.
        loading: !isInitialized
            || globalSpecialsCache === null
            || someItemUndefined
    };
}
