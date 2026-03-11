"use client";

import { useSearchParams } from "next/navigation";
import { use, useState, useEffect } from "react";
import Header from "@/app/components/Header/Header";
import {Locale} from "@/i18n/config";
import SearchContent from "@/app/pages/Search/SearchContent/SearchContent";
import Footer from "@/app/components/Footer/Footer";

const MOCK_RESULTS = [
    { id: 1, title: "М'ясні палички з сиром", price: 2500, weight: "330г / 340г / 200г", unit: "упаковка", badge: "АКЦІЯ", image: "/images/products/product-shashlik.png" },
    { id: 2, title: "М'ясні палички в соусі Теріякі", price: 2500, weight: "330г / 340г / 200г", unit: "упаковка", badge: "NEW", image: "/images/products/product-meatballs.png" },
    { id: 3, title: "Тартар з відбірної яловичини", price: 2500, weight: "330г", unit: "упаковка", badge: null, image: "/images/products/product-sticks-cheese.png" },
    { id: 4, title: "Карпачо з відбірної яловичини", price: 2500, weight: "330г", unit: "упаковка", badge: null, image: "/images/product-ribeye.jpg" },
    { id: 5, title: "Мітболи в соусі BBQ", price: 2500, weight: "200г", unit: "упаковка", badge: null, image: "/images/product-shashlik.jpg" },
    { id: 6, title: "Шашлик з баранини в пряному маринаді", price: 2500, weight: "330г", unit: "упаковка", badge: null, image: "/images/product-sticks-cheese.jpg" },
    { id: 7, title: "Томлена курка в соусі азійському", price: 2500, weight: "330г", unit: "упаковка", badge: null, image: "/images/products/product-meatballs.png" },
    { id: 8, title: "Томлена курка в соусі карі", price: 2500, weight: "330г", unit: "упаковка", badge: null, image: "/images/products/product-shashlik.png" },
];

const CATEGORIES = ["Всі", "Сира продукція", "Готова продукція", "Стейки", "Бургери", "Набори"];

export default function Search({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = use(params);
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    const [activeCategory, setActiveCategory] = useState("Всі");
    const [results, setResults] = useState(MOCK_RESULTS);

    useEffect(() => {
        // Filter logic simulation
        if (activeCategory === "Всі") {
            setResults(MOCK_RESULTS);
        } else {
            setResults(MOCK_RESULTS.slice(0, 3)); // Dummy filter
        }
    }, [activeCategory]);

    return (
        <>
            <Header lang={lang as Locale} />
            <main style={{ minHeight: "100vh" }}>
                <SearchContent
                    lang={lang as Locale}
                    query={query}
                    results={results}
                    categories={CATEGORIES}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />
            </main>
            <Footer lang={lang as Locale} />
        </>
    )
}