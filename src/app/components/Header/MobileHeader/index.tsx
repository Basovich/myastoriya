import { useState } from "react";
import TopBar from "@/app/components/Header/MobileHeader/TopBar";
import SearchBar from "@/app/components/Header/MobileHeader/SearchBar";
import MobileMenu from "@/app/components/Header/MobileHeader/MobileMenu";
import { type Locale } from "@/i18n/config";
import useScrollLock from "@/hooks/useScrollLock";

import { ProductCategory } from "@/lib/graphql/queries/products";

interface MobileHeaderProps {
    lang: Locale;
    categories: ProductCategory[];
}

export default function MobileHeader({ lang, categories }: MobileHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { disableScroll, enableScroll } = useScrollLock();

    const handleOpenMenu = () => {
        setIsMenuOpen(true);
        disableScroll();
    };

    const handleCloseMenu = () => {
        setIsMenuOpen(false);
        enableScroll();
    };

    return (
        <>
            <TopBar lang={lang} onMenuClick={handleOpenMenu} />
            <SearchBar />
            <MobileMenu isOpen={isMenuOpen} onClose={handleCloseMenu} lang={lang} categories={categories} />
        </>
    );
}