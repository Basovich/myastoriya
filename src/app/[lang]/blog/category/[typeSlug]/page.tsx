import { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import BlogGrid from "@/app/components/BlogGrid/BlogGrid";
import { getBlogsApi, getBlogTypesApi } from "@/lib/graphql/queries/blog";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
    /**
     * [LIGHTWEIGHT BUILD]
     * Return empty array to reduce build-time API calls.
     */
    return [];
}

export default async function BlogTypePage({
    params,
}: {
    params: Promise<{ lang: Locale; typeSlug: string }>;
}) {
    const { lang, typeSlug } = await params;
    const dict = await getDictionary(lang);

    const [blogsResult, blogTypes] = await Promise.all([
        getBlogsApi({ page: 1, typeSlug }),
        getBlogTypesApi(),
    ]);

    // If the type doesn't exist in our list, show 404
    const typeExists = blogTypes.some(t => t.slug === typeSlug);
    if (!typeExists && blogsResult.data.length === 0) {
        notFound();
    }

    const currentType = blogTypes.find((t) => t.slug === typeSlug);
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
                activeTypeSlug={typeSlug}
            />
        </main>
    );
}
