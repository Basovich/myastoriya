import Hero from "@/app/pages/Home/Hero/Hero";
import Categories from "@/app/pages/Home/Categories/Categories";
import Products from "@/app/pages/Home/Products/Products";
import Actions from "@/app/pages/Home/Actions/Actions";
import AppPromo from "@/app/pages/Home/AppPromo/AppPromo";
import ComplexDiscounts from "@/app/pages/Home/ComplexDiscounts/ComplexDiscounts";
import Publications from "@/app/components/Publications";
import Reviews from "@/app/pages/Home/Reviews/Reviews";
import SeoText from "@/app/pages/Home/SeoText/SeoText";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/types";
import type { BlogPost, Slide, PopularCategory, HomeReview, Product, Showcase } from "@/lib/graphql";

interface HomePageProps {
  dict: Dictionary;
  lang: Locale;
  publications: BlogPost[];
  slides: Slide[];
  popularCategories: PopularCategory[];
  categoryHrefs: Record<string, string>;
  reviews: HomeReview[];
  initialProducts: Product[];
  initialHasMore: boolean;
  sales: any[];
  specials: any[];
  showcases: Showcase[];
}

export default function HomePage({ 
    dict, 
    lang, 
    publications, 
    slides, 
    popularCategories, 
    categoryHrefs,
    reviews, 
    initialProducts, 
    initialHasMore,
    sales,
    specials,
    showcases
}: HomePageProps) {
    return (
        <main>
            <Hero slides={slides} lang={lang} />
            <Categories lang={lang} popularCategories={popularCategories} categoryHrefs={categoryHrefs} />
            <Products dict={dict.home.products} showcases={showcases} initialProducts={initialProducts} initialHasMore={initialHasMore} />
            <Actions dict={dict.home.actions} lang={lang} sales={sales} />
            <AppPromo />
            <ComplexDiscounts dict={dict.home.discounts} lang={lang} specials={specials} />
            <Publications dict={dict.home.publications} posts={publications} lang={lang} />
            <Reviews dict={dict.home.reviews} reviews={reviews} />
            <SeoText dict={dict.home.seo} />
        </main>
    );
}