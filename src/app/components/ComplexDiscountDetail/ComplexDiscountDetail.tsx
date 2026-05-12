"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import s from './ComplexDiscountDetail.module.scss';
import Breadcrumbs from '../ui/Breadcrumbs/Breadcrumbs';
import CountdownTimer from '../ui/CountdownTimer/CountdownTimer';
import Button from '../ui/Button/Button';
import ProductCard from '../ui/ProductCard/ProductCard';
import CartModal from '../CartModal/CartModal';
import { useAppDispatch } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { type Dictionary } from '@/i18n/types';

import { type Special, resolveProductImageUrl } from '@/lib/graphql';

interface ComplexDiscountDetailProps {
    dict: Dictionary;
    lang: string;
    initialData: Special;
}

export default function ComplexDiscountDetail({ dict, lang, initialData }: ComplexDiscountDetailProps) {
    const item = initialData;
    
    const title = item?.title ?? '';
    const endDate = item?.expiresAt ?? '';
    const discountPercent = item?.amount ? `-${item.amount}%` : '0%';
    const description = item?.description ?? '';

    const breadcrumbItems = [
        { label: dict.home.actionsPage.breadcrumbs.home, href: '/' },
        { label: dict.home.complexDiscountsPage.breadcrumbs.complexDiscounts, href: '/complex-discounts' },
        { label: title },
    ];

    // Use products from the special
    const bundleProducts = item?.products ?? [];

    // Calculate total bundle price and discounted price
    const totalPrice = bundleProducts.reduce((sum, p) => sum + (p.cost || 0), 0);
    const discountFactor = 1 - (Math.abs(parseInt(discountPercent)) / 100);
    const discountedPrice = item?.cost || Math.round(totalPrice * discountFactor);

    const dispatch = useAppDispatch();
    const [isCartOpen, setIsCartOpen] = useState(false);

    const handleAddToCart = () => {
        bundleProducts.forEach((product) => {
            dispatch(addToCart({ id: String(product.id), quantity: 1 }));
        });
        setIsCartOpen(true);
    };

    const heroImage = item?.banner?.size3x || item?.banner?.size2x || item?.banner?.size1x || 
                    item?.image?.size3x || item?.image?.size2x || item?.image?.size1x ||
                    "/images/promotions/promo-hero-bg2.png";
    
    const displayHeroImage = heroImage.startsWith('/') && !heroImage.startsWith('/images') ? `https://dev-api.myastoriya.com.ua${heroImage}` : heroImage;

    return (
        <>
            <section className={s.section}>
                <Breadcrumbs items={breadcrumbItems} className={s.breadcrumbsWrapper} />

                {/* Hero banner */}
                <div className={s.heroWrapper}>
                    <div className={s.heroImageWrapper}>
                        <Image
                            src={displayHeroImage}
                            alt={title}
                            fill
                            className={s.heroImage}
                            priority
                        />
                    </div>
                    <div className={s.timerAnchor}>
                        <CountdownTimer
                            targetDate={endDate}
                            label="До кінця акції залишилось:"
                            labelDays="Днів"
                            labelHours="Годин"
                            labelMinutes="Хвилин"
                            labelSeconds="Секунди"
                        />
                    </div>
                </div>

                {/* White content card */}
                <div className={s.card}>
                    <h1 className={s.title}>{title.toUpperCase()}</h1>
                    <p className={s.description}>
                        {description}
                    </p>

                    {/* Product set */}
                    <div className={s.productSet}>
                        {bundleProducts.map((product, idx) => {
                            let productImage = product.image?.url?.grid2x || product.image?.url?.grid1x || 
                                              product.images?.[0]?.url?.grid2x || product.images?.[0]?.url?.grid1x || "";
                            if (productImage && productImage.startsWith('/')) {
                                productImage = `https://dev-api.myastoriya.com.ua${productImage}`;
                            }
                            return (
                                <React.Fragment key={product.id}>
                                    <div className={s.productCardWrapper}>
                                        <ProductCard
                                            id={product.id}
                                            title={product.name}
                                            weight={""}
                                            price={product.cost || 0}
                                            unit={product.unit || "кг"}
                                            badge={null}
                                            image={productImage}
                                        lang="ua" />
                                </div>
                                {idx < bundleProducts.length - 1 && (
                                    <span className={s.plus}>+</span>
                                )}
                            </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Discount summary */}
                    <div className={s.discountBlock}>
                        <span className={s.discountLabel}>При купівлі разом ви отримуєте знижку</span>
                        <div className={s.discountValues}>
                            <div className={s.discountItem}>
                                <span className={s.discountTitle}>Знижка</span>
                                <span className={s.discountPercent}>{discountPercent}</span>
                            </div>
                            <div className={s.discountItem}>
                                <span className={s.originalPrice}>{totalPrice.toLocaleString('uk-UA')} ₴</span>
                                <span className={s.discountPrice}>{discountedPrice.toLocaleString('uk-UA')} ₴</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className={s.ctaWrapper}>
                        <Button
                            variant="black"
                            className={s.ctaButton}
                            onClick={handleAddToCart}
                        >
                            ДОДАТИ ДО КОШИКА
                        </Button>
                    </div>
                </div>
            </section>
            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
