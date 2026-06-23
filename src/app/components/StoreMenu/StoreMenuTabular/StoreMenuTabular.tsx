import React from "react";
import s from "./StoreMenuTabular.module.scss";
import { RestaurantMenuCategory } from "@/lib/graphql/queries/pages/restaurantMenu";
import SectionHeader from "@/app/components/ui/SectionHeader/SectionHeader";

interface StoreMenuTabularProps {
    initialMenu?: RestaurantMenuCategory[];
}

interface TabularItem {
    name: string;
    description?: string;
    price: number;
}

interface TabularColumn {
    title: string;
    items: TabularItem[];
}

interface TabularSection {
    title: string;
    columns: TabularColumn[];
}

// Mock data matching the design screenshots as fallbacks
const MOCK_WINES: TabularSection = {
    title: "ВИНА",
    columns: [
        {
            title: "ЧЕРВОНІ / 100 мл",
            items: [
                { name: "ZINFANDEL", description: "Сухе, Zinfandel, USA", price: 145 },
                { name: "ZINFANDEL", description: "Сухе, Zinfandel, USA", price: 145 },
                { name: "ZINFANDEL", description: "Сухе, Zinfandel, USA", price: 145 },
                { name: "ZINFANDEL", description: "Сухе, Zinfandel, USA", price: 145 },
                { name: "ZINFANDEL", description: "Сухе, Zinfandel, USA", price: 145 },
                { name: "ZINFANDEL", description: "Сухе, Zinfandel, USA", price: 145 },
                { name: "ZINFANDEL", description: "Сухе, Zinfandel, USA", price: 145 }
            ]
        },
        {
            title: "ЧЕРВОНІ / 750 мл",
            items: [
                { name: "RESERVE DE L'AUBE PERE ANSELME SYRAH-MERLOT", description: "Сухе, Zinfandel, USA", price: 145 },
                { name: "RESERVE DE L'AUBE PERE ANSELME SYRAH-MERLOT", description: "Сухе, Zinfandel, USA", price: 145 },
                { name: "RESERVE DE L'AUBE PERE ANSELME SYRAH-MERLOT", description: "Сухе, Zinfandel, USA", price: 145 },
                { name: "ZINFANDEL", description: "Сухе, Zinfandel, USA", price: 145 },
                { name: "ZINFANDEL", description: "Сухе, Zinfandel, USA", price: 145 },
                { name: "ZINFANDEL", description: "Сухе, Zinfandel, USA", price: 145 },
                { name: "ZINFANDEL", description: "Сухе, Zinfandel, USA", price: 145 }
            ]
        }
    ]
};

const MOCK_DRINKS: TabularSection = {
    title: "НАПОЇ",
    columns: [
        {
            title: "КАВА",
            items: [
                { name: "КАПУЧІНО / 50 мл", price: 60 },
                { name: "КАПУЧІНО / 50 мл", price: 60 },
                { name: "КАПУЧІНО / 50 мл", price: 60 },
                { name: "КАПУЧІНО / 50 мл", price: 60 },
                { name: "КАПУЧІНО / 50 мл", price: 60 },
                { name: "КАПУЧІНО / 50 мл", price: 60 },
                { name: "КАПУЧІНО / 50 мл", price: 60 },
                { name: "КАПУЧІНО / 50 мл", price: 60 }
            ]
        },
        {
            title: "КАВА",
            items: [
                { name: "КАПУЧІНО НА РОСЛИННОМУ МОЛОЦІ / 50 мл", price: 60 },
                { name: "КАПУЧІНО НА РОСЛИННОМУ МОЛОЦІ / 50 мл", price: 60 },
                { name: "КАПУЧІНО НА РОСЛИННОМУ МОЛОЦІ / 50 мл", price: 60 },
                { name: "КАПУЧІНО НА РОСЛИННОМУ МОЛОЦІ / 50 мл", price: 60 },
                { name: "КАПУЧІНО НА РОСЛИННОМУ МОЛОЦІ / 50 мл", price: 60 },
                { name: "КАПУЧІНО НА РОСЛИННОМУ МОЛОЦІ / 50 мл", price: 60 },
                { name: "КАПУЧІНО НА РОСЛИННОМУ МОЛОЦІ / 50 мл", price: 60 }
            ]
        }
    ]
};

