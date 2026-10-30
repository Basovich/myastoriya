import { notFound, permanentRedirect } from "next/navigation";
import { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import BlogGrid from "@/app/components/BlogGrid/BlogGrid";
import { getBlogsApi, getBlogTypesApi, getBlogBySlugApi } from "@/lib/graphql/queries/blog";
import { mapUrlCategoryToApiTypeSlug, getBlogCategorySegment } from "@/utils/blog-url";
import { getAccessToken } from "@/app/actions/authActions";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getHreflangAlternates, getDynamicBaseUrl, fetchSeoMetadataByUrl, parsePageNum, formatTitleWithPage, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd } from "@/utils/seo";
import HreflangLinks from "@/app/components/HreflangLinks/HreflangLinks";

export const dynamic = "force-dynamic";

interface BlogCategoryPageProps {
    params: Promise<{ lang: Locale; category: string }>;
    searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params, searchParams }: BlogCategoryPageProps): Promise<Metadata> {
    const { lang, category } = await params;
    const resolvedSearchParams = await searchParams;
    const pageNum = parsePageNum(resolvedSearchParams?.page);

    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);

    const isRu = lang === "ru";
    const categoryName = category === "recipe" ? (isRu ? "Рецепты" : "Рецепти") : (isRu ? "Статьи" : "Статті");
    const relativeUrl = `/${lang}/blog/${category}/`;
    const seo = await fetchSeoMetadataByUrl(relativeUrl, lang);
    const alternates = getHreflangAlternates(`/blog/${category}/`, lang, dynamicBaseUrl, pageNum);

    const rawTitle = seo.title || "";
    const formattedTitleStr = formatTitleWithPage(rawTitle, pageNum, lang);

    const canonicalUrl = pageNum > 1 ? alternates.canonical : (seo.canonical || alternates.canonical);
    const isPageNoindex = pageNum > 1 || Boolean(seo.noindex);
    const pageRobots = isPageNoindex ? { index: false, follow: true } : undefined;

    const breadcrumbs = [
        { label: isRu ? "Главная" : "Головна", href: "/" },
        { label: isRu ? "Блог" : "Блог", href: "/blog" },
        { label: categoryName }
    ];
    const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs, lang, canonicalUrl, dynamicBaseUrl);
    setRequestBreadcrumbJsonLd(breadcrumbJsonLd);

    return {
        title: formattedTitleStr,
        description: seo.description,
        ...(pageRobots && { robots: pageRobots }),
        openGraph: buildOpenGraphMetadata({
            title: formattedTitleStr,
            description: seo.description,
            canonicalUrl,
            lang,
            type: "website",
        }),
        twitter: {
            card: "summary_large_image",
            title: formattedTitleStr,
            description: seo.description,
            images: ["/images/og-image.jpg"],
        },
    };
}

export default async function BlogCategoryPage({
    params,
    searchParams,
}: BlogCategoryPageProps) {
    const { lang, category } = await params;
    const { page: pageQuery } = await searchParams;
    const page = Math.max(1, parseInt(pageQuery || "1", 10));

    // Legacy redirects for old category slugs
    if (category === 'sovety' || category === 'stati') {
        permanentRedirect(`/${lang}/blog/article/`);
    }
    if (category === 'recepty') {
        permanentRedirect(`/${lang}/blog/recipe/`);
    }

    const apiTypeSlug = mapUrlCategoryToApiTypeSlug(category);

    // If it's a valid SEO category ('recipe' | 'article')
    if (apiTypeSlug) {
        const dict = await getDictionary(lang);

        const [blogsResult, blogTypes, seo] = await Promise.all([
            getBlogsApi({ page, typeSlug: apiTypeSlug }, lang),
            getBlogTypesApi(lang),
            fetchSeoMetadataByUrl(`/${lang}/blog/${category}/`, lang),
        ]);

        const calculatedTotalPages = blogsResult.last_page || 1;
        const alternates = getHreflangAlternates(`/blog/${category}/`, lang, getDynamicBaseUrl(await headers()), page);

        return (
            <main>
                <HreflangLinks canonical={alternates.canonical} languages={alternates.languages} />
                <BlogGrid
                    dict={dict.home.blogPage}
                    initialItems={blogsResult.data}
                    totalPages={calculatedTotalPages}
                    hasMore={blogsResult.has_more_pages}
                    blogTypes={blogTypes}
                    lang={lang}
                    activeCategory={category as 'recipe' | 'article'}
                    activeTypeSlug={apiTypeSlug}
                    initialPage={page}
                    h1={seo.h1 || undefined}
                />
            </main>
        );
    }

    // Otherwise, check if category is an old single post slug (/blog/[slug])
    const token = await getAccessToken();
    const legacyPost = await getBlogBySlugApi(category, lang, token ?? undefined).catch(() => null);
    if (legacyPost) {
        const canonicalCategory = getBlogCategorySegment(legacyPost);
        permanentRedirect(`/${lang}/blog/${canonicalCategory}/${legacyPost.slug}/`);
    }

    notFound();
}
