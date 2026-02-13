import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import Categories from "./components/Categories/Categories";
import Products from "./components/Products/Products";
import Promotions from "./components/Promotions/Promotions";
import AppPromo from "./components/AppPromo/AppPromo";
import Reviews from "./components/Reviews/Reviews";
import Publications from "./components/Publications/Publications";
import Footer from "./components/Footer/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Categories />
        <Products />
        <Promotions />
        <AppPromo />
        <Reviews />
        <Publications />
      </main>
      <Footer />
    </>
  );
}
