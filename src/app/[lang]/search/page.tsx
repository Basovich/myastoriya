"use client";

import { useSearchParams } from "next/navigation";
import { use, useState, useEffect } from "react";
import SearchContent from "@/app/components/Search/SearchContent";
import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import { Locale } from "@/i18n/config";

const MOCK_RESULTS = [
    { id: 1, title: "Стейк Рібай Dry-aged гриль - М'ясторія", price: 1260, weight: "330г / 340г / 200г", unit: "упаковка", badge: "SALE", image: "/images/products/product-shashlik.png" },
    { id: 2, title: "Стейк Рібай на кістці Dry-aged гриль - М'ясторія", price: 4200, weight: "330г / 340г / 200г", unit: "упаковка", badge: null, image: "/images/products/product-meatballs.png" },
    { id: 3, title: "Стейк Рібай Dry-aged гриль - М'ясторія", price: 5500, weight: "330г / 340г / 200г", unit: "упаковка", badge: "NEW", image: "/images/products/product-sticks-cheese.png" },
    { id: 4, title: "Тартар з відбірної яловичини", price: 2500, weight: "200г", unit: "упаковка", badge: null, image: "/images/product-ribeye.jpg" },
    { id: 5, title: "Карпачо з відбірної яловичини", price: 2500, weight: "200г", unit: "упаковка", badge: null, image: "/images/product-shashlik.jpg" },
    { id: 6, title: "М'ясні палички з сиром", price: 2500, weight: "330г", unit: "упаковка", badge: "HOT", image: "/images/product-sticks-cheese.jpg" },
    { id: 7, title: "Стейк Ті-боун витриманий", price: 3200, weight: "500г", unit: "упаковка", badge: null, image: "/images/products/product-meatballs.png" },
    { id: 8, title: "Філе-міньйон гриль", price: 1500, weight: "250г", unit: "упаковка", badge: "SALE", image: "/images/products/product-shashlik.png" },
];

const CATEGORIES = ["Всі", "Сира продукція", "Готова продукція", "Стейки", "Бургери", "Набори"];

export default function SearchPage({ params }: { params: Promise<{ lang: string }> }) {
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
            <main style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
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
    );
}
