import { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import BlogGrid from "@/app/components/BlogGrid/BlogGrid";
import { getBlogsApi, getBlogTypesApi, type BlogsPagination } from "@/lib/graphql/queries/blog";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getHreflangAlternates, getDynamicBaseUrl, fetchSeoMetadataByUrl, parsePageNum, formatTitleWithPage, buildOpenGraphMetadata, generateBreadcrumbJsonLd, setRequestBreadcrumbJsonLd } from "@/utils/seo";
import HreflangLinks from "@/app/components/HreflangLinks/HreflangLinks";

export const dynamic = "force-dynamic";

interface BlogPageProps {
    params: Promise<{ lang: Locale }>;
    searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params, searchParams }: BlogPageProps): Promise<Metadata> {
    const { lang } = await params;
    const resolvedSearchParams = await searchParams;
    const pageNum = parsePageNum(resolvedSearchParams?.page);

    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);
    const relativeUrl = `/${lang}/blog/`;
    const seo = await fetchSeoMetadataByUrl(relativeUrl, lang);
    const alternates = getHreflangAlternates("/blog/", lang, dynamicBaseUrl, pageNum);

    const rawTitle = seo.title || "";
    const formattedTitleStr = formatTitleWithPage(rawTitle, pageNum, lang);

    const canonicalUrl = pageNum > 1 ? alternates.canonical : (seo.canonical || alternates.canonical);
    const isPageNoindex = pageNum > 1 || Boolean(seo.noindex);
    const pageRobots = isPageNoindex ? { index: false, follow: true } : undefined;

    const isRu = lang === "ru";
    const breadcrumbs = [
        { label: isRu ? "Главная" : "Головна", href: "/" },
        { label: isRu ? "Блог" : "Блог" }
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

export default async function BlogPage({
    params,
    searchParams,
}: BlogPageProps) {
    const { lang } = await params;
    const { page: pageQuery } = await searchParams;
    const page = Math.max(1, parseInt(pageQuery || "1", 10));

    const dict = await getDictionary(lang);

    const [blogsResult, blogTypes] = await Promise.all([
        getBlogsApi({ page }, lang).catch((err) => {
            console.error("getBlogsApi error:", err);
            return {
                data: [],
                last_page: 1,
                has_more_pages: false,
                per_page: 12,
                current_page: page,
                from: null,
                to: null,
                total: 0,
            } as BlogsPagination;
        }),
        getBlogTypesApi(lang).catch((err) => {
            console.error("getBlogTypesApi error:", err);
            return [];
        }),
    ]);

    const [alternates, seo] = await Promise.all([
        getHreflangAlternates("/blog/", lang, getDynamicBaseUrl(await headers()), page),
        fetchSeoMetadataByUrl(`/${lang}/blog/`, lang),
    ]);

    return (
        <main>
            <HreflangLinks canonical={alternates.canonical} languages={alternates.languages} />
            <BlogGrid
                dict={dict.home.blogPage}
                initialItems={blogsResult?.data ?? []}
                totalPages={blogsResult?.last_page || 1}
                hasMore={blogsResult?.has_more_pages ?? false}
                blogTypes={blogTypes ?? []}
                lang={lang}
                initialPage={page}
                h1={seo.h1 || undefined}
            />
        </main>
    );
}
