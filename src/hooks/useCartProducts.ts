import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { getProductsByIdsApi, resolveProductImageUrl, type Product } from '@/lib/graphql/queries/products';
import { MOCK_PRODUCTS, FALLBACK_PRODUCT } from '@/app/components/CartModal/products_mock';

// Module-level cache to share fetched products across CartModal, CartSummary, etc.
// Use Product | null so we can cache failed/missing lookups as null and avoid refetching.
const globalProductCache: Record<string, Product | null> = {};
const pendingRequests = new Set<number>();

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
    };
}

export function useCartProducts() {
    const cartItems = useAppSelector(state => state.cart.items);
    const [cacheVersion, setCacheVersion] = useState(0);

    useEffect(() => {
        if (cartItems.length === 0) return;

        const missingIds = cartItems
            .map(item => Number(item.id))
            .filter(id => !isNaN(id) && globalProductCache[String(id)] === undefined && !pendingRequests.has(id));

        if (missingIds.length === 0) return;

        // Mark as pending
        missingIds.forEach(id => pendingRequests.add(id));

        let isMounted = true;
        getProductsByIdsApi(missingIds)
            .then(fetchedProducts => {
                // Remove from pending
                missingIds.forEach(id => pendingRequests.delete(id));

                if (!isMounted) return;

                const fetchedMap = new Map((fetchedProducts || []).map(p => [String(p.id), p]));

                // For every missing ID, store the fetched product or null if not returned
                missingIds.forEach(id => {
                    const idStr = String(id);
                    const prod = fetchedMap.get(idStr);
                    globalProductCache[idStr] = prod || null;
                });

                // Trigger re-render to compute populated items with new cache values
                setCacheVersion(prev => prev + 1);
            })
            .catch(err => {
                // Remove from pending so we can retry on next explicit dependency change if needed
                missingIds.forEach(id => pendingRequests.delete(id));
                console.error('[useCartProducts] Failed to fetch product details:', err);
            });

        return () => {
            isMounted = false;
        };
    }, [cartItems]);

    const populatedItems = useMemo(() => {
        // Reference cacheVersion to re-evaluate when cache updates
        void cacheVersion;

        return cartItems.map(item => {
            const dbProduct = globalProductCache[item.id];
            if (dbProduct) {
                const weightSpec = dbProduct.specifications?.find(s => 
                    s.name.toLowerCase().includes("вага") || 
                    s.name.toLowerCase().includes("об'єм")
                );
                const weight = weightSpec && weightSpec.values.length > 0
                    ? weightSpec.values[0]
                    : (dbProduct.multiplier ? `${dbProduct.multiplier} ${dbProduct.unit}` : dbProduct.unit);

                return {
                    id: item.id,
                    rowId: item.rowId,
                    quantity: item.quantity,
                    product: {
                        id: dbProduct.id,
                        title: dbProduct.name,
                        weight: weight,
                        price: dbProduct.cost,
                        image: resolveProductImageUrl(dbProduct) || "/images/cat-branded.png",
                        slug: dbProduct.slug || dbProduct.id
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
                    slug: mockProduct.id
                }
            };
        });
    }, [cartItems, cacheVersion]);

    return {
        populatedItems,
        loading: cartItems.some(item => globalProductCache[item.id] === undefined)
    };
}
