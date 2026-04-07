import Header from "@/app/components/Header/Header";
import Hero from "@/app/pages/Home/Hero/Hero";
import Categories from "@/app/pages/Home/Categories/Categories";
import Products from "@/app/pages/Home/Products/Products";
import Actions from "@/app/pages/Home/Actions/Actions";
import AppPromo from "@/app/pages/Home/AppPromo/AppPromo";
import ComplexDiscounts from "@/app/pages/Home/ComplexDiscounts/ComplexDiscounts";
import Publications from "@/app/components/Publications";
import Reviews from "@/app/pages/Home/Reviews/Reviews";
import SeoText from "@/app/pages/Home/SeoText/SeoText";
import Footer from "@/app/components/Footer/Footer";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/types";
import type { BlogPost, Slide, PopularCategory } from "@/lib/graphql";

interface HomePageProps {
  dict: Dictionary;
  lang: Locale;
  publications: BlogPost[];
  slides: Slide[];
  popularCategories: PopularCategory[];
}

export default function HomePage({ dict, lang, publications, slides, popularCategories }: HomePageProps) {
    return (
        <>
            <Header lang={lang} />
            <main>
                <Hero slides={slides} lang={lang} />
                <Categories lang={lang} popularCategories={popularCategories} />
                <Products dict={dict.home.products} categories={dict.home.categories.items} />
                <Actions dict={dict.home.actions} lang={lang} />
                <AppPromo />
                <ComplexDiscounts dict={dict.home.discounts} lang={lang} />
                <Publications dict={dict.home.publications} posts={publications} lang={lang} />
                <Reviews dict={dict.home.reviews} />
                <SeoText dict={dict.home.seo} />
            </main>
            <Footer lang={lang} />
        </>
    );
}