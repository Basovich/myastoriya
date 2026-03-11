import s from "./SearchContent.module.scss";
import ProductCard from "../ui/ProductCard/ProductCard";
import HeroBanner from "../ui/HeroBanner/HeroBanner";
import Breadcrumbs from "../ui/Breadcrumbs/Breadcrumbs";
import CategoryCircles, { CategoryCircleItem } from "../ui/CategoryCircles/CategoryCircles";
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
    const breadcrumbItems = [
        { label: "Головна", href: "/" },
        { label: "Результат" }
    ];

    const searchCategories: CategoryCircleItem[] = [
        { name: "Сезонне меню", image: "/images/cat-grill.png", href: "#" },
        { name: "Ресторанне меню", image: "/images/cat-restaurant.png", href: "#" },
        { name: "Бургери", image: "/images/cat-burgers.png", href: "#" },
        { name: "Шашлик", image: "/images/cat-shashlik.png", href: "#" },
        { name: "Смакуй одразу", image: "/images/cat-sets.png", href: "#" },
        { name: "Набори для компаній", image: "/images/cat-branded.png", href: "#" },
    ];

    return (
        <div className={s.container}>
            {/* White background section: banner + categories */}
            <div className={s.topSection}>
                <HeroBanner
                    prefix="ТЕКСТ ПОШУКУ:"
                    title={query}
                />

                <div className={s.contentWrapper}>
                    <Breadcrumbs items={breadcrumbItems} />

                    <CategoryCircles
                        title="РЕЗУЛЬТАТ ПОШУКУ ПО КАТЕГОРІЯМ"
                        items={searchCategories}
                    />
                </div>
            </div>

            {/* Grey background section: products grid */}
            <div className={s.productsSection}>
                <Image
                    src="/images/products/products-bg-logo.svg"
                    alt=""
                    width={786}
                    height={1011}
                    className={s.bgLogo}
                    aria-hidden="true"
                />
                <div className={s.productsInner}>
                    <div className={s.resultsGrid}>
                        {results.length > 0 ? (
                            results.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
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
                </div>
            </div>
        </div>
    );
}
