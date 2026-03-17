import React from 'react';
import styles from './Product.module.scss';
import ProductCard from '@/app/components/ui/ProductCard/ProductCard';

interface RelatedProductsProps {
    title: string;
    products: any[];
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
