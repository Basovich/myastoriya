import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import HomePage from "@/app/pages/Home";
import { getBlogsApi } from "@/lib/graphql/queries/blog";
import { getSlidesApi } from "@/lib/graphql/queries/pages/home/slides";
import { getPopularCategoriesApi } from "@/lib/graphql/queries/pages/home/categories";
import { getReviewsApi } from "@/lib/graphql/queries/pages/home/reviews";
import { getProductsApi, getSalesApi, getSpecialsApi, getCatalogTreeApi, getShowcasesApi } from "@/lib/graphql";
import { buildCategoryIndex, getCategoryHref } from "@/utils/category-url";
import { getAccessToken } from "@/app/actions/authActions";
import { headers } from "next/headers";
import { getStaticPageSeoData, getHreflangAlternates, getDynamicBaseUrl, fetchSeoMetadataByUrl, buildOpenGraphMetadata } from "@/utils/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const headersList = await headers();
  const dynamicBaseUrl = getDynamicBaseUrl(headersList);
  const fallbackSeo = getStaticPageSeoData('home', lang);
  const relativeUrl = `/${lang}/`;
  const seo = await fetchSeoMetadataByUrl(relativeUrl, lang, fallbackSeo);
  const alternates = getHreflangAlternates('/', lang, dynamicBaseUrl);
  const canonicalUrl = seo.canonical || alternates.canonical;

  return {
    title: { absolute: seo.title },
    description: seo.description,
    ...(seo.noindex ? { robots: { index: false, follow: false } } : {}),
    alternates: {
      canonical: canonicalUrl,
      languages: alternates.languages,
    },
    openGraph: buildOpenGraphMetadata({
      title: seo.title,
      description: seo.description,
      canonicalUrl,
      lang,
      type: "website",
    }),
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const token = await getAccessToken();

  const [popularCategories, catalogTree, showcases, salesResponse] = await Promise.all([
      getPopularCategoriesApi(lang, token ?? undefined),
      getCatalogTreeApi(lang, 768, token ?? undefined),
      getShowcasesApi(lang, token ?? undefined),
      getSalesApi(6, 1, lang),
  ]);
  const categoryIndex = buildCategoryIndex(catalogTree);
  // Build a href map: categoryId -> correct URL based on tree level
  const categoryHrefs: Record<string, string> = {};
  for (const [id, entry] of categoryIndex) {
      categoryHrefs[id] = getCategoryHref(entry.node);
  }

  // Filter showcases that have productsCount > 0 for the user's locality/city
  const filteredShowcases = showcases.filter(s => s.productsCount === undefined || s.productsCount > 0);
  const firstShowcaseId = filteredShowcases.length > 0 ? parseInt(filteredShowcases[0].id) : null;

  // Run products checks in parallel in the second batch
  const salesProductsChecksPromise = Promise.all(
      (salesResponse?.data || []).map(async (sale) => {
          try {
              const products = await getProductsApi({ saleId: parseInt(sale.id), limit: 1, silent: true }, lang, token ?? undefined);
              return { sale, hasProducts: products.data.length > 0 };
          } catch (err) {
              console.warn(`Failed to check products for sale ${sale.id}:`, err);
              return { sale, hasProducts: false };
          }
      })
  );

  const [blogsResponse, slides, reviews, initialProductsResponse, specialsResponse, salesProductsChecks] = await Promise.all([
    getBlogsApi({ limit: 3 }, lang),
    getSlidesApi("main", lang),
    getReviewsApi(lang),
    getProductsApi({ showcaseId: firstShowcaseId, limit: 8 }, lang, token ?? undefined),
    getSpecialsApi(10, 1, lang, token ?? undefined),
    salesProductsChecksPromise
  ]);

  // SSR prefetch усіх вітрин паралельно — для відображення в HTML без JS
  const allShowcaseProductsResponses = await Promise.all(
    filteredShowcases.map((showcase) =>
      getProductsApi({ showcaseId: parseInt(showcase.id), limit: 8 }, lang, token ?? undefined)
        .catch(() => ({ data: [] as typeof initialProductsResponse.data, per_page: 8, current_page: 1, has_more_pages: false }))
    )
  );
  const allShowcaseProducts: Record<string, typeof initialProductsResponse.data> = {};
  const allShowcaseHasMore: Record<string, boolean> = {};
  filteredShowcases.forEach((showcase, i) => {
    allShowcaseProducts[showcase.id] = allShowcaseProductsResponses[i]?.data ?? [];
    allShowcaseHasMore[showcase.id] = allShowcaseProductsResponses[i]?.has_more_pages ?? false;
  });

  const activeSales = salesProductsChecks
      .filter(item => item.hasProducts)
      .map(item => item.sale);

  const activeSpecials = (specialsResponse?.data || []).filter(special => {
      if (!special.products || special.products.length < 2) return false;
      if (typeof special.productsCount === 'number' && special.productsCount > 0 && special.products.length < special.productsCount) {
          return false;
      }
      return special.products.every(product => product.available);
  });

  return (
      <HomePage
          lang={lang}
          dict={dict}
          publications={blogsResponse.data}
          slides={slides}
          popularCategories={popularCategories}
          categoryHrefs={categoryHrefs}
          reviews={reviews}
          initialProducts={initialProductsResponse.data}
          initialHasMore={initialProductsResponse.has_more_pages}
          sales={activeSales}
          specials={activeSpecials}
          showcases={filteredShowcases}
          allShowcaseProducts={allShowcaseProducts}
          allShowcaseHasMore={allShowcaseHasMore}
      />
  );
}
