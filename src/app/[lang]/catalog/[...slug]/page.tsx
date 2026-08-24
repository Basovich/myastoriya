import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getDictionary } from '@/i18n/get-dictionary';
import { Locale } from '@/i18n/config';
import ProductClient from '@/app/pages/Product/ProductClient';
import {
    getCatalogTreeApi,
    getProductsApi,
    getPopularProductsApi,
    getProductByIdApi,
    findProductIdBySlug,
    getBlogsApi,
    getSpecialsByProductApi,
    getBoughtTogetherProductsApi,
    getDeliveryBlocksApi,
    getSalesApi,
    resolveProductImageUrl,
    ProductCategory,
    Product,
    BlogPost,
    OrderingInfoBlock,
    ProductsResponse,
    Sale
} from '@/lib/graphql';
import { buildCategoryIndex, buildCategoryBreadcrumbs, getCategoryHref } from '@/utils/category-url';
import { getAccessToken } from '@/app/actions/authActions';

interface DynamicCatalogPageProps {
    params: Promise<{ lang: string; slug: string[] }>;
}

export async function generateMetadata({ params }: DynamicCatalogPageProps): Promise<Metadata> {
    const { lang, slug } = await params;
    if (!slug || slug.length === 0) return {};

    const lastSegment = slug[slug.length - 1];
    const catalogTree = await getCatalogTreeApi(lang as Locale, 768, undefined).catch(() => [] as ProductCategory[]);
    const categoryIndex = buildCategoryIndex(catalogTree);

    // 1. Check if category
    const categoryEntry = Array.from(categoryIndex.values()).find(
        e => e.node.slug === lastSegment
    );

    if (categoryEntry) {
        const categoryName = categoryEntry.node.name;
        const categoryImage = resolveCategoryImageUrl(categoryEntry.node);
        const description = `${categoryName} — замовляйте з доставкою від М'ясторія.`;

        return {
            title: categoryName,
            description,
            openGraph: {
                title: categoryName,
                description,
                images: categoryImage ? [{ url: categoryImage, alt: categoryName }] : undefined,
            },
            twitter: {
                card: 'summary_large_image',
                title: categoryName,
                description,
                images: categoryImage ? [categoryImage] : undefined,
            },
        };
    }

    // 2. Check if product
    const productId = await findProductIdBySlug(lastSegment, lang as Locale).catch(() => null);
    if (productId) {
        const product = await getProductByIdApi(productId, lang as Locale).catch(() => null);
        if (product) {
            const productName = product.name;
            const productImage = resolveProductImageUrl(product);
            const rawDescription = product.text
                ? product.text.replace(/<[^>]*>/g, '').trim()
                : '';
            const description = rawDescription
                ? rawDescription.slice(0, 160)
                : `Купити ${productName} за найкращою ціною з доставкою від М'ясторія.`;

            return {
                title: productName,
                description,
                openGraph: {
                    title: productName,
                    description,
                    images: productImage ? [{ url: productImage, alt: productName }] : undefined,
                },
                twitter: {
                    card: 'summary_large_image',
                    title: productName,
                    description,
                    images: productImage ? [productImage] : undefined,
                },
            };
        }
    }

    return {};
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

export default async function DynamicCatalogPage({ params }: DynamicCatalogPageProps) {
    const { lang, slug } = await params;
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
        const langPrefix = lang === 'ua' ? '' : `/${lang}`;
        redirect(`${langPrefix}/category/${categoryEntry.node.slug}`);
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
    const [blogsResponse, deliveryBlocks, salesResponse] = await Promise.all([
        safeCall<{ data: BlogPost[] }>(
            () => getBlogsApi({ limit: 3 }, lang),
            { data: [] },
        ),
        safeCall<OrderingInfoBlock[]>(
            () => getDeliveryBlocksApi(lang),
            [],
        ),
        safeCall<{ data: Sale[] }>(
            () => getSalesApi(50, 1, lang, token ?? undefined),
            { data: [] },
        ),
    ]);

    if (salesResponse?.data && salesResponse.data.length > 0) {
        const saleChecks = await Promise.all(
            salesResponse.data.map(async (sale: Sale) => {
                const saleProds = await safeCall<ProductsResponse>(
                    () => getProductsApi({ saleId: Number(sale.id), limit: 50 }, lang, token ?? undefined),
                    { data: [], per_page: 50, current_page: 1, has_more_pages: false },
                );
                const isMatch = saleProds?.data?.some(p => String(p.id) === String(product.id));
                return isMatch ? sale : null;
            })
        );
        const foundSale = saleChecks.find(Boolean);
        if (foundSale) {
            product.promoTitle = foundSale.name || foundSale.title || undefined;
            product.promoUrl = `/actions/${foundSale.slug || foundSale.id}`;
        }
    }

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
