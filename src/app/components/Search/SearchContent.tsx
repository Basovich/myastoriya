import s from "./SearchContent.module.scss";
import ProductCard from "../ui/ProductCard/ProductCard";
import Button from "../ui/Button/Button";
import HeroBanner from "../ui/HeroBanner/HeroBanner";
import Breadcrumbs from "../ui/Breadcrumbs/Breadcrumbs";
import { Locale } from "@/i18n/config";

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
    const breadcrumbItems = [
        { label: "Головна", href: "/" },
        { label: "Результат" }
    ];

    return (
        <div className={s.container}>
            <HeroBanner
                prefix="ТЕКСТ ПОШУКУ:"
                title={query}
            />

            <div className={s.contentWrapper}>
                <Breadcrumbs items={breadcrumbItems} />

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
        </div>
    );
}
