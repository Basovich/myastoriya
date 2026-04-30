import { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import BlogGrid from "@/app/components/BlogGrid/BlogGrid";
import { getBlogsApi, getBlogTypesApi } from "@/lib/graphql/queries/blog";

export default async function BlogPage({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    const [blogsResult, blogTypes] = await Promise.all([
        getBlogsApi({ page: 1 }),
        getBlogTypesApi(),
    ]);

    return (
        <main>
            <BlogGrid
                dict={dict.home.blogPage}
                initialItems={blogsResult.data}
                totalPages={blogsResult.last_page || 1}
                hasMore={blogsResult.has_more_pages}
                blogTypes={blogTypes}
                lang={lang}
            />
        </main>
    );
}
