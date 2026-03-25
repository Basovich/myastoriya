import React from 'react';
import styles from './Product.module.scss';
import ProductCard from '@/app/components/ui/ProductCard/ProductCard';

interface RelatedProduct {
    id: number | string;
    title: string;
    weight: string;
    price: number;
    unit: string;
    badge?: string | null;
    image: string;
}

interface RelatedProductsProps {
    title: string;
    products: RelatedProduct[];
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ title, products }) => {
    return (
        <section className={styles.relatedSection}>
            <h2 className={styles.sectionTitle}>{title}</h2>
            <div className={styles.relatedGrid}>
                {products.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
        </section>
    );
};

export default RelatedProducts;
