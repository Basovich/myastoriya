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

import { type Special, resolveProductImageUrl } from '@/lib/graphql';

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
        addToCart: "ДОДАТИ ДО КОШИКА"
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
        addToCart: "ДОБАВИТЬ В КОРЗИНУ"
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
                                            lang={lang} />
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
                        >
                            {texts.addToCart}
                        </Button>
                    </div>
                </div>
            </section>
            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
