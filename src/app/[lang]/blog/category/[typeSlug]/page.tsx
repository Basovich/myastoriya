import { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import BlogGrid from "@/app/components/BlogGrid/BlogGrid";
import { getBlogsApi, getBlogTypesApi } from "@/lib/graphql/queries/blog";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
    try {
        const types = await getBlogTypesApi();
        return types.map((type) => ({
            typeSlug: type.slug,
        }));
    } catch (error) {
        console.error('[Blog] Failed to generate static params for blog types:', error);
        return [];
    }
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

    return (
        <main>
            <BlogGrid
                dict={dict.home.blogPage}
                initialItems={blogsResult.data}
                totalPages={blogsResult.has_more_pages ? 999 : blogsResult.current_page}
                hasMore={blogsResult.has_more_pages}
                blogTypes={blogTypes}
                lang={lang}
                activeTypeSlug={typeSlug}
            />
        </main>
    );
}
