'use client';
 
import React from 'react';
import s from './Product.module.scss';
import ProductCardRow from '@/app/components/ui/ProductCardRow';
import clsx from 'clsx';
import SectionHeader from '@/app/components/ui/SectionHeader/SectionHeader';
 
interface RelatedProduct {
    id: number | string;
    title: string;
    weight: string;
    price: number;
    unit: string;
    badge?: string | null;
    image: string;
    description?: string;
}
 
interface RelatedProductsProps {
    title: string;
    products: RelatedProduct[];
    className?: string;
}
 
const RelatedProducts: React.FC<RelatedProductsProps> = ({ title, products, className }) => {
    return (
        <section className={clsx(s.relatedSection, className)}>
            <SectionHeader title={title} classNameWrapper={s.relatedHeader} />
            <div className={s.relatedGrid}>
                {products.map((product) => (
                    <ProductCardRow key={product.id} {...product} />
                ))}
            </div>
        </section>
    );
};
 
export default RelatedProducts;
