import React from "react";
import s from "./StoreMenuTabular.module.scss";
import { ElectronicMenuCategory } from "@/lib/graphql/queries/pages/restaurantMenu";
import SectionHeader from "@/app/components/ui/SectionHeader/SectionHeader";

interface StoreMenuTabularProps {
    electronicMenu?: ElectronicMenuCategory[];
}

function getSubcategoryHeaderInfo(category: ElectronicMenuCategory) {
    let title = (category.name || "").trim();
    let volume = (category.volume || "").trim();

    if (!volume) {
        // Check if name has volume in parentheses like "(100 мл)"
        const volMatch = title.match(/\(([^)]*(?:мл|л|г))\)/i);
        if (volMatch) {
            volume = volMatch[1].trim();
            title = title.replace(/\([^)]*\)/, "").trim();
        } else {
            // Check if name has "(пляшка)" or "(келих)"
            const bottleOrGlass = title.match(/\((?:пляшка|келих)\)/i);
            if (bottleOrGlass) {
                const firstVol = category.products?.[0]?.volume?.trim();
                const allSameVolume = 
                    Boolean(category.products?.length) && 
                    category.products.every(p => p.volume?.trim() === firstVol);
                if (allSameVolume && firstVol) {
                    volume = firstVol;
                    title = title.replace(/\([^)]*\)/, "").trim();
                }
            }
        }
    }

    return {
        title,
        volume,
        subtitle: (category.subtitle || "").trim()
    };
}

export default function StoreMenuTabular({ electronicMenu = [] }: StoreMenuTabularProps) {
    const validCategories = electronicMenu.filter((category) => {
        const hasDirectProducts = Boolean(category.products && category.products.length > 0);
        const hasChildProducts = Boolean(
            category.children && category.children.some(c => c.products && c.products.length > 0)
        );
        return hasDirectProducts || hasChildProducts;
    });

    if (validCategories.length === 0) return null;

    return (
        <div className={s.wrapper}>
            <div className={s.container}>
                {validCategories.map((category) => {
                const hasChildren = Boolean(
                    category.children && category.children.some(c => c.products && c.products.length > 0)
                );

                return (
                    <section key={category.id} id={`electronic-${category.id}`} className={s.section}>
                        <div className={s.headerWrapContainer}>
                            <SectionHeader 
                                title={category.name.toUpperCase()} 
                                withDots={true} 
                                classNameWrapper={s.headerWrap} 
                            />
                        </div>

                        {hasChildren ? (
                            <div className={s.grid}>
                                {category.children?.map((child) => {
                                    if (!child.products || child.products.length === 0) return null;
                                    const { title, volume, subtitle } = getSubcategoryHeaderInfo(child);

                                    return (
                                        <div key={child.id} className={s.column}>
                                            <div className={s.categorySubheader}>
                                                <span className={s.subTitle}>{title}</span>
                                                {volume && (
                                                    <>
                                                        <span className={s.subheaderSlash}>/</span>
                                                        <span className={s.subVolume}>{volume}</span>
                                                    </>
                                                )}
                                                {subtitle && (
                                                    <>
                                                        <span className={s.subheaderSlash}>/</span>
                                                        <span className={s.subText}>{subtitle}</span>
                                                    </>
                                                )}
                                            </div>

                                            <div className={s.list}>
                                                {child.products.map((product) => {
                                                    const prodVolume = product.volume?.trim();
                                                    const showVolume = Boolean(prodVolume && prodVolume !== volume);

                                                    return (
                                                        <div key={product.id} className={s.item}>
                                                            <div className={s.headerRow}>
                                                                <div className={s.itemNameWrapper}>
                                                                    <span className={s.itemName}>{product.name}</span>
                                                                    {showVolume && (
                                                                        <>
                                                                            <span className={s.slash}>/</span>
                                                                            <span className={s.productVolume}>{prodVolume}</span>
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
                                    );
                                })}
                            </div>
                        ) : (
                            /* Direct products without children (e.g. bakery) split into 2 columns */
                            <div className={s.grid}>
                                {(() => {
                                    const products = category.products || [];
                                    const midIndex = Math.ceil(products.length / 2);
                                    const columns = [
                                        products.slice(0, midIndex),
                                        products.slice(midIndex)
                                    ];

                                    return columns.map((colProducts, colIdx) => (
                                        <div key={colIdx} className={s.column}>
                                            <div className={s.list}>
                                                {colProducts.map((product) => {
                                                    const prodVolume = product.volume?.trim();
                                                    return (
                                                        <div key={product.id} className={s.item}>
                                                            <div className={s.headerRow}>
                                                                <div className={s.itemNameWrapper}>
                                                                    <span className={s.itemName}>{product.name}</span>
                                                                    {prodVolume && (
                                                                        <>
                                                                            <span className={s.slash}>/</span>
                                                                            <span className={s.productVolume}>{prodVolume}</span>
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
                                    ));
                                })()}
                            </div>
                        )}
                    </section>
                );
            })}
            </div>
        </div>
    );
}
