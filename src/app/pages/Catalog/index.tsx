import { use } from "react";
import Header from "@/app/components/Header/Header";
import {Locale} from "@/i18n/config";
import CatalogContent from "@/app/pages/Catalog/CatalogContent";
import Footer from "@/app/components/Footer/Footer";


export default function Catalog({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = use(params);

    return (
        <>
            <Header lang={lang as Locale} />
            <main style={{ minHeight: "100vh" }}>
                <CatalogContent />
            </main>
            <Footer lang={lang as Locale} />
        </>
    )
}
