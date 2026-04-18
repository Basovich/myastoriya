"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Button from "@/app/components/ui/Button/Button";
import s from "../CatalogContent/CatalogContent.module.scss";

interface CatalogPaginationProps {
    currentPage: number;
    hasMorePages: boolean;
}

export default function CatalogPaginationClient({
    currentPage,
    hasMorePages,
}: CatalogPaginationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (!hasMorePages) return null;

    const handleLoadMore = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", (currentPage + 1).toString());
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className={s.showMoreWrap}>
            <Button variant="outline-black" onClick={handleLoadMore}>
                <span className={s.showMoreText}>ПОКАЗАТИ ЩЕ</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </Button>
        </div>
    );
}
