import { use } from "react";
import Header from "@/app/components/Header/Header";
import { Locale } from "@/i18n/config";
import CatalogContent from "@/app/pages/Catalog/CatalogContent";
import Footer from "@/app/components/Footer/Footer";

interface CategoryCatalogProps {
    params: Promise<{ lang: string; category: string }>;
}

export default function CategoryCatalog({ params }: CategoryCatalogProps) {
    const { lang, category } = use(params);

    return (
        <>
            <Header lang={lang as Locale} />
            <main>
                <CatalogContent category={category} />
            </main>
            <Footer lang={lang as Locale} />
        </>
    );
}
