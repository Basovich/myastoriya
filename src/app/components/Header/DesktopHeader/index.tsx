"use client";

import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import TopBar from "@/app/components/Header/DesktopHeader/TopBar";
import MainBar from "@/app/components/Header/DesktopHeader/MainBar";
import s from "./DesktopHeader.module.scss";
import { type Locale } from "@/i18n/config";
import { ProductCategory } from "@/lib/graphql/queries/products";

interface DesktopHeaderProps {
    lang: Locale;
    categories: ProductCategory[];
}

export default function DesktopHeader({ lang, categories }: DesktopHeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isScrolledMenuOpen, setIsScrolledMenuOpen] = useState(false);
    const [placeholderHeight, setPlaceholderHeight] = useState(0);
    const topBarRef = useRef<HTMLDivElement>(null);
    const mainBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const topBarH = topBarRef.current?.offsetHeight ?? 44;
            const mainBarH = mainBarRef.current?.offsetHeight ?? 80;
            const threshold = topBarH + mainBarH + 300;

            // When a modal opens, useScrollLock locks the body with 'disable-scroll' and sets window.scrollY to 0.
            // We need to read the saved data-scroll-position to prevent the header from snapping out of fixed state.
            const isBodyLocked = document.body.classList.contains('disable-scroll');
            const currentScroll = isBodyLocked
                ? Number(document.body.getAttribute('data-scroll-position') || 0)
                : window.scrollY;

            const scrolled = currentScroll > threshold;
            setIsScrolled(scrolled);
            if (!scrolled) {
                setIsScrolledMenuOpen(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (mainBarRef.current) {
            setPlaceholderHeight(mainBarRef.current.offsetHeight);
        }
    }, [isScrolled]);

    return (
        <>
            <div ref={topBarRef}>
                <TopBar lang={lang} />
            </div>
            <div
                ref={mainBarRef}
                className={clsx(s.stickyWrapper, isScrolled && s.fixed)}
            >
                <MainBar
                    lang={lang}
                    isScrolled={isScrolled}
                    isMenuOpen={isScrolledMenuOpen}
                    onMenuToggle={() => setIsScrolledMenuOpen((v) => !v)}
                    onMenuClose={() => setIsScrolledMenuOpen(false)}
                    categories={categories}
                />
            </div>
            <div
                className={clsx(s.placeholder, isScrolled && s.visible)}
                style={{ height: placeholderHeight }}
            />
        </>
    );
}