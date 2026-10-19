import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getDictionary } from '@/i18n/get-dictionary';
import { Locale } from '@/i18n/config';
import { getLocalizedHref } from '@/utils/i18n-helpers';
import { getExplicitHreflangAlternates, getDynamicBaseUrl, fetchSeoMetadataByUrl, buildOpenGraphMetadata, generateProductJsonLd, setRequestProductJsonLd } from '@/utils/seo';
import ProductClient from '@/app/pages/Product/ProductClient';
import HreflangLinks from '@/app/components/HreflangLinks/HreflangLinks';
import {
    getCatalogTreeApi,
    getProductsApi,
    getPopularProductsApi,
    getProductByIdApi,
    findProductIdBySlug,
    getProductSlugsById,
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
import { getProductReviewsSsr, ProductReview } from '@/lib/graphql/queries/reviews';
import { buildCategoryIndex, buildCategoryBreadcrumbs, getCategoryHref } from '@/utils/category-url';
import { getAccessToken } from '@/app/actions/authActions';

interface ProductPageProps {
    params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { lang, slug } = await params;
    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);

    const token = await getAccessToken();
    const productId = await findProductIdBySlug(slug, lang as Locale).catch(() => null);
    if (!productId) return {};

    let product = await getProductByIdApi(productId, lang as Locale, token ?? undefined, true).catch(() => null);
    if (!product) {
        product = await getProductByIdApi(productId, lang as Locale, undefined, true).catch(() => null);
    }
    if (!product) return {};

    const productSlugs = await getProductSlugsById(productId).catch(() => ({ uk: slug, ru: slug }));

    const productName = product.name;
    const productImage = resolveProductImageUrl(product);
    const effectivePrice = product.purchaseCost ?? product.cost;
    const relativeUrl = `/${lang}/product/${slug}/`;
    const seoData = await fetchSeoMetadataByUrl(relativeUrl, lang, {
        h1: productName,
    });

    const finalTitle = seoData.title || productName;
    let finalDescription = seoData.description;
    if (finalDescription) {
        if (effectivePrice) {
            finalDescription = finalDescription.replace(/(Ціна|Цена)\s+\d+[\s\d]*(?:\s*грн\.?)+/gi, `$1 ${Math.round(effectivePrice)} грн`);
        }
        finalDescription = finalDescription.replace(/(?:\s+грн\.?){2,}/gi, ' грн').trim();
    }

    const alternates = getExplicitHreflangAlternates(
        {
            uk: `/product/${productSlugs.uk}/`,
            ru: `/product/${productSlugs.ru}/`,
        },
        lang,
        dynamicBaseUrl,
    );
    const canonicalUrl = seoData.canonical || alternates.canonical;

    let ratingData: { ratingValue?: number; ratingCount?: number } | undefined = undefined;
    try {
        const numericId = parseInt(productId, 10);
        if (!isNaN(numericId)) {
            const reviewsData = await getProductReviewsSsr(numericId, 5, lang as Locale);
            const ratingCount = reviewsData?.data?.length ?? 0;
            const ratingSum = reviewsData?.data?.reduce((acc, r) => acc + (r.rating || 0), 0) ?? 0;
            const ratingValue = ratingCount > 0 ? ratingSum / ratingCount : (product.rating ?? undefined);
            if (ratingValue && ratingCount > 0) {
                ratingData = { ratingValue, ratingCount };
            }
        }
    } catch {
        // Non-critical rating fetch error
    }

    const productJsonLd = generateProductJsonLd({
        product,
        lang,
        canonicalUrl,
        dynamicBaseUrl,
        imageUrl: productImage,
        ratingData,
    });
    setRequestProductJsonLd(productJsonLd, relativeUrl);

    return {
        title: finalTitle,
        description: finalDescription,
        ...(seoData.noindex ? { robots: { index: false, follow: false } } : {}),
        openGraph: buildOpenGraphMetadata({
            title: finalTitle,
            description: finalDescription,
            canonicalUrl,
            lang,
            image: productImage,
            type: 'product',
            dynamicBaseUrl,
        }),
        other: {
            'og:type': 'product',
        },
        twitter: {
            card: 'summary_large_image',
            title: finalTitle,
            description: finalDescription,
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
        const globalProduct = await getProductByIdApi(productId, lang as Locale, undefined, true).catch(() => null);
        if (globalProduct) {
            const localEntry = globalProduct.categoryId
                ? categoryIndex.get(String(globalProduct.categoryId))
                : undefined;

            if (localEntry) {
                redirect(getLocalizedHref(getCategoryHref(localEntry.node), lang as Locale));
            }

            redirect(getLocalizedHref('/catalog', lang as Locale));
        }

        notFound();
    }

    // Redirect to official current localized slug if requested slug was old/transliterated
    if (product.slug && slug !== product.slug && !/^\d+$/.test(slug)) {
        redirect(`/${lang}/product/${product.slug}`);
    }


    // 4. If product is not available for this city, redirect to nearest available category
    if (!product.available) {
        const localEntry = product.categoryId
            ? categoryIndex.get(String(product.categoryId))
            : undefined;

        if (localEntry) {
            redirect(getLocalizedHref(getCategoryHref(localEntry.node), lang as Locale));
        }

        redirect(getLocalizedHref('/catalog', lang as Locale));
    }

    // 5. Fetch non-critical product page data
    const [blogsResponse, deliveryBlocks, salesResponse, initialReviewsData] = await Promise.all([
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
        // SSR prefetch перших відгуків — для відображення в HTML без JS
        safeCall(
            () => getProductReviewsSsr(numericId, 5, lang),
            { data: [] as ProductReview[], per_page: 5, current_page: 1, has_more_pages: false },
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

    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);

    let ratingData: { ratingValue?: number; ratingCount?: number } | undefined = undefined;
    const ratingCount = initialReviewsData?.data?.length ?? 0;
    const ratingSum = initialReviewsData?.data?.reduce((acc: number, r: ProductReview) => acc + (r.rating || 0), 0) ?? 0;
    const ratingValue = ratingCount > 0 ? ratingSum / ratingCount : (product.rating ?? undefined);
    if (ratingValue && ratingCount > 0) {
        ratingData = { ratingValue, ratingCount };
    }

    const productSlugs = await getProductSlugsById(productId).catch(() => ({ uk: slug, ru: slug }));
    const alternates = getExplicitHreflangAlternates(
        { uk: `/product/${productSlugs.uk}/`, ru: `/product/${productSlugs.ru}/` },
        lang,
        dynamicBaseUrl,
    );
    const seoData = await fetchSeoMetadataByUrl(`/${lang}/product/${slug}/`, lang, {
        h1: product.name,
    }).catch(() => null);
    const hreflangCanonical = seoData?.canonical || alternates.canonical;

    const productJsonLd = generateProductJsonLd({
        product,
        lang,
        canonicalUrl: hreflangCanonical,
        dynamicBaseUrl,
        imageUrl: resolveProductImageUrl(product),
        ratingData,
    });

    return (
        <>
            <meta property="og:type" content="product" />
            <HreflangLinks canonical={hreflangCanonical} languages={alternates.languages} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(productJsonLd).replace(/</g, '\\u003c'),
                }}
            />
            <ProductClient
                product={product}
                costVariants={[]}
                publications={blogsResponse.data}
                relatedProducts={finalRelatedProducts}
                popularProducts={popularProducts}
                categoryProducts={categoryProductsResponse.data}
                lang={lang as Locale}
                dict={dict}
                h1={seoData?.h1 || product.name}
                breadcrumbs={breadcrumbs}
                deliveryBlocks={deliveryBlocks}
                initialReviews={initialReviewsData?.data ?? []}
                initialReviewsHasMore={initialReviewsData?.has_more_pages ?? false}
            />
        </>
    );
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
    return [];
}
