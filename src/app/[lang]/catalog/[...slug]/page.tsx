import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Locale } from '@/i18n/config';
import {
    getCatalogTreeApi,
    resolveCategoryImageUrl,
    ProductCategory,
} from '@/lib/graphql';
import { buildCategoryIndex } from '@/utils/category-url';
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

    return {};
}

export default async function DynamicCatalogPage({ params }: DynamicCatalogPageProps) {
    const { lang, slug } = await params;
    const token = await getAccessToken();

    if (!slug || slug.length === 0) {
        notFound();
    }

    const lastSegment = slug[slug.length - 1];
    const langPrefix = lang === 'ua' ? '' : `/${lang}`;

    // Fetch current catalog tree (locality-aware)
    const catalogTree = await getCatalogTreeApi(lang, 768, token ?? undefined).catch(() => [] as ProductCategory[]);
    const categoryIndex = buildCategoryIndex(catalogTree);

    // Check if the last segment is a category in the current locality tree → redirect to /category/
    const categoryEntry = Array.from(categoryIndex.values()).find(
        e => e.node.slug === lastSegment
    );

    if (categoryEntry) {
        redirect(`${langPrefix}/category/${categoryEntry.node.slug}`);
    }

    // Check if it exists in global tree (hidden for this city → redirect to catalog root)
    const globalTree = await getCatalogTreeApi(lang, 768, undefined).catch(() => [] as ProductCategory[]);
    const globalIndex = buildCategoryIndex(globalTree);
    const globalCategoryEntry = Array.from(globalIndex.values()).find(
        e => e.node.slug === lastSegment
    );

    if (globalCategoryEntry) {
        redirect(`${langPrefix}/catalog`);
    }

    notFound();
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
    return [];
}
