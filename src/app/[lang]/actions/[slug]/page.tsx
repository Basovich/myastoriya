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
import { getExplicitHreflangAlternates, getDynamicBaseUrl } from '@/utils/seo';

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

    const title = sale.title || sale.name;
    const description = sale.description
        ? sale.description.replace(/<[^>]*>/g, '').trim().slice(0, 160)
        : title;

    const alternates = getExplicitHreflangAlternates(
        {
            uk: `/actions/${saleSlugs.uk}/`,
            ru: `/actions/${saleSlugs.ru}/`,
        },
        lang,
        dynamicBaseUrl,
    );

    return {
        title,
        description,
        alternates: {
            canonical: alternates.canonical,
            languages: alternates.languages,
        },
        openGraph: {
            title,
            description,
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

    // Hide the promotion itself if all products are unavailable in the selected city
    if (productsResponse.data.length === 0) {
        return notFound();
    }

    return (
        <main>
            <ActionDetail
                lang={lang}
                id={slug}
                sale={sale}
                initialProducts={productsResponse.data}
                initialHasMore={productsResponse.has_more_pages}
            />
        </main>
    );
}

