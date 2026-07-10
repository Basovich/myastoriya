import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useParams } from 'next/navigation';
import { getProductsByIdsApi, resolveProductImageUrl, type Product, getCategoryByIdApi, type ProductCategory } from '@/lib/graphql/queries/products';
import { getSpecialsApi } from '@/lib/graphql/queries/pages/home/specials';
import { MOCK_PRODUCTS, FALLBACK_PRODUCT } from '@/app/components/CartModal/products_mock';

// Module-level cache з TTL для синхронізації між CartModal, CartSummary тощо.
// Записи автоматично стають застарілими після CACHE_TTL_MS мілісекунд,
// що запобігає відображенню невірних цін після зміни акцій на бекенді.
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 хвилин

interface CacheEntry {
    product: Product | null;
    timestamp: number;
}

const globalProductCache: Record<string, CacheEntry> = {};
const pendingRequests = new Set<number>();

function getCachedProduct(id: string): Product | null | undefined {
    const entry = globalProductCache[id];
    if (entry === undefined) return undefined; // не в кеші — треба завантажити
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        // Запис застарів — видаляємо, щоб при наступній нагоді перезавантажити
        delete globalProductCache[id];
        return undefined;
    }
    return entry.product;
}

function setCachedProduct(id: string, product: Product | null): void {
    globalProductCache[id] = { product, timestamp: Date.now() };
}

interface SpecialProduct {
    id: string | number;
    purchaseCost?: number | null;
    oldCost?: number | null;
    cost?: number | null;
}
interface Special {
    id: string;
    cost?: number | null;
    products?: SpecialProduct[] | null;
}

let globalSpecialsCache: Special[] | null = null;
let pendingSpecialsRequest: Promise<void> | null = null;

const globalCategoryCache: Record<number, ProductCategory | null> = {};
const pendingCategoryRequests = new Set<number>();

const listeners = new Set<() => void>();
function emitCacheUpdate() {
    listeners.forEach(l => l());
}

export interface PopulatedCartItemModifier {
    id: number;
    name?: string | null;
    price?: number | null;
    image?: string | null;
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
        originalPrice: number;
        image: string;
        slug?: string;
        costVariantName?: string | null;
        categoryId?: number;
        modifiers?: PopulatedCartItemModifier[] | null;
    };
}

function roundWeightString(val: string): string {
    if (!val) return '';
    const trimmed = val.trim();
    
    // 1. Try to match a pure number (e.g. "1441.399" or "1,53")
    if (/^\d+([.,]\d+)?$/.test(trimmed)) {
        const num = parseFloat(trimmed.replace(',', '.'));
        if (!isNaN(num)) {
            if (num >= 10) {
                return String(Math.round(num));
            } else {
                return String(Math.round(num * 100) / 100);
            }
        }
    }
    
    // 2. Try to match a number with a trailing unit (e.g. "1441.399 г" or "1.5339 кг" or "0.75 л")
    const match = trimmed.match(/^(\d+([.,]\d+)?)\s*(л|l|мл|ml|г|g|кг|kg|шт)(?![а-яА-Яa-zA-Z0-9])/i);
    if (match) {
        const numPart = match[1];
        const unitPart = match[3];
        const num = parseFloat(numPart.replace(',', '.'));
        if (!isNaN(num)) {
            let roundedNumStr: string;
            if (num >= 10) {
                roundedNumStr = String(Math.round(num));
            } else {
                roundedNumStr = String(Math.round(num * 100) / 100);
            }
            const originalSpacing = trimmed.substring(numPart.length, trimmed.indexOf(unitPart));
            return `${roundedNumStr}${originalSpacing}${unitPart}`;
        }
    }
    
    return val;
}

