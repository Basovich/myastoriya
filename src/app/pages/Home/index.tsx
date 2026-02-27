import Header from "@/app/components/Header/Header";
import Hero from "@/app/pages/Home/Hero/Hero";
import Categories from "@/app/pages/Home/Categories/Categories";
import Products from "@/app/pages/Home/Products/Products";
import Promotions from "@/app/pages/Home/Promotions/Promotions";
import AppPromo from "@/app/pages/Home/AppPromo/AppPromo";
import ComplexDiscounts from "@/app/pages/Home/ComplexDiscounts/ComplexDiscounts";
import Publications from "@/app/pages/Home/Publications/Publications";
import Reviews from "@/app/pages/Home/Reviews/Reviews";
import SeoText from "@/app/pages/Home/SeoText/SeoText";
import Footer from "@/app/components/Footer/Footer";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/types";

interface HomePageProps {
  dict: Dictionary;
  lang: Locale;
}

export default function HomePage({ dict, lang }: HomePageProps) {
    return (
        <>
            <Header lang={lang} />
            <main>
                <Hero hero={dict.home.hero} />
                <Categories categories={dict.home.categories} />
                <Products dict={dict.home.products} categories={dict.home.categories.items} />
                <Promotions dict={dict.home.promotions} lang={lang} />
                <AppPromo />
                <ComplexDiscounts dict={dict.home.discounts} lang={lang} />
                <Publications dict={dict.home.publications} lang={lang} />
                <Reviews dict={dict.home.reviews} />
                <SeoText dict={dict.home.seo} />
            </main>
            <Footer lang={lang} />
        </>
    );
}