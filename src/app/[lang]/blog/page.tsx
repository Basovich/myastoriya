import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import BlogGrid from "@/app/components/BlogGrid/BlogGrid";

export default async function BlogPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <main className="bg-[#F6F6F6] text-text-primary">
            <Header lang={lang} />

            <BlogGrid
                dict={dict.home.blogPage}
                initialItems={dict.home.publications.items}
                lang={lang}
            />

            <Footer lang={lang} />
        </main>
    );
}
