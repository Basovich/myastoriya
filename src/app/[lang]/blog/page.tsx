import { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import BlogGrid from "@/app/components/BlogGrid/BlogGrid";
import { getBlogsApi, getBlogTypesApi, type BlogsPagination } from "@/lib/graphql/queries/blog";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getStaticPageSeoData, getHreflangAlternates, getDynamicBaseUrl } from "@/utils/seo";

export const dynamic = "force-dynamic";

interface BlogPageProps {
    params: Promise<{ lang: Locale }>;
    searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
    const { lang } = await params;
    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);
    const seo = getStaticPageSeoData("blog", lang);
    const alternates = getHreflangAlternates("/blog/", lang, dynamicBaseUrl);

    const isRu = lang === "ru";
    const title = isRu ? { absolute: seo.title } : seo.h1;

    return {
        title,
        description: seo.description,
        alternates: {
            canonical: alternates.canonical,
            languages: alternates.languages,
        },
        openGraph: {
            title: seo.title,
            description: seo.description,
            images: [{ url: "/images/og-image.jpg", alt: seo.h1 }],
        },
        twitter: {
            card: "summary_large_image",
            title: seo.title,
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

    return (
        <main>
            <BlogGrid
                dict={dict.home.blogPage}
                initialItems={blogsResult?.data ?? []}
                totalPages={blogsResult?.last_page || 1}
                hasMore={blogsResult?.has_more_pages ?? false}
                blogTypes={blogTypes ?? []}
                lang={lang}
                initialPage={page}
            />
        </main>
    );
}
