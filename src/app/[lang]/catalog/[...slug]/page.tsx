import { notFound, redirect } from 'next/navigation';
import { getDictionary } from '@/i18n/get-dictionary';
import { Locale } from '@/i18n/config';
import CatalogContent from '@/app/pages/Catalog/CatalogContent';
import ProductClient from '@/app/pages/Product/ProductClient';
import {
    getCatalogTreeApi,
    getProductsApi,
    getPopularProductsApi,
    getCategoryByIdApi,
    getFaqQuestionsApi,
    getProductByIdApi,
    findProductIdBySlug,
    getBlogsApi,
    getSpecialsByProductApi,
    getBoughtTogetherProductsApi,
    getDeliveryBlocksApi,
    resolveCategoryImageUrl,
    ProductCategory,
    Product,
    BlogPost,
    OrderingInfoBlock,
    ProductsResponse
} from '@/lib/graphql';
import { buildCategoryIndex, buildCategoryBreadcrumbs, getCategoryHref, shouldRedirectForLocality } from '@/utils/category-url';
import { parseFilterParams } from '@/utils/filter-params';
import { getAccessToken } from '@/app/actions/authActions';

interface DynamicCatalogPageProps {
    params: Promise<{ lang: string; slug: string[] }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Safe API call wrapper with retries and fallback
 */
async function safeCall<T>(
    fn: () => Promise<T>,
    fallback: T,
    retries = 2,
): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            if (attempt < retries) {
                const delay = 1000 * (attempt + 1);
                console.warn(
                    `[DynamicCatalogPage] API error (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms...`,
                    err instanceof Error ? err.message : err,
                );
                await new Promise((r) => setTimeout(r, delay));
            } else {
                console.error(
                    `[DynamicCatalogPage] Non-critical API error after ${retries + 1} attempts — using fallback:`,
                    err instanceof Error ? err.message : err,
                );
                try {
                    const Sentry = await import('@sentry/nextjs');
                    Sentry.captureException(err, {
                        tags: { component: 'DynamicCatalogPage', type: 'safeCall_exhausted' },
                    });
                } catch {
                    // Ignore Sentry errors
                }
            }
        }
    }
    return fallback;
}

