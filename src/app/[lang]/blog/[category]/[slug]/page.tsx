import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import BlogPostPage from "@/app/pages/BlogPost";
import { getBlogBySlugApi, resolveBlogImageUrl } from "@/lib/graphql";
import NotFoundBlock from "@/app/components/NotFoundBlock/NotFoundBlock";
import { getAccessToken } from "@/app/actions/authActions";
import { getBlogCategorySegment } from "@/utils/blog-url";
import { getBlogSeoData } from "@/utils/seo";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: Locale; category: string; slug: string }>;
}): Promise<Metadata> {
    const { lang, slug } = await params;
    const token = await getAccessToken();
    const post = await getBlogBySlugApi(slug, lang, token ?? undefined).catch(() => null);
    if (!post) return {};

    const postTitle = post.h1 || post.name;
    const seoData = getBlogSeoData(postTitle, post.text, lang);
    const titleConfig = lang === 'ru' ? { absolute: seoData.title } : seoData.title;
    const imageUrl = resolveBlogImageUrl(post.image);

    return {
        title: titleConfig,
        description: seoData.description,
        openGraph: {
            title: postTitle,
            description: seoData.description,
            images: imageUrl ? [{ url: imageUrl, alt: postTitle }] : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title: postTitle,
            description: seoData.description,
            images: imageUrl ? [imageUrl] : undefined,
        },
    };
}

export const dynamic = "force-dynamic";

export default async function BlogSinglePostPage({
    params,
}: {
    params: Promise<{ lang: Locale; category: string; slug: string }>;
}) {
    const { lang, category, slug } = await params;
    const dict = await getDictionary(lang);

    const token = await getAccessToken();
    const post = await getBlogBySlugApi(slug, lang, token ?? undefined);

    if (!post) {
        return (
            <main>
                <NotFoundBlock dict={dict} />
            </main>
        );
    }

    const canonicalCategory = getBlogCategorySegment(post);
    if (category !== canonicalCategory) {
        redirect(`/${lang}/blog/${canonicalCategory}/${slug}`);
    }

    return (
        <BlogPostPage dict={dict} post={post} lang={lang} />
    );
}
