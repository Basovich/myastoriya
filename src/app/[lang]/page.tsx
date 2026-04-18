import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import HomePage from "@/app/pages/Home";
import { getBlogsApi, getSlidesApi, getPopularCategoriesApi, getReviewsApi, getProductsApi } from "@/lib/graphql";

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
      />
  );
}
