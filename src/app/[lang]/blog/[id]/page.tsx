import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import BlogPostPage from "@/app/pages/BlogPost";
import { getBlogBySlugApi } from "@/lib/graphql/queries/blog";
import { notFound } from "next/navigation";

export default async function BlogDetail({
    params,
}: {
    params: Promise<{ lang: Locale; id: string }>;
}) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);

    const post = await getBlogBySlugApi(id);

    if (!post) {
        notFound();
    }

    return (
        <BlogPostPage dict={dict} post={post} />
    );
}