export default async function DynamicCatalogPage({ params, searchParams }: DynamicCatalogPageProps) {
    const { lang, slug } = await params;
    const resolvedSearchParams = await searchParams;
    const dict = await getDictionary(lang as Locale);
    const token = await getAccessToken();

    if (!slug || slug.length === 0) {
        notFound();
    }

    const lastSegment = slug[slug.length - 1];

    // 1. Fetch current catalog tree (locality-aware)
    const catalogTree = await getCatalogTreeApi(lang, 768, token ?? undefined).catch(() => [] as ProductCategory[]);
    const categoryIndex = buildCategoryIndex(catalogTree);

    // 2. Check if the last segment is a category in the current locality tree
    const categoryEntry = Array.from(categoryIndex.values()).find(
        e => e.node.slug === lastSegment
    );

    if (categoryEntry) {
        // Validate canonical category URL path
        const canonicalHref = getCategoryHref(
            categoryEntry.node,
            categoryEntry.parent,
            categoryEntry.grandParent
        );
        const currentPath = `/catalog/${slug.join('/')}`;
        if (currentPath !== canonicalHref) {
            notFound();
        }

        // --- RENDER CATEGORY PAGE ---
        const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page as string) : 1;
        const view = (resolvedSearchParams.view as 'list' | 'grid') || 'grid';
        const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined;
        const activeFilters = parseFilterParams(resolvedSearchParams as Record<string, string | string[] | undefined>);

        const categoryId = parseInt(categoryEntry.node.id);

        const [productsResponse, popularProducts, categoryDetails] = await Promise.all([
            getProductsApi(
                { categoryId, limit: 12, page, sort, filter: activeFilters },
                lang,
                token ?? undefined,
            ).catch((err) => {
                console.error("[DynamicCatalogPage] Failed to fetch category products:", err);
                return {
                    data: [],
                    per_page: 12,
                    current_page: page,
                    has_more_pages: false,
                } as ProductsResponse;
            }),
            getPopularProductsApi(undefined, 12, lang, token ?? undefined).catch(() => [] as Product[]),
            getCategoryByIdApi(categoryId, lang, token ?? undefined).catch(() => null),
        ]);
        productsResponse.current_page = page;

        const hasActiveFilters = activeFilters.length > 0 || !!sort;
        if (shouldRedirectForLocality(productsResponse.data.length, page, hasActiveFilters)) {
            const langPrefix = lang === 'ua' ? '' : `/${lang}`;
            
            let redirectUrl = `${langPrefix}/catalog`;
            if (categoryEntry.parent) {
                const parentEntry = categoryIndex.get(String(categoryEntry.parent.id));
                if (parentEntry) {
                    const parentHref = getCategoryHref(
                        parentEntry.node,
                        parentEntry.parent,
                        parentEntry.grandParent
                    );
                    redirectUrl = `${langPrefix}${parentHref}`;
                }
            }
            
            redirect(redirectUrl);
        }

        let faq = null;
        if (categoryDetails?.faqGroups && categoryDetails.faqGroups.length > 0) {
            const firstGroupId = parseInt(categoryDetails.faqGroups[0].id);
            faq = await getFaqQuestionsApi(firstGroupId, lang).catch(() => null);
        }

        const breadcrumbItems = buildCategoryBreadcrumbs(categoryEntry.node.id, categoryIndex);
        if (breadcrumbItems.length > 1) {
            const lastBreadcrumb = breadcrumbItems[breadcrumbItems.length - 1];
            breadcrumbItems[breadcrumbItems.length - 1] = { label: lastBreadcrumb.label };
        }

        const subcategoryItems = (categoryEntry.node.children ?? []).map(sub => ({
            name: sub.name,
            image: resolveCategoryImageUrl(sub) || '/icons/icon-category.svg',
            href: getCategoryHref(sub, categoryEntry.node, categoryEntry.parent),
        }));

        return (
            <main>
                <CatalogContent
                    lang={lang as Locale}
                    dict={dict}
                    initialProducts={productsResponse}
                    categoryId={categoryId}
                    categoryName={categoryEntry.node.name}
                    breadcrumbItems={breadcrumbItems}
                    subcategoryItems={subcategoryItems.length > 0 ? subcategoryItems : undefined}
                    view={view}
                    sortBy={resolvedSearchParams.sort as string || undefined}
                    popularProducts={popularProducts}
                    activeFilters={activeFilters}
                    recommendedProducts={categoryDetails?.recommendedProducts}
                    bannerUrl={categoryDetails?.banner?.size1x}
                    faq={faq}
                    isSubcategory={categoryEntry.level > 1}
                />
            </main>
        );
    }

    // 3. If category not found locally, check if it exists in the global tree
    const globalTree = await getCatalogTreeApi(lang, 768, undefined).catch(() => [] as ProductCategory[]);
    const globalIndex = buildCategoryIndex(globalTree);
    const globalCategoryEntry = Array.from(globalIndex.values()).find(
        e => e.node.slug === lastSegment
    );

    if (globalCategoryEntry) {
        // Category is hidden for this city, redirect to catalog root
        const langPrefix = lang === 'ua' ? '' : `/${lang}`;
        redirect(`${langPrefix}/catalog`);
    }

    // 4. Check if the last segment is a product slug
    const productId = await findProductIdBySlug(lastSegment, lang);
    if (!productId) {
        notFound();
    }

    const numericId = parseInt(productId);

    // Fetch product details
    const product = await getProductByIdApi(productId, lang, token ?? undefined, true).catch(() => null);

    if (!product) {
        // If product fails to load locally, check if it exists globally
        const globalProduct = await getProductByIdApi(productId, lang, undefined, true).catch(() => null);
        if (globalProduct) {
            const langPrefix = lang === 'ua' ? '' : `/${lang}`;
            
            const localEntry = globalProduct.categoryId
                ? categoryIndex.get(String(globalProduct.categoryId))
                : undefined;
                
            if (localEntry) {
                const catUrl = getCategoryHref(
                    localEntry.node,
                    localEntry.parent,
                    localEntry.grandParent,
                );
                redirect(`${langPrefix}${catUrl}`);
            }
            
            if (globalProduct.categoryId) {
                const globalEntry = globalIndex.get(String(globalProduct.categoryId));
                if (globalEntry) {
                    const parentSlug = globalEntry.parent?.slug;
                    const localParent = parentSlug ? catalogTree.find(c => c.slug === parentSlug) : undefined;
                    if (localParent) {
                        redirect(`${langPrefix}/catalog/${localParent.slug}`);
                    }
                }
            }
            
            redirect(`${langPrefix}/catalog`);
        }

        notFound();
    }

    // If product is not available for this city, redirect to nearest available category
    if (!product.available) {
        const langPrefix = lang === 'ua' ? '' : `/${lang}`;
        
        const localEntry = product.categoryId
            ? categoryIndex.get(String(product.categoryId))
            : undefined;
            
        if (localEntry) {
            const catUrl = getCategoryHref(
                localEntry.node,
                localEntry.parent,
                localEntry.grandParent,
            );
            redirect(`${langPrefix}${catUrl}`);
        }
        
        if (product.categoryId) {
            const globalEntry = globalIndex.get(String(product.categoryId));
            if (globalEntry) {
                const parentSlug = globalEntry.parent?.slug;
                const localParent = parentSlug ? catalogTree.find(c => c.slug === parentSlug) : undefined;
                if (localParent) {
                    redirect(`${langPrefix}/catalog/${localParent.slug}`);
                }
            }
        }
        
        redirect(`${langPrefix}/catalog`);
    }

    // Validate canonical product path
    const productCategoryEntry = product.categoryId
        ? categoryIndex.get(String(product.categoryId))
        : undefined;

    let canonicalProductPath = `/catalog/${lastSegment}`;
    if (productCategoryEntry) {
        const { node, parent, grandParent, level } = productCategoryEntry;
        if (level === 1) {
            canonicalProductPath = `/catalog/${node.slug}/${lastSegment}`;
        } else if (level === 2 && parent) {
            canonicalProductPath = `/catalog/${parent.slug}/${node.slug}/${lastSegment}`;
        } else if (level === 3 && parent && grandParent) {
            canonicalProductPath = `/catalog/${grandParent.slug}/${parent.slug}/${node.slug}/${lastSegment}`;
        }
    }

    const currentPath = `/catalog/${slug.join('/')}`;
    if (currentPath !== canonicalProductPath) {
        notFound();
    }

    // Fetch non-critical product page data
    const [blogsResponse, deliveryBlocks] = await Promise.all([
        safeCall<{ data: BlogPost[] }>(
            () => getBlogsApi({ limit: 3 }, lang),
            { data: [] },
        ),
        safeCall<OrderingInfoBlock[]>(
            () => getDeliveryBlocksApi(lang),
            [],
        ),
    ]);

    const [specialsProducts, boughtTogetherProducts, popularProducts, categoryProductsResponse] = await Promise.all([
        safeCall<Product[]>(
            () => getSpecialsByProductApi(numericId, 8, lang, token ?? undefined),
            [],
        ),
        product.categoryId
            ? safeCall<Product[]>(
                () => getBoughtTogetherProductsApi(Number(product!.categoryId), numericId, 10, lang, token ?? undefined),
                [],
            )
            : Promise.resolve<Product[]>([]),
        safeCall<Product[]>(
            () => getPopularProductsApi(undefined, 12, lang, token ?? undefined),
            [],
        ),
        product.categoryId
            ? safeCall<ProductsResponse>(
                () => getProductsApi({ categoryId: Number(product!.categoryId), sort: "rating", limit: 13 }, lang, token ?? undefined),
                { data: [], per_page: 13, current_page: 1, has_more_pages: false },
            )
            : Promise.resolve<ProductsResponse>({ data: [], per_page: 13, current_page: 1, has_more_pages: false }),
    ]);

    // Extract bundle products
    const bundleProducts: Product[] = [];
    if (product.bundles) {
        for (const bundle of product.bundles) {
            if (bundle.items) {
                for (const item of bundle.items) {
                    if (item.product && String(item.product.id) !== String(product.id)) {
                        if (!bundleProducts.some(p => String(p.id) === String(item.product.id))) {
                            bundleProducts.push(item.product);
                        }
                    }
                }
            }
        }
    }

    let finalRelatedProducts = specialsProducts;
    if (boughtTogetherProducts.length > 0) {
        finalRelatedProducts = boughtTogetherProducts;
    } else if (bundleProducts.length > 0) {
        finalRelatedProducts = bundleProducts;
    }

    const breadcrumbs = buildCategoryBreadcrumbs(product.categoryId, categoryIndex);
    breadcrumbs.push({ label: product.name });

    return (
        <ProductClient
            product={product}
            costVariants={[]}
            publications={blogsResponse.data}
            relatedProducts={finalRelatedProducts}
            popularProducts={popularProducts}
            categoryProducts={categoryProductsResponse.data}
            lang={lang as Locale}
            dict={dict}
            breadcrumbs={breadcrumbs}
            deliveryBlocks={deliveryBlocks}
        />
    );
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
    return [];
}
