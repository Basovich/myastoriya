import s from "./SearchContent.module.scss";
import ProductCard from "../ui/ProductCard/ProductCard";
import Button from "../ui/Button/Button";
import HeroBanner from "../ui/HeroBanner/HeroBanner";
import { Locale } from "@/i18n/config";
import Image from "next/image";

interface Product {
    id: number;
    title: string;
    weight: string;
    price: number;
    unit: string;
    badge: string | null;
    image: string;
}

interface SearchContentProps {
    lang: Locale;
    query: string;
    results: Product[];
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export default function SearchContent({
    lang,
    query,
    results,
    categories,
    activeCategory,
    onCategoryChange
}: SearchContentProps) {
    return (
        <div className={s.container}>
            <nav className={s.breadcrumbs}>
                <span>Головна</span>
                <span className={s.separator}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
                <span className={s.current}>Результат</span>
            </nav>

            <HeroBanner
                prefix="ТЕКСТ ПОШУКУ:"
                title={query}
            />

            <div className={s.filtersWrapper}>
                <div className={s.filters}>
                    {categories.map((cat) => (
                        <Button
                            key={cat}
                            variant="pill"
                            active={activeCategory === cat}
                            onClick={() => onCategoryChange(cat)}
                            className={s.filterBtn}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            <div className={s.resultsGrid}>
                {results.length > 0 ? (
                    results.map((product) => (
                        <ProductCard
                            key={product.id}
                            title={product.title}
                            weight={product.weight}
                            price={product.price}
                            unit={product.unit}
                            badge={product.badge}
                            image={product.image}
                        />
                    ))
                ) : (
                    <div className={s.noResults}>Товарів не знайдено</div>
                )}
            </div>

            {results.length > 0 && (
                <div className={s.pagination}>
                    <Button variant="pill" className={s.loadMore}>
                        ПОКАЗАТИ ЩЕ
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '8px' }}>
                            <path d="M7 13L12 18L17 13M7 6L12 11L17 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Button>
                </div>
            )}
        </div>
    );
}
