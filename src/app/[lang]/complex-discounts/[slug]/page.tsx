import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import ComplexDiscountDetail from '../../../components/ComplexDiscountDetail/ComplexDiscountDetail';
import { findSpecialIdBySlug, getSpecialApi, getSpecialSlugsById } from '@/lib/graphql';
import { getAccessToken } from '@/app/actions/authActions';
import { getExplicitHreflangAlternates, getDynamicBaseUrl, getComplexDiscountSeoData } from '@/utils/seo';

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

    const discountTitle = special.title || special.name;
    const seoData = getComplexDiscountSeoData(discountTitle, special.description || special.text, lang);
    const titleConfig = lang === 'ru' ? { absolute: seoData.title } : seoData.title;

    const alternates = getExplicitHreflangAlternates(
        {
            uk: `/complex-discounts/${specialSlugs.uk}/`,
            ru: `/complex-discounts/${specialSlugs.ru}/`,
        },
        lang,
        dynamicBaseUrl,
    );

    return {
        title: titleConfig,
        description: seoData.description,
        alternates: {
            canonical: alternates.canonical,
            languages: alternates.languages,
        },
        openGraph: {
            title: discountTitle,
            description: seoData.description,
        },
        twitter: {
            card: 'summary_large_image',
            title: discountTitle,
            description: seoData.description,
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

    return (
        <main>
            <ComplexDiscountDetail lang={lang} initialData={special} />
        </main>
    );
}

