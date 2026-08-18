"use client";

import { useState } from 'react';
import type { Locale } from '@/i18n/config';
import type { Product } from '@/lib/graphql';
import { getPopularProductsApi, resolveProductImageUrl, getProductWeight, getProductBadge } from '@/lib/graphql';
import ProductCard from '@/app/components/ui/ProductCard/ProductCard';
import CatalogRelatedSlidersClient from '../CatalogRelatedSlidersClient';

interface CatalogPopularSliderClientProps {
    title: string;
    initialProducts: Product[];
    lang: Locale;
}

export default function CatalogPopularSliderClient({
    title,
    initialProducts,
    lang,
}: CatalogPopularSliderClientProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [limit, setLimit] = useState(12);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialProducts.length >= 12);

    const handleLoadMore = async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        const nextLimit = limit + 12;
        try {
            const res = await getPopularProductsApi(undefined, nextLimit, lang);
            if (res.length <= products.length) {
                setHasMore(false);
            } else {
                setProducts(res);
                setLimit(nextLimit);
                if (res.length < nextLimit) {
                    setHasMore(false);
                }
            }
        } catch (error) {
            console.error('Failed to load more popular products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const slidesData = products.map((product) => ({
        id: product.id,
        element: (
            <ProductCard
                key={product.id}
                id={product.id}
                slug={product.slug}
                categoryId={product.categoryId}
                title={product.name}
                weight={getProductWeight(product)}
                price={product.cost}
                purchaseCost={product.purchaseCost}
                purchaseOldCost={product.purchaseOldCost}
                unit={product.unit}
                badge={getProductBadge(product, lang)}
                image={resolveProductImageUrl(product)}
                lang={lang}
                hasCostVariants={product.hasCostVariants}
                portionSize={product.portionSize}
            />
        ),
    }));

    return (
        <CatalogRelatedSlidersClient
            title={title}
            products={slidesData}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            isLoading={isLoading}
        />
    );
}
