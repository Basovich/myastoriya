import TopBar from "@/app/components/Header/MobileHeader/TopBar";
import SearchBar from "@/app/components/Header/MobileHeader/SearchBar";
import { type Locale } from "@/i18n/config";

interface MobileHeaderProps {
    lang: Locale;
}

export default function MobileHeader({ lang }: MobileHeaderProps) {
    return (
        <>
            <TopBar lang={lang} />
            <SearchBar />
        </>
    );
}