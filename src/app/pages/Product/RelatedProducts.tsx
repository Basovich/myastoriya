'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import s from './Product.module.scss';
import ProductCard from '@/app/components/ui/ProductCard/ProductCard';
import clsx from 'clsx';

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
    className?: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ title, products, className }) => {
    return (
        <section className={clsx(s.relatedSection, className)}>
            <h2 className={s.sectionTitle}>{title}</h2>
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={16}
                slidesPerView={2}
                navigation
                pagination={{ clickable: true }}
                breakpoints={{
                    768: {
                        slidesPerView: 3,
                        spaceBetween: 20
                    },
                    1024: {
                        slidesPerView: 4,
                        spaceBetween: 24
                    }
                }}
                className={s.relatedSlider}
            >
                {products.map((product) => (
                    <SwiperSlide key={product.id}>
                        <ProductCard {...product} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default RelatedProducts;
