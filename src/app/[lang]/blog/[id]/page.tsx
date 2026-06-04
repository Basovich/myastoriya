import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import BlogPostPage from "@/app/pages/BlogPost";
import { getBlogBySlugApi } from "@/lib/graphql/queries/blog";
import NotFoundBlock from "@/app/components/NotFoundBlock/NotFoundBlock";

export const dynamic = "force-dynamic";

export default async function BlogDetail({
    params,
}: {
    params: Promise<{ lang: Locale; id: string }>;
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);

    const post = await getBlogBySlugApi(id, lang);

    if (!post) {
        return (
            <main>
                <NotFoundBlock dict={dict} />
            </main>
        );
    }

    return (
        <BlogPostPage dict={dict} post={post} lang={lang} />
    );
}
