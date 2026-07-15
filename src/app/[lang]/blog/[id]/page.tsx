import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import BlogPostPage from "@/app/pages/BlogPost";
import { getBlogBySlugApi } from "@/lib/graphql/queries/blog";
import NotFoundBlock from "@/app/components/NotFoundBlock/NotFoundBlock";
import { getAccessToken } from "@/app/actions/authActions";

export const dynamic = "force-dynamic";

export default async function BlogDetail({
    params,
}: {
    params: Promise<{ lang: Locale; id: string }>;
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);

    const token = await getAccessToken();
    const post = await getBlogBySlugApi(id, lang, token ?? undefined);

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
