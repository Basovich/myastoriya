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
    items: TabularItem[];
}

interface TabularSection {
    title: string;
    columns: TabularColumn[];
}

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
    const sections: TabularSection[] = [];

    // 1. Resolve Wine Data from API
    const apiWineCategory = initialMenu.find(cat => {
        const name = cat.name.toLowerCase();
        return name.includes("вино") || name.includes("вина") || name.includes("wine");
    });

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
        sections.push({
            title: apiWineCategory.name.toUpperCase(),
            columns: [
                {
                    items: allWines.slice(0, midIndex)
                },
                {
                    items: allWines.slice(midIndex)
                }
            ]
        });
    }

    // 2. Resolve Drinks Data from API
    const apiDrinksCategory = initialMenu.find(cat => {
        const name = cat.name.toLowerCase();
        return name.includes("напої") || name.includes("напитки") || name.includes("кава") || name.includes("чай") || name.includes("drinks");
    });

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
        sections.push({
            title: apiDrinksCategory.name.toUpperCase(),
            columns: [
                {
                    items: allDrinks.slice(0, midIndex)
                },
                {
                    items: allDrinks.slice(midIndex)
                }
            ]
        });
    }

    if (sections.length === 0) return null;

    return (
        <div className={s.container}>
            {sections.map((section, secIdx) => (
                <div key={secIdx} className={s.section}>
                    <SectionHeader title={section.title} withDots={true} classNameWrapper={s.headerWrap} />
                    
                    <div className={s.grid}>
                        {section.columns.map((col, colIdx) => (
                            <div key={colIdx} className={s.column}>
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
