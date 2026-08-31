import { redirect, notFound } from "next/navigation";
import { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import BlogGrid from "@/app/components/BlogGrid/BlogGrid";
import { getBlogsApi, getBlogTypesApi, getBlogBySlugApi } from "@/lib/graphql/queries/blog";
import { mapUrlCategoryToApiTypeSlug, getBlogCategorySegment } from "@/utils/blog-url";
import { getAccessToken } from "@/app/actions/authActions";

export const dynamic = "force-dynamic";

export default async function BlogCategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: Locale; category: string }>;
    searchParams: Promise<{ page?: string }>;
}) {
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