const getTabularPortionText = (p: { portionSize: string | null; unit: string | null; multiplier: number | null }) => {
    if (p.unit !== null && p.unit !== undefined && p.multiplier !== null && p.multiplier !== undefined) {
        const unitLower = p.unit.trim().toLowerCase();
        const multiplier = p.multiplier;
        
        if (unitLower === '100 г' || unitLower === '100г') {
            return multiplier > 0 ? `${Math.round(multiplier * 1000)} г` : '';
        }
        if (unitLower === '100 мл') {
            return multiplier > 0 ? `${Math.round(multiplier * 1000)} мл` : '';
        }
        if (unitLower === 'шт' || unitLower === '1 шт') {
            return '1 шт';
        }
        if (unitLower === 'уп' || unitLower === 'упаковка') {
            return '1 уп';
        }
        return `1 ${p.unit}`;
    }
    return p.portionSize || '';
};

export default function StoreMenuTabular({ initialMenu = [] }: StoreMenuTabularProps) {
    // 1. Resolve Wine Data from API or Fallback
    const apiWineCategory = initialMenu.find(cat => {
        const name = cat.name.toLowerCase();
        return name.includes("вино") || name.includes("вина") || name.includes("wine");
    });

    let wineSection: TabularSection = MOCK_WINES;
    if (apiWineCategory && apiWineCategory.products.length > 0) {
        // Map API products to TabularItems
        const allWines: TabularItem[] = apiWineCategory.products.map(p => {
            const portion = getTabularPortionText(p);
            return {
                name: p.name,
                description: portion || undefined,
                price: p.cost
            };
        });

        // Split wines into two columns (100ml / 750ml or simple half/half)
        const midIndex = Math.ceil(allWines.length / 2);
        wineSection = {
            title: apiWineCategory.name.toUpperCase(),
            columns: [
                {
                    title: "ЧЕРВОНІ / 100 мл",
                    items: allWines.slice(0, midIndex)
                },
                {
                    title: "ЧЕРВОНІ / 750 мл",
                    items: allWines.slice(midIndex)
                }
            ]
        };
    }

    // 2. Resolve Drinks Data from API or Fallback
    const apiDrinksCategory = initialMenu.find(cat => {
        const name = cat.name.toLowerCase();
        return name.includes("напої") || name.includes("напитки") || name.includes("кава") || name.includes("чай") || name.includes("drinks");
    });

    let drinksSection: TabularSection = MOCK_DRINKS;
    if (apiDrinksCategory && apiDrinksCategory.products.length > 0) {
        const allDrinks: TabularItem[] = apiDrinksCategory.products.map(p => {
            const portion = getTabularPortionText(p);
            return {
                name: p.name + (portion ? ` / ${portion}` : ""),
                description: undefined,
                price: p.cost
            };
        });

        const midIndex = Math.ceil(allDrinks.length / 2);
        drinksSection = {
            title: apiDrinksCategory.name.toUpperCase(),
            columns: [
                {
                    title: "НАПОЇ",
                    items: allDrinks.slice(0, midIndex)
                },
                {
                    title: "НАПОЇ",
                    items: allDrinks.slice(midIndex)
                }
            ]
        };
    }

    const sections = [wineSection, drinksSection];

    // Helper to render subheading with red slash
    const renderSubheading = (titleStr: string) => {
        if (titleStr.includes("/")) {
            const parts = titleStr.split("/");
            return (
                <h4 className={s.subheading}>
                    {parts[0]} <span>/</span> {parts[1]}
                </h4>
            );
        }
        return <h4 className={s.subheading}>{titleStr}</h4>;
    };

    return (
        <div className={s.container}>
            {sections.map((section, secIdx) => (
                <div key={secIdx} className={s.section}>
                    <SectionHeader title={section.title} withDots={true} />
                    
                    <div className={s.grid}>
                        {section.columns.map((col, colIdx) => (
                            <div key={colIdx} className={s.column}>
                                {renderSubheading(col.title)}
                                <div className={s.list}>
                                    {col.items.map((item, itemIdx) => (
                                        <div key={itemIdx} className={s.item}>
                                            <div className={s.headerRow}>
                                                <h5 className={s.itemName}>{item.name}</h5>
                                                <div className={s.leader} />
                                                <span className={s.price}>{item.price} ₴</span>
                                            </div>
                                            {item.description && (
                                                <p className={s.description}>{item.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
