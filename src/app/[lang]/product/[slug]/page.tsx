import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getDictionary } from '@/i18n/get-dictionary';
import { Locale } from '@/i18n/config';
import { getHreflangAlternates } from '@/utils/seo';
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
    Sale,
} from '@/lib/graphql';
import { buildCategoryIndex, buildCategoryBreadcrumbs, getCategoryHref } from '@/utils/category-url';
import { getAccessToken } from '@/app/actions/authActions';

interface ProductPageProps {
    params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { lang, slug } = await params;

    const productId = await findProductIdBySlug(slug, lang as Locale).catch(() => null);
    if (!productId) return {};

    const product = await getProductByIdApi(productId, lang as Locale).catch(() => null);
    if (!product) return {};

    const productName = product.name;
    const productImage = resolveProductImageUrl(product);
    const rawDescription = product.text
        ? product.text.replace(/<[^>]*>/g, '').trim()
        : '';
    const description = rawDescription
        ? rawDescription.slice(0, 160)
        : `Купити ${productName} за найкращою ціною з доставкою від М'ясторія.`;

    const alternates = getHreflangAlternates(`/product/${slug}/`, lang);

    return {
        title: productName,
        description,
        alternates: {
            canonical: alternates.canonical,
            languages: alternates.languages,
        },
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
                    `[ProductPage] API error (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms...`,
                    err instanceof Error ? err.message : err,
                );
                await new Promise((r) => setTimeout(r, delay));
            } else {
                console.error(
                    `[ProductPage] Non-critical API error after ${retries + 1} attempts — using fallback:`,
                    err instanceof Error ? err.message : err,
                );
                try {
                    const Sentry = await import('@sentry/nextjs');
                    Sentry.captureException(err, {
                        tags: { component: 'ProductPage', type: 'safeCall_exhausted' },
                    });
                } catch {
                    // Ignore Sentry errors
                }
            }
        }
    }
    return fallback;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { lang, slug } = await params;
    const dict = await getDictionary(lang as Locale);
    const token = await getAccessToken();

    // 1. Resolve product ID by slug
    const productId = await findProductIdBySlug(slug, lang).catch(() => null);
    if (!productId) {
        notFound();
    }

    const numericId = parseInt(productId);

    // 2. Fetch catalog tree for breadcrumbs and locality check
    const catalogTree = await getCatalogTreeApi(lang, 768, token ?? undefined).catch(() => [] as ProductCategory[]);
    const categoryIndex = buildCategoryIndex(catalogTree);

    // 3. Fetch product details (locality-aware via token)
    const product = await getProductByIdApi(productId, lang, token ?? undefined, true).catch(() => null);

    if (!product) {
        // Product exists but is not available in this city → redirect to catalog
        const globalProduct = await getProductByIdApi(productId, lang, undefined, true).catch(() => null);
        if (globalProduct) {
            const langPrefix = lang === 'ua' ? '' : `/${lang}`;

            const localEntry = globalProduct.categoryId
                ? categoryIndex.get(String(globalProduct.categoryId))
                : undefined;

            if (localEntry) {
                redirect(`${langPrefix}${getCategoryHref(localEntry.node)}`);
            }

            redirect(`${langPrefix}/catalog`);
        }

        notFound();
    }

    // 4. If product is not available for this city, redirect to nearest available category
    if (!product.available) {
        const langPrefix = lang === 'ua' ? '' : `/${lang}`;

        const localEntry = product.categoryId
            ? categoryIndex.get(String(product.categoryId))
            : undefined;

        if (localEntry) {
            redirect(`${langPrefix}${getCategoryHref(localEntry.node)}`);
        }

        redirect(`${langPrefix}/catalog`);
    }

    // 5. Fetch non-critical product page data
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
                () => getProductsApi({ categoryId: Number(product!.categoryId), sort: 'rating', limit: 13 }, lang, token ?? undefined),
                { data: [], per_page: 13, current_page: 1, has_more_pages: false },
            )
            : Promise.resolve<ProductsResponse>({ data: [], per_page: 13, current_page: 1, has_more_pages: false }),
    ]);

    // 6. Extract bundle products
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

    // 7. Build breadcrumbs based on category hierarchy (independent of URL structure)
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
