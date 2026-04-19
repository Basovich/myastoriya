import Hero from "@/app/pages/Home/Hero/Hero";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/types";
interface HomePageProps {
  dict: Dictionary;
  lang: Locale;
  publications: BlogPost[];
  slides: Slide[];
  popularCategories: PopularCategory[];
  reviews: HomeReview[];
  initialProducts: Product[];
}

export default function HomePage({ dict, lang, publications, slides, popularCategories, reviews, initialProducts }: HomePageProps) {
    return (
        <main>
            <Hero slides={slides} lang={lang} />
            <Categories lang={lang} popularCategories={popularCategories} />
            <Products dict={dict.home.products} categories={popularCategories} initialProducts={initialProducts} />
            <Actions dict={dict.home.actions} lang={lang} />
            <AppPromo />
            <ComplexDiscounts dict={dict.home.discounts} lang={lang} />
            <Publications dict={dict.home.publications} posts={publications} lang={lang} />
            <Reviews dict={dict.home.reviews} reviews={reviews} />
            <SeoText dict={dict.home.seo} />
        </main>
    );
}