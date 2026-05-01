import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import HomePage from "@/app/pages/Home";
import { getBlogsApi } from "@/lib/graphql/queries/blog";
import { getSlidesApi } from "@/lib/graphql/queries/pages/home/slides";
import { getPopularCategoriesApi } from "@/lib/graphql/queries/pages/home/categories";
import { getReviewsApi } from "@/lib/graphql/queries/pages/home/reviews";
import { getProductsApi, getCatalogTreeApi } from "@/lib/graphql/queries/products";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const popularCategories = await getPopularCategoriesApi();
  const firstCategoryId = popularCategories.length > 0 ? parseInt(popularCategories[0].id) : null;

  const [blogsResponse, slides, reviews, initialProductsResponse] = await Promise.all([
    getBlogsApi({ limit: 3 }),
    getSlidesApi("main"),
    getReviewsApi(),
    getProductsApi({ categoryId: firstCategoryId, limit: 8 })
  ]);

  return (
      <HomePage
          lang={lang}
          dict={dict}
          publications={blogsResponse.data}
          slides={slides}
          popularCategories={popularCategories}
          reviews={reviews}
          initialProducts={initialProductsResponse.data}
          initialHasMore={initialProductsResponse.has_more_pages}
      />
  );
}
