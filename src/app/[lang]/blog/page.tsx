import { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import BlogGrid from "@/app/components/BlogGrid/BlogGrid";
import { getBlogsApi, getBlogTypesApi, type BlogsPagination } from "@/lib/graphql/queries/blog";

export const dynamic = "force-dynamic";

export default async function BlogPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: Locale }>;
    searchParams: Promise<{ page?: string }>;
}) {
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
