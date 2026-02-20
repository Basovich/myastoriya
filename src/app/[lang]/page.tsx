import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import Header from "../components/Header/Header";
import Hero from "../components/Hero/Hero";
import Categories from "../components/Categories/Categories";
import Products from "../components/Products/Products";
import Promotions from "../components/Promotions/Promotions";
import AppPromo from "../components/AppPromo/AppPromo";
import ComplexDiscounts from "../components/ComplexDiscounts/ComplexDiscounts";
import Reviews from "../components/Reviews/Reviews";
import Publications from "../components/Publications/Publications";
import SeoText from "../components/SeoText/SeoText";
import Footer from "../components/Footer/Footer";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

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