export function useCartProducts() {
    const cartItems = useAppSelector(state => state.cart.items);
    const { isInitialized } = useAppSelector(state => state.auth);
    const [cacheVersion, setCacheVersion] = useState(0);
    const params = useParams();
    const lang = (params?.lang as string) || 'ua';

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
                    globalSpecialsCache = data as Special[];
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

        // Негайно позначаємо нечислові ID як null у кеші, щоб не блокувати завантаження
        let cacheChanged = false;
        cartItems.forEach(item => {
            if (isNaN(Number(item.id)) && getCachedProduct(item.id) === undefined) {
                setCachedProduct(item.id, null);
                cacheChanged = true;
            }
        });
        if (cacheChanged) {
            emitCacheUpdate();
        }

        // Фільтруємо ID, яких немає в кеші АБО кеш яких застарів (TTL вичерпано)
        const missingIds = cartItems
            .map(item => Number(item.id))
            .filter(id => !isNaN(id) && getCachedProduct(String(id)) === undefined && !pendingRequests.has(id));

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
                    setCachedProduct(idStr, found || null);
                });

                // Trigger re-render to reflect the newly populated cache.
                emitCacheUpdate();
            })
            .catch(err => {
                console.error('[useCartProducts] Failed to fetch product details:', err);
                missingIds.forEach(id => {
                    pendingRequests.delete(id);
                    // При помилці API — зберігаємо null з коротшим TTL (1 хв),
                    // щоб не блокувати повторний запит нескінченно.
                    // Перезаписуємо timestamp як застарілий через 1 хв.
                    globalProductCache[String(id)] = { product: null, timestamp: Date.now() - CACHE_TTL_MS + 60_000 };
                });
                emitCacheUpdate();
            });
    }, [cartItems, isInitialized]);

    useEffect(() => {
        if (!isInitialized) return;
        if (cartItems.length === 0) return;

        const categoryIds = cartItems
            .map(item => {
                const dbProduct = getCachedProduct(item.id);
                return dbProduct?.categoryId ? Number(dbProduct.categoryId) : 0;
            })
            .filter((id): id is number => id > 0 && globalCategoryCache[id] === undefined && !pendingCategoryRequests.has(id));

        if (categoryIds.length === 0) return;

        categoryIds.forEach(id => pendingCategoryRequests.add(id));

        Promise.allSettled(categoryIds.map(id => getCategoryByIdApi(id, lang)))
            .then(results => {
                categoryIds.forEach(id => pendingCategoryRequests.delete(id));
                results.forEach((res, index) => {
                    const catId = categoryIds[index];
                    if (res.status === 'fulfilled') {
                        globalCategoryCache[catId] = res.value;
                    } else {
                        globalCategoryCache[catId] = null;
                    }
                });
                emitCacheUpdate();
            })
            .catch(err => {
                console.error('[useCartProducts] Failed to fetch category bundles:', err);
                categoryIds.forEach(id => pendingCategoryRequests.delete(id));
            });
    }, [cartItems, isInitialized, cacheVersion, lang]);

    const populatedItems = useMemo(() => {
        // Reference cacheVersion to re-evaluate when cache updates
        void cacheVersion;

        const baseItems = cartItems.map(item => {
            const dbProduct = getCachedProduct(item.id);
            if (dbProduct) {
                // 1. Try to extract weight/volume from name
                let rawWeight = '';
                const nameMatch = dbProduct.name.match(/(\d+([.,]\d+)?)\s*(л|l|мл|ml|г|g|кг|kg)(?![а-яА-Яa-zA-Z0-9])/i);
                if (nameMatch) {
                    rawWeight = nameMatch[0];
                }

                // 2. Try specifications
                if (!rawWeight) {
                    let weightSpec = dbProduct.specifications?.find(s => {
                        const name = s.name.toLowerCase();
                        const hasWeightKeyword = name.includes("вага") || name.includes("важ") || name.includes("вес") || name.includes("об'єм");
                        if (!hasWeightKeyword) return false;
                        const val = s.values[0] || '';
                        return !(val === '1' && (name === 'вага' || name === 'вес'));
                    });
                    if (!weightSpec) {
                        weightSpec = dbProduct.specifications?.find(s => {
                            const name = s.name.toLowerCase();
                            return name.includes("вага") || name.includes("важ") || name.includes("вес") || name.includes("об'єм");
                        });
                    }
                    rawWeight = weightSpec && weightSpec.values.length > 0 ? weightSpec.values[0] : '';
                }

                // 3. Try portionSize
                if (!rawWeight) {
                    if (dbProduct.portionSize) {
                        const hasUnit = /[гgкmшт]/i.test(dbProduct.portionSize);
                        if (hasUnit) rawWeight = dbProduct.portionSize;
                    }
                }

                let weight = rawWeight;
                if (rawWeight) {
                    // Check if rawWeight already contains units
                    const cleanVal = rawWeight.replace(/[0-9.,\s-]/g, '');
                    if (cleanVal.length === 0) {
                        const titleLower = dbProduct.name.toLowerCase();
                        const unitLower = dbProduct.unit?.toLowerCase().trim() || '';
                        const num = parseFloat(rawWeight.replace(',', '.'));
                        
                        if (!isNaN(num) && num === 1) {
                            if (unitLower === 'шт') {
                                weight = '1 шт';
                            } else if (unitLower === 'уп') {
                                weight = '1 уп';
                            } else if (unitLower === 'кг' || unitLower === 'kg') {
                                weight = '1 кг';
                            } else if (unitLower === 'г' || unitLower === 'g') {
                                weight = '1 г';
                            } else if (unitLower === 'мл' || unitLower === 'ml') {
                                weight = '1 мл';
                            } else if (unitLower === 'л' || unitLower === 'l') {
                                weight = '1 л';
                            } else {
                                weight = '1 шт';
                            }
                        } else {
                            if (unitLower === 'шт') {
                                const isLiquid = /вино|пиво|сік|сок|вод|кола|нектар|напій|напиток|лимонад|сидр|wine|beer|juice|beverage/i.test(titleLower);
                                weight = `${rawWeight} ${isLiquid ? 'мл' : 'г'}`;
                            } else if (unitLower === 'уп') {
                                weight = `${rawWeight} уп`;
                            } else if (unitLower === 'кг' || unitLower === 'kg') {
                                weight = `${rawWeight} кг`;
                            } else if (unitLower === 'г' || unitLower === 'g') {
                                weight = `${rawWeight} г`;
                            } else if (unitLower === 'мл' || unitLower === 'ml') {
                                weight = `${rawWeight} мл`;
                            } else if (unitLower === 'л' || unitLower === 'l') {
                                weight = `${rawWeight} л`;
                            } else {
                                const isLiquid = unitLower.includes('мл') || unitLower.includes('ml') ||
                                    /вино|пиво|сік|сок|вод|кола|нектар|напій|напиток|лимонад|сидр|wine|beer|juice|beverage/i.test(titleLower);
                                weight = `${rawWeight} ${isLiquid ? 'мл' : 'г'}`;
                            }
                        }
                    }
                } else {
                    if (dbProduct.multiplier && dbProduct.multiplier > 0) {
                        const normalizedUnit = dbProduct.unit?.trim().toLowerCase() || '';
                        if (normalizedUnit === '100 г' || normalizedUnit === '100г') {
                            weight = `${Math.round(dbProduct.multiplier * 1000)} г`;
                        } else if (normalizedUnit === '100 мл') {
                            weight = `${Math.round(dbProduct.multiplier * 1000)} мл`;
                        } else if (normalizedUnit === 'шт') {
                            weight = `${dbProduct.multiplier} шт`;
                        } else {
                            weight = `${dbProduct.multiplier} ${dbProduct.unit}`;
                        }
                    } else if (dbProduct.unit && dbProduct.unit.toLowerCase() !== 'шт') {
                        weight = dbProduct.unit;
                    } else {
                        weight = '';
                    }
                }

                weight = roundWeightString(weight);

                // Use purchaseCost from the cart API as the base price (true retail price, e.g. 127 ₴).
                // dbProduct.cost (98 ₴) is the catalog promotional price which is already discounted.
                // When a bundle is active, absolutePriceMap will override this with the bundle price (88 ₴).
                // When a bundle is broken, the item correctly reverts to its full retail price (127 ₴).
                const modifiersPrice = item.modifiers?.reduce((sum, m) => sum + (m.price || 0), 0) || 0;
                
                // Determine if there is a catalog discount on the product.
                const hasCatalogDiscount = !!(dbProduct.purchaseOldCost || dbProduct.oldCost);
                
                // If the product is discounted in the catalog, prioritize the catalog promo price (dbProduct.purchaseCost).
                // Otherwise, fall back to the cart API price (item.purchaseCost) or catalog default cost.
                const basePrice = hasCatalogDiscount 
                    ? (dbProduct.purchaseCost ?? item.purchaseCost ?? dbProduct.cost) 
                    : (item.purchaseCost ?? dbProduct.purchaseCost ?? dbProduct.cost);
                
                const initialPrice = basePrice + modifiersPrice;
                const originalPrice = (dbProduct.purchaseOldCost ?? item.purchaseCost ?? dbProduct.oldCost ?? basePrice) + modifiersPrice;

                const modifiersWithImages = item.modifiers?.map(m => {
                    let modifierImage: string | null = null;
                    if (dbProduct.modifierGroups) {
                        for (const group of dbProduct.modifierGroups) {
                            const found = group.modifiers?.find(mod => Number(mod.id) === m.id);
                            if (found && found.image) {
                                const rawUrl = found.image.icon3x || found.image.icon2x || found.image.icon1x;
                                if (rawUrl) {
                                    modifierImage = rawUrl.startsWith('/') 
                                        ? `https://dev-api.myastoriya.com.ua${rawUrl}` 
                                        : rawUrl;
                                }
                            }
                        }
                    }
                    return {
                        id: m.id,
                        name: m.name,
                        price: m.price,
                        image: modifierImage
                    };
                }) || null;

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
                        image: resolveProductImageUrl(dbProduct) || "/images/product-placeholder.svg",
                        slug: dbProduct.slug || dbProduct.id,
                        costVariantName: item.costVariantName,
                        categoryId: dbProduct.categoryId ? Number(dbProduct.categoryId) : undefined,
                        modifiers: modifiersWithImages,
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

        const absolutePriceMap = new Map<string, number>();

        // --- 1. SPECIALS DISCOUNTS ---
        if (globalSpecialsCache && globalSpecialsCache.length > 0) {
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
                const totalPrice = specialProducts.reduce((sum: number, p: SpecialProduct) => sum + (p.purchaseCost || p.oldCost || p.cost || 0), 0);
                const specialCost = special.cost || 0;
                if (totalPrice <= 0 || specialCost <= 0 || specialCost >= totalPrice) continue;

                // Distribute the bundle total price proportionally across products
                const factor = specialCost / totalPrice;
                let sumDiscounted = 0;
                specialProducts.forEach((spProduct: SpecialProduct, index: number) => {
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
                    absolutePriceMap.set(pid, discPrice);
                });
            }
        }

        // --- 2. CATEGORY BUNDLE DISCOUNTS ---
        for (const catIdStr of Object.keys(globalCategoryCache)) {
            const category = globalCategoryCache[Number(catIdStr)];
            if (!category) continue;

            const bundles = category.bundles || [];
            for (const bundle of bundles) {
                const discountAmount = bundle.discountAmount || 0;
                const discountType = bundle.discountType || 'percent';
                const bundleItems = bundle.items || [];
                if (bundleItems.length < 2) continue;

                // Check if every bundle item is currently in the cart
                const freshQty = new Map<string, number>();
                baseItems.forEach(item => {
                    freshQty.set(item.id, (freshQty.get(item.id) || 0) + item.quantity);
                });

                let times = Infinity;
                for (const bItem of bundleItems) {
                    const product = bItem.product;
                    if (!product) { times = 0; break; }
                    const qty = freshQty.get(String(product.id)) || 0;
                    if (qty === 0) { times = 0; break; }
                    times = Math.min(times, qty);
                }
                // If the bundle is not fully present in the cart, skip — no discount
                if (times <= 0 || times === Infinity) continue;

                // Apply the discount to each item of the bundle in the absolutePriceMap
                for (const bItem of bundleItems) {
                    const product = bItem.product;
                    if (!product) continue;

                    const pid = String(product.id);
                    // Find the corresponding cart item to get its actual price in the cart
                    const cartItem = baseItems.find(item => item.id === pid);
                    if (!cartItem) continue;

                    const origPrice = cartItem.product.originalPrice || cartItem.product.price || 0;
                    let discountedPrice = origPrice;

                    if (discountType === 'percent') {
                        discountedPrice = Math.round(origPrice * (1 - discountAmount / 100));
                    } else if (discountType === 'amount') {
                        discountedPrice = Math.max(0, origPrice - discountAmount);
                    }

                    const existingPrice = absolutePriceMap.get(pid);
                    if (existingPrice === undefined || discountedPrice < existingPrice) {
                        absolutePriceMap.set(pid, discountedPrice);
                    }
                }
            }
        }

        // Apply absolute bundle prices to items in a complete bundle
        baseItems.forEach(item => {
            const bundlePrice = absolutePriceMap.get(item.id);
            if (bundlePrice !== undefined && bundlePrice > 0) {
                item.product.price = bundlePrice;
            }
        });

        return baseItems;
    }, [cartItems, cacheVersion]);

    const cartLoading = useAppSelector(state => state.cart.loading);
    void cartLoading; // used only to invalidate memoization during active operations

    const someItemUndefined = cartItems.some(item => {
        return getCachedProduct(item.id) === undefined;
    });

    const someCategoryUndefined = cartItems.some(item => {
        const dbProduct = getCachedProduct(item.id);
        if (!dbProduct || !dbProduct.categoryId) return false;
        const catId = Number(dbProduct.categoryId);
        return catId > 0 && globalCategoryCache[catId] === undefined;
    });

    const hookLoading = !isInitialized
        || globalSpecialsCache === null
        || someItemUndefined
        || someCategoryUndefined;

    const suggestedProducts = useMemo(() => {
        if (hookLoading) return [];

        const uniqueBundleProducts = new Map<string, {
            id: string;
            title: string;
            price: number;
            originalPrice: number;
            image: string;
            slug?: string;
        }>();

        const inCartIds = new Set(cartItems.map(item => String(item.id)));

        for (const catIdStr of Object.keys(globalCategoryCache)) {
            const category = globalCategoryCache[Number(catIdStr)];
            if (!category) continue;

            const bundles = category.bundles || [];
            for (const bundle of bundles) {
                const discountAmount = bundle.discountAmount || 0;
                const discountType = bundle.discountType || 'percent';
                const bundleItems = bundle.items || [];

                for (const bItem of bundleItems) {
                    const product = bItem.product;
                    if (!product) continue;

                    const pid = String(product.id);
                    // Skip products already in the cart
                    if (inCartIds.has(pid)) continue;

                    const origCost = product.cost || 0;
                    let discountedPrice = origCost;

                    if (discountType === 'percent') {
                        discountedPrice = Math.round(origCost * (1 - discountAmount / 100));
                    } else if (discountType === 'amount') {
                        discountedPrice = Math.max(0, origCost - discountAmount);
                    }

                    const imageSrc = resolveProductImageUrl(product as Product) || "/images/product-placeholder.svg";

                    uniqueBundleProducts.set(pid, {
                        id: pid,
                        title: product.name,
                        price: discountedPrice,
                        originalPrice: origCost,
                        image: imageSrc,
                        slug: product.slug || undefined
                    });
                }
            }
        }

        return Array.from(uniqueBundleProducts.values());
    }, [cartItems, cacheVersion, hookLoading]); // eslint-disable-line react-hooks/exhaustive-deps -- cacheVersion є тригером для ре-мемоізації при оновленні module-level globalCategoryCache (ESLint не відстежує зовнішні змінні)

    return {
        populatedItems,
        suggestedProducts,
        loading: hookLoading
    };
}
