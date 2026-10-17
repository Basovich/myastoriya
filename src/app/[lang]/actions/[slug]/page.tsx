import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import ActionDetail from '../../../components/ActionDetail/ActionDetail';
import {
    getSalesApi,
    getProductsApi,
    findSaleIdBySlug,
    getSaleSlugsById,
    type Product,
} from '@/lib/graphql';
import { getAccessToken } from '@/app/actions/authActions';
import {
    getExplicitHreflangAlternates,
    getDynamicBaseUrl,
    getActionSeoData,
    buildOpenGraphMetadata,
    generateBreadcrumbJsonLd,
    setRequestBreadcrumbJsonLd,
    fetchSeoMetadataByUrl,
    formatTitleConfig,
} from '@/utils/seo';
import HreflangLinks from '@/app/components/HreflangLinks/HreflangLinks';

interface ActionDetailPageProps {
    params: Promise<{ lang: 'ua' | 'ru'; slug: string }>;
}

export async function generateMetadata({ params }: ActionDetailPageProps): Promise<Metadata> {
    const { lang, slug } = await params;
    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);

    const saleId = await findSaleIdBySlug(slug, lang);
    if (!saleId) return {};

    const [saleSlugs, salesResponse] = await Promise.all([
        getSaleSlugsById(saleId),
        getSalesApi(100, 1, lang).catch(() => null),
    ]);

    const sale = salesResponse?.data.find((s) => String(s.id) === String(saleId));
    if (!sale) return {};

    const actionTitle = sale.title || sale.name;
    const fallbackSeoData = getActionSeoData(actionTitle, sale.description || sale.text, lang);
    const relativeUrl = `/${lang}/actions/${slug}/`;
    const seo = await fetchSeoMetadataByUrl(relativeUrl, lang, {
        title: fallbackSeoData.title,
        description: fallbackSeoData.description,
        h1: actionTitle,
    });

    const alternates = getExplicitHreflangAlternates(
        {
            uk: `/actions/${saleSlugs.uk}/`,
            ru: `/actions/${saleSlugs.ru}/`,
        },
        lang,
        dynamicBaseUrl,
    );
    const canonicalUrl = seo.canonical || alternates.canonical;

    const actionImage = typeof sale.banner === 'string'
        ? sale.banner
        : sale.banner?.size2x || sale.banner?.size1x || (typeof sale.image === 'string' ? sale.image : sale.image?.size2x || sale.image?.size1x);

    const isRu = lang === 'ru';
    const breadcrumbs = [
        { label: isRu ? 'Главная' : 'Головна', href: '/' },
        { label: isRu ? 'Акции' : 'Акції', href: '/actions' },
        { label: sale.name }
    ];
    const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs, lang, canonicalUrl, dynamicBaseUrl);
    setRequestBreadcrumbJsonLd(breadcrumbJsonLd);

    const titleConfig = formatTitleConfig(seo.title, lang);

    return {
        title: titleConfig,
        description: seo.description,
        robots: seo.noindex ? { index: false, follow: false } : undefined,
        openGraph: buildOpenGraphMetadata({
            title: titleConfig.absolute,
            description: seo.description,
            canonicalUrl,
            lang,
            image: actionImage,
            type: 'article',
        }),
        twitter: {
            card: 'summary_large_image',
            title: titleConfig.absolute,
            description: seo.description,
            images: actionImage ? [actionImage] : undefined,
        },
    };
}

export default async function ActionDetailPage({ params }: ActionDetailPageProps) {
    const { lang, slug } = await params;
    const token = await getAccessToken();

    // 1. Resolve sale ID by slug (with fallback across languages)
    const saleId = await findSaleIdBySlug(slug, lang);
    if (!saleId) {
        return notFound();
    }

    // 2. Fetch full list of sales to get sale details for current lang
    const salesResponse = await getSalesApi(100, 1, lang, token ?? undefined);
    const sale = salesResponse.data.find((s) => String(s.id) === String(saleId));

    if (!sale) {
        return notFound();
    }

    // 3. If requested slug is an old/transliterated slug, redirect to current localized slug
    if (sale.slug && slug !== sale.slug && !/^\d+$/.test(slug)) {
        redirect(`/${lang}/actions/${sale.slug}`);
    }

    let productsResponse = { data: [] as Product[], has_more_pages: false };
    try {
        productsResponse = await getProductsApi(
            { saleId: parseInt(sale.id), limit: 24, silent: true },
            lang,
            token ?? undefined,
        );
    } catch (err) {
        console.warn(`[ActionDetailPage] Failed to fetch products for sale ${sale.id}:`, err);
    }

    const relativeUrl = `/${lang}/actions/${slug}/`;
    const actionTitle = sale.title || sale.name;
    const fallbackSeoData = getActionSeoData(actionTitle, sale.description || sale.text, lang);
    const [seo, saleSlugs] = await Promise.all([
        fetchSeoMetadataByUrl(relativeUrl, lang, {
            title: fallbackSeoData.title,
            description: fallbackSeoData.description,
            h1: actionTitle,
        }),
        getSaleSlugsById(saleId),
    ]);

    const alternates = getExplicitHreflangAlternates(
        { uk: `/actions/${saleSlugs.uk}/`, ru: `/actions/${saleSlugs.ru}/` },
        lang,
        getDynamicBaseUrl(await headers()),
    );

    return (
        <main>
            <HreflangLinks canonical={seo.canonical || alternates.canonical} languages={alternates.languages} />
            <ActionDetail
                lang={lang}
                id={slug}
                sale={sale}
                initialProducts={productsResponse.data}
                initialHasMore={productsResponse.has_more_pages}
                h1={seo.h1 || undefined}
            />
        </main>
    );
}

