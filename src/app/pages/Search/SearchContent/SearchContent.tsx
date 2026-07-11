'use client';

import s from "./SearchContent.module.scss";
import ProductCard from "../../../components/ui/ProductCard/ProductCard";
import HeroBanner from "../../../components/ui/HeroBanner/HeroBanner";
import Breadcrumbs from "../../../components/ui/Breadcrumbs/Breadcrumbs";
import CategoryCircles from "@/app/components/CategoryCircles/CategoryCircles";
import Image from "next/image";
import SectionHeader from "../../../components/ui/SectionHeader/SectionHeader";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getLocalizedHref } from "@/utils/i18n-helpers";
import { Locale } from "@/i18n/config";
import { 
    getProductsApi, 
    getCatalogTreeApi,
    resolveProductImageUrl, 
    resolveCategoryImageUrl,
    Product as ApiProduct,
    ProductCategory,
    getProductWeight,
    getProductBadge
} from "@/lib/graphql";

export default function SearchContent() {
    const searchParams = useSearchParams();
    const { lang } = useParams();
    const query = searchParams.get("q") || "";

    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!query) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const prodRes = await getProductsApi({ search: query, limit: 100 }, String(lang));
                setProducts(prodRes.data);

                const productCategoryIds = new Set(
                    prodRes.data
                        .map(p => p.categoryId ? String(p.categoryId) : "")
                        .filter(Boolean)
                );

                const queryWords = query.toLowerCase().split(/[\s'.,!?()«»"]+/).filter(w => w.length >= 3);
                const productWords = prodRes.data.map(p => p.name.toLowerCase()).join(" ").split(/[\s'.,!?()«»"]+/).filter(w => w.length >= 3);
                const contextWords = Array.from(new Set([...queryWords, ...productWords]));

                const isWordMatch = (w1: string, w2: string) => {
                    const minLen = Math.min(w1.length, w2.length);
                    if (minLen < 3) return false;
                    const matchLen = minLen >= 5 ? 4 : 3;
                    return w1.slice(0, matchLen) === w2.slice(0, matchLen);
                };

                const filterTree = (list: ProductCategory[], parentName?: string): ProductCategory[] => {
                    const matches: ProductCategory[] = [];
                    for (const cat of list) {
                        const productMatch = productCategoryIds.has(String(cat.id));
                        
                        let nameMatch = false;
                        if (parentName) {
                            const parentWords = parentName.toLowerCase().split(/[\s'.,!?()«»"]+/).filter(w => w.length >= 3);
                            const catWords = cat.name.toLowerCase().split(/[\s'.,!?()«»"]+/).filter(w => w.length >= 3);
                            const specificWords = catWords.filter(catW => 
                                !parentWords.some(parentW => isWordMatch(catW, parentW))
                            );
                            
                            if (specificWords.length > 0) {
                                nameMatch = specificWords.some(specW => 
                                    contextWords.some(ctxW => isWordMatch(specW, ctxW))
                                );
                            } else {
                                nameMatch = true;
                            }
                        } else {
                            const catWords = cat.name.toLowerCase().split(/[\s'.,!?()«»"]+/).filter(w => w.length >= 3);
                            nameMatch = catWords.some(catW => 
                                contextWords.some(ctxW => isWordMatch(catW, ctxW))
                            );
                        }
                        
                        const isMatched = productMatch || nameMatch;
                        const childMatches = cat.children ? filterTree(cat.children, cat.name) : [];
                        
                        if (isMatched || childMatches.length > 0) {
                            matches.push({
                                ...cat,
                                children: childMatches
                            });
                        }
                    }
                    return matches;
                };

                const tree = await getCatalogTreeApi(String(lang));
                setCategories(filterTree(tree));
            } catch (error) {
                console.error("Search page fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [query, lang]);

    const breadcrumbItems = [
        { label: "Головна", href: "/" },
        { label: "Результат" }
    ];

    const categoryCircleItems = (() => {
        const items: { name: string; image: string; href: string }[] = [];
        const process = (list: ProductCategory[], parentSlug?: string) => {
            list.forEach(cat => {
                // Determine href based on available parent context
                let href: string;
                if (parentSlug) {
                    // Level 2: /{parentSlug}/{slug}  or level 3: /catalog/{slug}
                    href = `/catalog/${cat.slug}`;
                } else {
                    // Level 1: /{slug}
                    href = `/${cat.slug}`;
                }
                items.push({
                    name: cat.name,
                    image: resolveCategoryImageUrl(cat) || "/images/product-placeholder.svg",
                    href: getLocalizedHref(href, (lang as Locale) || "ua")
                });
                if (cat.children && cat.children.length > 0) {
                    process(cat.children, cat.slug);
                }
            });
        };
        process(categories);
        return items;
    })();

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
                    {categories.length > 0 && (
                        <CategoryCircles 
                            title='РЕЗУЛЬТАТ ПОШУКУ ПО КАТЕГОРІЯМ' 
                            categories={categoryCircleItems}
                        />
                    )}
                    <SectionHeader title="РЕЗУЛЬТАТ ПОШУКУ ТОВАРІВ" classNameWrapper={s.sectionTitle} />
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
                        {isLoading ? (
                             <div className={s.loading}>Завантаження...</div>
                        ) : products.length > 0 ? (
                            products.map((product) => {
                                const weight = getProductWeight(product);

                                return (
                                    <ProductCard
                                        key={product.id}
                                        id={product.id}
                                        slug={product.slug}
                                        title={product.name}
                                        weight={weight}
                                        price={product.cost}
                                        oldPrice={product.oldCost ?? undefined}
                                        unit={product.unit}
                                        badge={getProductBadge(product, String(lang))}
                                        image={resolveProductImageUrl(product)}
                                        lang={String(lang)} 
                                        hasCostVariants={product.hasCostVariants}
                                    />
                                );
                            })
                        ) : (
                            <div className={s.noResults}>Товарів не знайдено</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
