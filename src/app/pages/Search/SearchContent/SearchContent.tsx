'use client';

import s from "./SearchContent.module.scss";
import ProductCard from "../../../components/ui/ProductCard/ProductCard";
import HeroBanner from "../../../components/ui/HeroBanner/HeroBanner";
import Breadcrumbs from "../../../components/ui/Breadcrumbs/Breadcrumbs";
import CategoryCircles from "@/app/components/ui/CategoryCircles/CategoryCircles";
import Image from "next/image";
import SectionHeader from "../../../components/ui/SectionHeader/SectionHeader";
import {useSearchParams} from "next/navigation";


const MOCK_RESULTS: Product[] = [
    { id: 1, title: "М'ясні палички з сиром", price: 2500, weight: "330г / 340г / 200г", unit: "упаковка", badge: "АКЦІЯ", image: "/images/products/product-shashlik.png" },
    { id: 2, title: "М'ясні палички в соусі Теріякі", price: 2500, weight: "330г / 340г / 200г", unit: "упаковка", badge: "NEW", image: "/images/products/product-meatballs.png" },
    { id: 3, title: "Тартар з відбірної яловичини", price: 2500, weight: "330г", unit: "упаковка", badge: null, image: "/images/products/product-sticks-cheese.png" },
    { id: 4, title: "Карпачо з відбірної яловичини", price: 2500, weight: "330г", unit: "упаковка", badge: null, image: "/images/product-ribeye.jpg" },
    { id: 5, title: "Мітболи в соусі BBQ", price: 2500, weight: "200г", unit: "упаковка", badge: null, image: "/images/product-shashlik.jpg" },
    { id: 6, title: "Шашлик з баранини в пряному маринаді", price: 2500, weight: "330г", unit: "упаковка", badge: null, image: "/images/product-sticks-cheese.jpg" },
    { id: 7, title: "Томлена курка в соусі азійському", price: 2500, weight: "330г", unit: "упаковка", badge: null, image: "/images/products/product-meatballs.png" },
    { id: 8, title: "Томлена курка в соусі карі", price: 2500, weight: "330г", unit: "упаковка", badge: null, image: "/images/products/product-shashlik.png" },
];

interface Product {
    id: number;
    title: string;
    weight: string;
    price: number;
    unit: string;
    badge: string | null;
    image: string;
}

export default function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    const breadcrumbItems = [
        { label: "Головна", href: "/" },
        { label: "Результат" }
    ];

    return (
        <div className={s.container}>
            <div className={s.topSection}>
                <HeroBanner
                    prefix="ТЕКСТ ПОШУКУ:"
                    title={query}
                    className={s.heroBanner}
                />
                <div className={s.contentWrapper}>
                    <Breadcrumbs items={breadcrumbItems} className={s.breadcrumbs} />
                    <CategoryCircles title='РЕЗУЛЬТАТ ПОШУКУ ПО КАТЕГОРІЯМ' />
                    <SectionHeader title="З ЦИМ ТОВАРОМ КУПУЮТЬ" classNameWrapper={s.sectionTitle} />
                </div>
            </div>
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
                        {MOCK_RESULTS.length > 0 ? (
                            MOCK_RESULTS.map((product) => (
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
