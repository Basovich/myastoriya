import { use } from "react";
import Header from "@/app/components/Header/Header";
import {Locale} from "@/i18n/config";
import FilterContent from "@/app/pages/Filter/FilterContent/FilterContent";
import Footer from "@/app/components/Footer/Footer";


export default function Filter({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = use(params);

    return (
        <>
            <Header lang={lang as Locale} />
            <main style={{ minHeight: "100vh" }}>
                <FilterContent />
            </main>
            <Footer lang={lang as Locale} />
        </>
    )
}
