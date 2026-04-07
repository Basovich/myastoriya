import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import BlogGrid from "@/app/components/BlogGrid/BlogGrid";
import { getBlogsApi, getBlogTypesApi } from "@/lib/graphql";

export default async function EventsPage({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    const activeSlug = "events";

    const [blogsResult, blogTypes] = await Promise.all([
        getBlogsApi({ page: 1, typeSlug: activeSlug }),
        getBlogTypesApi(),
    ]);

    return (
        <main>
            <Header lang={lang} />

            <BlogGrid
                dict={dict.home.blogPage}
                initialItems={blogsResult.data}
                totalPages={blogsResult.has_more_pages ? 999 : blogsResult.current_page}
                hasMore={blogsResult.has_more_pages}
                blogTypes={blogTypes}
                lang={lang}
                activeTypeSlug={activeSlug}
            />

            <Footer lang={lang} />
        </main>
    );
}
