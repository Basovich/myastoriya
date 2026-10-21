import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import ComplexDiscountDetail from '../../../components/ComplexDiscountDetail/ComplexDiscountDetail';
import { findSpecialIdBySlug, getSpecialApi, getSpecialSlugsById } from '@/lib/graphql';
import { getAccessToken } from '@/app/actions/authActions';
import {
    getExplicitHreflangAlternates,
    getDynamicBaseUrl,
    buildOpenGraphMetadata,
    generateBreadcrumbJsonLd,
    setRequestBreadcrumbJsonLd,
    fetchSeoMetadataByUrl,
} from '@/utils/seo';
import HreflangLinks from '@/app/components/HreflangLinks/HreflangLinks';

interface ComboDetailProps {
    params: Promise<{ lang: 'ua' | 'ru'; slug: string }>;
}

export async function generateMetadata({ params }: ComboDetailProps): Promise<Metadata> {
    const { lang, slug } = await params;
    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);

    const specialId = await findSpecialIdBySlug(slug, lang);
    if (!specialId) return {};

    const [specialSlugs, special] = await Promise.all([
        getSpecialSlugsById(specialId),
        getSpecialApi(specialId, lang).catch(() => null),
    ]);

    if (!special) return {};

    const discountTitle = special.title;
    const relativeUrl = `/${lang}/complex-discounts/${slug}/`;
    const seo = await fetchSeoMetadataByUrl(relativeUrl, lang, {
        h1: discountTitle,
    });
    const finalTitle = seo.title || discountTitle;

    const alternates = getExplicitHreflangAlternates(
        {
            uk: `/complex-discounts/${specialSlugs.uk}/`,
            ru: `/complex-discounts/${specialSlugs.ru}/`,
        },
        lang,
        dynamicBaseUrl,
    );
    const canonicalUrl = seo.canonical || alternates.canonical;

    const discountImage = typeof special.image === 'string'
        ? special.image
        : special.image?.size2x || special.image?.size1x || (typeof special.banner === 'string' ? special.banner : special.banner?.size2x || special.banner?.size1x);

    const isRu = lang === 'ru';
    const breadcrumbs = [
        { label: isRu ? 'Главная' : 'Головна', href: '/' },
        { label: isRu ? 'Комплексные скидки' : 'Комплексні знижки', href: '/complex-discounts' },
        { label: discountTitle },
    ];
    const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs, lang, canonicalUrl, dynamicBaseUrl);
    setRequestBreadcrumbJsonLd(breadcrumbJsonLd);

    return {
        title: finalTitle,
        description: seo.description,
        robots: seo.noindex ? { index: false, follow: false } : undefined,
        openGraph: buildOpenGraphMetadata({
            title: finalTitle,
            description: seo.description,
            canonicalUrl,
            lang,
            image: discountImage,
            type: 'website',
        }),
        twitter: {
            card: 'summary_large_image',
            title: finalTitle,
            description: seo.description,
            images: discountImage ? [discountImage] : undefined,
        },
    };
}

export default async function ComboDetail({ params }: ComboDetailProps) {
    const { lang, slug } = await params;
    const token = await getAccessToken();

    // Try to resolve slug to ID
    let finalId = slug;
    if (isNaN(Number(slug))) {
        let resolvedId = await findSpecialIdBySlug(slug, lang, token ?? undefined);
        if (!resolvedId) {
            // Fallback to public list (without token) to resolve the ID so we can redirect instead of 404
            resolvedId = await findSpecialIdBySlug(slug, lang, undefined);
        }
        if (resolvedId) {
            finalId = resolvedId;
        }
    }

    let special = null;
    let publicSpecial = null;
    try {
        [special, publicSpecial] = await Promise.all([
            getSpecialApi(finalId, lang, token ?? undefined),
            getSpecialApi(finalId, lang, undefined),
        ]);
    } catch (err) {
        console.warn(`[ComboDetailPage] Failed to fetch special with id ${finalId}:`, err);
    }

    // If it doesn't exist even in the public catalog, then it's a true 404
    if (!publicSpecial) {
        notFound();
    }

    // Redirect to official current localized slug if requested slug was old/transliterated
    if (publicSpecial.slug && slug !== publicSpecial.slug && isNaN(Number(slug))) {
        redirect(`/${lang}/complex-discounts/${publicSpecial.slug}`);
    }

    // Determine the expected count of products from the public catalog version
    const expectedCount = Math.max(
        publicSpecial.products?.length ?? 0,
        publicSpecial.productsCount ?? 0,
        2, // A bundle must have at least 2 products
    );

    // The special is considered unavailable if:
    // 1. It wasn't returned for this city (special is null)
    // 2. The list of products is missing or shorter than expected
    // 3. Any of the products is marked as not available
    const hasUnavailableProduct =
        !special ||
        !special.products ||
        special.products.length < expectedCount ||
        special.products.some((product) => !product.available);

    if (hasUnavailableProduct || !special) {
        redirect(`/${lang}/complex-discounts`);
    }

    const relativeUrl = `/${lang}/complex-discounts/${slug}/`;
    const discountTitle = special.title;
    const [seo, specialSlugs] = await Promise.all([
        fetchSeoMetadataByUrl(relativeUrl, lang, {
            h1: discountTitle,
        }),
        getSpecialSlugsById(String(special.id ?? finalId)),
    ]);

    const alternates = getExplicitHreflangAlternates(
        { uk: `/complex-discounts/${specialSlugs.uk}/`, ru: `/complex-discounts/${specialSlugs.ru}/` },
        lang,
        getDynamicBaseUrl(await headers()),
    );

    return (
        <main>
            <HreflangLinks canonical={seo.canonical || alternates.canonical} languages={alternates.languages} />
            <ComplexDiscountDetail lang={lang} initialData={special} h1={seo.h1 || undefined} />
        </main>
    );
}

