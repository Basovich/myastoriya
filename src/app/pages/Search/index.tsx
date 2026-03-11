import { use } from "react";
import Header from "@/app/components/Header/Header";
import {Locale} from "@/i18n/config";
import SearchContent from "@/app/pages/Search/SearchContent/SearchContent";
import Footer from "@/app/components/Footer/Footer";


export default function Search({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = use(params);

    return (
        <>
            <Header lang={lang as Locale} />
            <main style={{ minHeight: "100vh" }}>
                <SearchContent />
            </main>
            <Footer lang={lang as Locale} />
        </>
    )
}