import React from "react";
import s from "./StoreMenuTabular.module.scss";
import { ShopCustomMenuCategory } from "@/lib/graphql/queries/pages/restaurantMenu";
import SectionHeader from "@/app/components/ui/SectionHeader/SectionHeader";

interface StoreMenuTabularProps {
    customMenu?: ShopCustomMenuCategory[];
}

export default function StoreMenuTabular({ customMenu = [] }: StoreMenuTabularProps) {
    if (customMenu.length === 0) return null;

    return (
        <div className={s.container}>
            {customMenu.map((category) => {
                if (!category.products || category.products.length === 0) return null;

                // Split products into two columns half-and-half
                const midIndex = Math.ceil(category.products.length / 2);
                const columns = [
                    category.products.slice(0, midIndex),
                    category.products.slice(midIndex)
                ];

                const hasSubtitle = category.subtitle && category.subtitle.trim() !== "";
                const hasCategoryVolume = category.volume && category.volume.trim() !== "";

                return (
                    <div key={category.id} className={s.section}>
                        <div className={s.headerWrapContainer}>
                            <SectionHeader title={category.name.toUpperCase()} withDots={true} classNameWrapper={s.headerWrap} />
                            {(hasSubtitle || hasCategoryVolume) && (
                                <div className={s.categorySubheader}>
                                    {hasSubtitle && <span className={s.subText}>{category.subtitle}</span>}
                                    {hasSubtitle && hasCategoryVolume && <span className={s.subheaderSlash}>/</span>}
                                    {hasCategoryVolume && <span className={s.subText}>{category.volume}</span>}
                                </div>
                            )}
                        </div>
                        
                        <div className={s.grid}>
                            {columns.map((colProducts, colIdx) => (
                                <div key={colIdx} className={s.column}>
                                    <div className={s.list}>
                                        {colProducts.map((product) => {
                                            const hasVolume = product.volume && product.volume.trim() !== "";
                                            return (
                                                <div key={product.id} className={s.item}>
                                                    <div className={s.headerRow}>
                                                        <div className={s.itemNameWrapper}>
                                                            <h5 className={s.itemName}>{product.name}</h5>
                                                            {hasVolume && (
                                                                <>
                                                                    <span className={s.slash}>/</span>
                                                                    <span className={s.productVolume}>{product.volume}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className={s.leader} />
                                                        <span className={s.price}>
                                                            {product.price} ₴
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
