import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import BlogPostPage from "@/app/pages/BlogPost";
import { getBlogBySlugApi, resolveBlogImageUrl } from "@/lib/graphql";
import { getAccessToken } from "@/app/actions/authActions";
import { getBlogCategorySegment } from "@/utils/blog-url";
import {
    getHreflangAlternates,
    getDynamicBaseUrl,
    buildOpenGraphMetadata,
    generateBreadcrumbJsonLd,
    setRequestBreadcrumbJsonLd,
    fetchSeoMetadataByUrl,
} from "@/utils/seo";
import HreflangLinks from "@/app/components/HreflangLinks/HreflangLinks";

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
    const canonicalCategory = getBlogCategorySegment(post);
    const relativeUrl = `/blog/${canonicalCategory}/${slug}/`;
    const seo = await fetchSeoMetadataByUrl(relativeUrl, lang, {
        h1: postTitle,
    });
    const finalTitle = seo.title || postTitle;

    const imageUrl = resolveBlogImageUrl(post.image);
    const alternates = getHreflangAlternates(`/blog/${category}/${slug}/`, lang, dynamicBaseUrl);
    const canonicalUrl = seo.canonical || alternates.canonical;

    const categoryLabel = canonicalCategory === 'recipe'
        ? (lang === 'ru' ? 'Рецепты' : 'Рецепти')
        : (lang === 'ru' ? 'Статьи' : 'Статті');

    const breadcrumbs = [
        { label: lang === 'ru' ? 'Главная' : 'Головна', href: '/' },
        { label: lang === 'ru' ? 'Блог' : 'Блог', href: '/blog' },
        { label: categoryLabel, href: `/blog/${canonicalCategory}` },
        { label: post.name },
    ];
    const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs, lang, canonicalUrl, dynamicBaseUrl);
    setRequestBreadcrumbJsonLd(breadcrumbJsonLd);

    return {
        title: finalTitle,
        description: seo.description,
        robots: seo.noindex ? { index: false, follow: false } : undefined,
        openGraph: buildOpenGraphMetadata({
            title: finalTitle,
            description: seo.description,
            canonicalUrl,
            lang,
            image: imageUrl,
            type: 'article',
        }),
        twitter: {
            card: "summary_large_image",
            title: finalTitle,
            description: seo.description,
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

    const postTitle = post.h1 || post.name;
    const relativeUrl = `/blog/${canonicalCategory}/${slug}/`;
    const [seo, headersList] = await Promise.all([
        fetchSeoMetadataByUrl(relativeUrl, lang, {
            h1: postTitle,
        }),
        headers(),
    ]);

    const cleanedPost = {
        ...post,
        h1: seo.h1 || post.h1 || post.name,
        recipes: validRecipes,
        relatedBlogs: validRelatedBlogs,
    };

    const alternates = getHreflangAlternates(`/blog/${category}/${slug}/`, lang, getDynamicBaseUrl(headersList));

    return (
        <>
            <HreflangLinks canonical={seo.canonical || alternates.canonical} languages={alternates.languages} />
            <BlogPostPage dict={dict} post={cleanedPost} lang={lang} />
        </>
    );
}
