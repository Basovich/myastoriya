import { redirect, notFound } from "next/navigation";
import { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import BlogGrid from "@/app/components/BlogGrid/BlogGrid";
import { getBlogsApi, getBlogTypesApi, getBlogBySlugApi } from "@/lib/graphql/queries/blog";
import { mapUrlCategoryToApiTypeSlug, getBlogCategorySegment } from "@/utils/blog-url";
import { getAccessToken } from "@/app/actions/authActions";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getStaticPageSeoData, getHreflangAlternates, getDynamicBaseUrl } from "@/utils/seo";

export const dynamic = "force-dynamic";

interface BlogCategoryPageProps {
    params: Promise<{ lang: Locale; category: string }>;
    searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: BlogCategoryPageProps): Promise<Metadata> {
    const { lang, category } = await params;
    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);

    const pageKey = category === "recipe" ? "blog-recipe" : category === "article" ? "blog-article" : undefined;
    if (!pageKey) {
        return {};
    }

    const seo = getStaticPageSeoData(pageKey, lang);
    const alternates = getHreflangAlternates(`/blog/${category}/`, lang, dynamicBaseUrl);

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

export default async function BlogCategoryPage({
    params,
    searchParams,
}: BlogCategoryPageProps) {
    const { lang, category } = await params;
    const { page: pageQuery } = await searchParams;
    const page = Math.max(1, parseInt(pageQuery || "1", 10));

    // Legacy redirects for old category slugs
    if (category === 'sovety' || category === 'stati') {
        redirect(`/${lang}/blog/article`);
    }
    if (category === 'recepty') {
        redirect(`/${lang}/blog/recipe`);
    }

    const apiTypeSlug = mapUrlCategoryToApiTypeSlug(category);

    // If it's a valid SEO category ('recipe' | 'article')
    if (apiTypeSlug) {
        const dict = await getDictionary(lang);

        const [blogsResult, blogTypes] = await Promise.all([
            getBlogsApi({ page, typeSlug: apiTypeSlug }, lang),
            getBlogTypesApi(lang),
        ]);

        const calculatedTotalPages = blogsResult.last_page || 1;

        return (
            <main>
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
                />
            </main>
        );
    }

    // Otherwise, check if category is an old single post slug (/blog/[slug])
    const token = await getAccessToken();
    const legacyPost = await getBlogBySlugApi(category, lang, token ?? undefined);
    if (legacyPost) {
        const canonicalCategory = getBlogCategorySegment(legacyPost);
        redirect(`/${lang}/blog/${canonicalCategory}/${legacyPost.slug}`);
    }

    notFound();
}
