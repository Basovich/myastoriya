import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import BlogPostPage from "@/app/pages/BlogPost";
import { getBlogBySlugApi, resolveBlogImageUrl } from "@/lib/graphql";
import { getAccessToken } from "@/app/actions/authActions";
import { getBlogCategorySegment } from "@/utils/blog-url";
import { getBlogSeoData, getHreflangAlternates, getDynamicBaseUrl } from "@/utils/seo";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: Locale; category: string; slug: string }>;
}): Promise<Metadata> {
    const { lang, slug, category } = await params;
    const headersList = await headers();
    const dynamicBaseUrl = getDynamicBaseUrl(headersList);
    const token = await getAccessToken();
    const post = await getBlogBySlugApi(slug, lang, token ?? undefined).catch(() => null);
    if (!post) return {};

    const postTitle = post.h1 || post.name;
    const seoData = getBlogSeoData(postTitle, post.text, lang);
    const titleConfig = lang === 'ru' ? { absolute: seoData.title } : seoData.title;
    const imageUrl = resolveBlogImageUrl(post.image);
    const alternates = getHreflangAlternates(`/blog/${category}/${slug}/`, lang, dynamicBaseUrl);

    return {
        title: titleConfig,
        description: seoData.description,
        alternates: {
            canonical: alternates.canonical,
            languages: alternates.languages,
        },
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
    const post = await getBlogBySlugApi(slug, lang, token ?? undefined).catch(() => null);

    if (!post) {
        notFound();
    }

    const canonicalCategory = getBlogCategorySegment(post);
    if (category !== canonicalCategory) {
        redirect(`/${lang}/blog/${canonicalCategory}/${slug}`);
    }

    // Filter out broken/non-existent recipes & related blogs that return errors
    let validRecipes = post.recipes || [];
    if (validRecipes.length > 0) {
        const checked = await Promise.all(
            validRecipes.map(async (recipe) => {
                const recipePost = await getBlogBySlugApi(recipe.slug, lang, token ?? undefined, true).catch(() => null);
                return recipePost ? recipe : null;
            })
        );
        validRecipes = checked.filter((r): r is typeof validRecipes[number] => r !== null);
    }

    let validRelatedBlogs = post.relatedBlogs || [];
    if (validRelatedBlogs.length > 0) {
        const checkedRelated = await Promise.all(
            validRelatedBlogs.map(async (rel) => {
                const relPost = await getBlogBySlugApi(rel.slug, lang, token ?? undefined, true).catch(() => null);
                return relPost ? rel : null;
            })
        );
        validRelatedBlogs = checkedRelated.filter((r): r is typeof validRelatedBlogs[number] => r !== null);
    }

    const cleanedPost = {
        ...post,
        recipes: validRecipes,
        relatedBlogs: validRelatedBlogs,
    };

    return (
        <BlogPostPage dict={dict} post={cleanedPost} lang={lang} />
    );
}
