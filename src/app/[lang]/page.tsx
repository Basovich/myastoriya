import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import HomePage from "@/app/pages/Home";
import { getBlogsApi } from "@/lib/graphql/queries/blog";
import { getSlidesApi } from "@/lib/graphql/queries/pages/home/slides";
import { getPopularCategoriesApi } from "@/lib/graphql/queries/pages/home/categories";
import { getReviewsApi } from "@/lib/graphql/queries/pages/home/reviews";
import { getProductsApi, getSalesApi, getSpecialsApi, getCatalogTreeApi } from "@/lib/graphql";
import { buildCategoryIndex, getCategoryHref } from "@/utils/category-url";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const [popularCategories, catalogTree] = await Promise.all([
      getPopularCategoriesApi(lang),
      getCatalogTreeApi(lang),
  ]);
  const categoryIndex = buildCategoryIndex(catalogTree);
  // Build a href map: categoryId -> correct URL based on tree level
  const categoryHrefs: Record<string, string> = {};
  for (const [id, entry] of categoryIndex) {
      categoryHrefs[id] = getCategoryHref(entry.node, entry.parent ?? undefined, entry.grandParent ?? undefined);
  }

  const firstCategoryId = popularCategories.length > 0 ? parseInt(popularCategories[0].id) : null;

  const [blogsResponse, slides, reviews, initialProductsResponse, salesResponse, specialsResponse] = await Promise.all([
    getBlogsApi({ limit: 3 }, lang),
    getSlidesApi("main", lang),
    getReviewsApi(lang),
    getProductsApi({ categoryId: firstCategoryId, limit: 8 }, lang),
    getSalesApi(6, 1, lang),
    getSpecialsApi(10, 1, lang)
  ]);

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
          sales={salesResponse.data}
          specials={specialsResponse.data}
      />
  );
}
