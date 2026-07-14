"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import s from './ComplexDiscountDetail.module.scss';
import Breadcrumbs from '../ui/Breadcrumbs/Breadcrumbs';
import CountdownTimer from '../ui/CountdownTimer/CountdownTimer';
import Button from '../ui/Button/Button';
import ProductCard from '../ui/ProductCard/ProductCard';
import CartModal from '../CartModal/CartModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCartAsync } from '@/store/slices/cartSlice';

import { type Special, getProductWeight, getProductBadge } from '@/lib/graphql';

const LOCALIZED_TEXTS = {
    ua: {
        breadcrumbs: {
            home: "Головна",
            complexDiscounts: "Комплексні знижки"
        },
        countdown: {
            label: "До кінця акції залишилось:",
            days: "Днів",
            hours: "Годин",
            minutes: "Хвилин",
            seconds: "Секунди"
        },
        buyTogetherDiscount: "При купівлі разом ви отримуєте знижку",
        discount: "Знижка",
        addToCart: "ДОДАТИ ДО КОШИКА",
        addingToCart: "ДОДАВАННЯ...",
        noProducts: "Товари для цієї комплексної знижки відсутні у вашому місті"
    },
    ru: {
        breadcrumbs: {
            home: "Главная",
            complexDiscounts: "Комплексные скидки"
        },
        countdown: {
            label: "До окончания акции осталось:",
            days: "Дней",
            hours: "Часов",
            minutes: "Минут",
            seconds: "Секунд"
        },
        buyTogetherDiscount: "При покупке вместе вы получаете скидку",
        discount: "Скидка",
        addToCart: "ДОБАВИТЬ В КОРЗИНУ",
        addingToCart: "ДОБАВЛЕНИЕ...",
        noProducts: "Товары для этой комплексной скидки отсутствуют в вашем городе"
    }
};

interface ComplexDiscountDetailProps {
    lang: string;
    initialData: Special;
}

export default function ComplexDiscountDetail({ lang, initialData }: ComplexDiscountDetailProps) {
    const item = initialData;
    
    const title = item?.title ?? '';
    const endDate = item?.expiresAt ?? '';
    const discountPercent = item?.amount ? `-${item.amount}%` : '0%';
    const description = item?.description ?? '';

    const texts = LOCALIZED_TEXTS[lang === 'ru' ? 'ru' : 'ua'];

    const breadcrumbItems = [
        { label: texts.breadcrumbs.home, href: '/' },
        { label: texts.breadcrumbs.complexDiscounts, href: '/complex-discounts' },
        { label: title },
    ];

    // Use products from the special
    const bundleProducts = item?.products ?? [];

    // Calculate total bundle price and discounted price
    const totalPrice = bundleProducts.reduce((sum, p) => sum + ((p.purchaseOldCost ?? p.purchaseCost ?? p.cost) || 0), 0);
    const discountFactor = 1 - (Math.abs(parseInt(discountPercent)) / 100);
    const discountedPrice = item?.cost || Math.round(totalPrice * discountFactor);

    const dispatch = useAppDispatch();
    const cartItems = useAppSelector(state => state.cart.items);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = () => {
        // Find which products from the bundle are not in the cart yet
        const existingIds = new Set(cartItems.map(item => String(item.id)));
        const productsToAdd = bundleProducts.filter(p => !existingIds.has(String(p.id)));

        if (productsToAdd.length === 0) {
            setIsCartOpen(true);
            return;
        }

        setIsAdding(true);

        // Add missing products sequentially, THEN open the cart.
        // This ensures the cart opens only after all items are in Redux state,
        // avoiding the partial-item display issue.
        (async () => {
            try {
                for (const product of productsToAdd) {
                    await dispatch(addToCartAsync({
                        id: String(product.id),
                        quantity: 1,
                    })).unwrap();
                }
            } catch (error) {
                console.error('[ComplexDiscountDetail] Failed to add bundle items:', error);
            } finally {
                setIsAdding(false);
                setIsCartOpen(true);
            }
        })();
    };

    const heroImage = item?.banner?.original || item?.banner?.size3x || item?.banner?.size2x || item?.banner?.size1x || 
                    item?.image?.original || item?.image?.size3x || item?.image?.size2x || item?.image?.size1x ||
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
                            label={texts.countdown.label}
                            labelDays={texts.countdown.days}
                            labelHours={texts.countdown.hours}
                            labelMinutes={texts.countdown.minutes}
                            labelSeconds={texts.countdown.seconds}
                        />
                    </div>
                </div>

                {/* White content card */}
                <div className={s.card}>
                    <h1 className={s.title}>{title.toUpperCase()}</h1>
                    <p className={s.description}>
                        {description}
                    </p>

                    {bundleProducts.length === 0 ? (
                        <div className={s.noProductsWrapper}>
                            <p className={s.noProductsText}>{texts.noProducts}</p>
                        </div>
                    ) : (
                        <>
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
                                                    slug={product.slug}
                                                    title={product.name}
                                                    weight={getProductWeight(product)}
                                                    price={product.purchaseCost ?? product.cost ?? 0}
                                                    oldPrice={product.purchaseOldCost ?? product.oldCost ?? undefined}
                                                    unit={product.unit || "кг"}
                                                    badge={getProductBadge(product, lang)}
                                                    image={productImage}
                                                    lang={lang}
                                                    hasCostVariants={product.hasCostVariants}
                                                />
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
                                <span className={s.discountLabel}>{texts.buyTogetherDiscount}</span>
                                <div className={s.discountValues}>
                                    <div className={s.discountItem}>
                                        <span className={s.discountTitle}>{texts.discount}</span>
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
                                    disabled={isAdding}
                                >
                                    {isAdding ? (
                                        <svg className={s.btnSpinner} viewBox="0 0 50 50" width="18" height="18">
                                            <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
                                        </svg>
                                    ) : texts.addToCart}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </section>
            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
