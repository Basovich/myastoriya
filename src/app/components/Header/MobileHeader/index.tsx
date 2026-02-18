import { useState } from "react";
import TopBar from "@/app/components/Header/MobileHeader/TopBar";
import SearchBar from "@/app/components/Header/MobileHeader/SearchBar";
import MobileMenu from "@/app/components/Header/MobileHeader/MobileMenu";
import { type Locale } from "@/i18n/config";

interface MobileHeaderProps {
    lang: Locale;
}

export default function MobileHeader({ lang }: MobileHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <TopBar lang={lang} onMenuClick={() => setIsMenuOpen(true)} />
            <SearchBar />
            <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} lang={lang} />
        </>
    );
}