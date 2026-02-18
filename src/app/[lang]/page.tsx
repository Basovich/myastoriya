import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import Header from "../components/Header/Header";
import Hero from "../components/Hero/Hero";
import Categories from "../components/Categories/Categories";
import Products from "../components/Products/Products";
import Promotions from "../components/Promotions/Promotions";
import AppPromo from "../components/AppPromo/AppPromo";
import Reviews from "../components/Reviews/Reviews";
import Publications from "../components/Publications/Publications";
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
        <Categories />
        <Products />
        <Promotions />
        <AppPromo />
        <Reviews />
        <Publications />
      </main>
      <Footer lang={lang} />
    </>
  );
}
