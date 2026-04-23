import { use } from "react";
import {Locale} from "@/i18n/config";
import SearchContent from "@/app/pages/Search/SearchContent/SearchContent";


export default function Search({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = use(params);

    return (
        <>
            <main style={{ minHeight: "100vh" }}>
                <SearchContent />
            </main>
        </>
    )
}