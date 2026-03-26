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

interface ComplexDiscountDetailProps {
    dict: Dictionary;
    lang: string;
    id: string;
}

export default function ComplexDiscountDetail({ dict, lang, id }: ComplexDiscountDetailProps) {
    const list = dict.home.discounts.items;
    const parsedId = Number(id);
    const baseId = isNaN(parsedId) ? 1 : (parsedId > 1000 ? parsedId % 1000 : parsedId);
    const safeBaseId = baseId === 0 ? 1 : baseId;

    let item = list?.find((i) => i.id === safeBaseId);
    if (!item && list?.length > 0) item = list[0];

    const title = item?.title ?? 'Steak Days щовівторка!';
    const endDate = item?.endDate ?? '12.10.2026';
    const discountPercent = item?.discount ?? '-15%';

    const breadcrumbItems = [
        { label: dict.home.actionsPage.breadcrumbs.home, href: '/' },
        { label: dict.home.complexDiscountsPage.breadcrumbs.complexDiscounts, href: '/complex-discounts' },
        { label: title },
    ];

    // Pick 3 products to display in the bundle set
    const allProducts = dict.home.products.items;
    const bundleProducts = allProducts.slice(0, 3);

    // Calculate total bundle price and discounted price
    const totalPrice = bundleProducts.reduce((sum, p) => sum + p.price, 0);
    const discountFactor = 1 - (Math.abs(parseInt(discountPercent)) / 100);
    const discountedPrice = Math.round(totalPrice * discountFactor);

    const dispatch = useAppDispatch();
    const [isCartOpen, setIsCartOpen] = useState(false);

    const handleAddToCart = () => {
        bundleProducts.forEach((product) => {
            dispatch(addToCart({ id: String(product.id), quantity: 1 }));
        });
        setIsCartOpen(true);
    };

    return (
        <>
            <section className={s.section}>
                <Breadcrumbs items={breadcrumbItems} className={s.breadcrumbsWrapper} />

                {/* Hero banner */}
                <div className={s.heroWrapper}>
                    <div className={s.heroImageWrapper}>
                        <Image
                            src="/images/promotions/promo-hero-bg2.png"
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
                        Улюблені стейки – зі знижкою щовівторка!<br />
                        Щовівторка даруємо 20% знижки на всі стейки з нашого гриль меню. Це чудова нагода скуштувати улюблений
                        стейк сухої чи вологої витримки або стейк від Бренд Шефа за ще приємнішою ціною. Акція діє лише офлайн у
                        ресторанах «М&apos;ясторія».
                    </p>

                    {/* Product set */}
                    <div className={s.productSet}>
                        {bundleProducts.map((product, idx) => (
                            <React.Fragment key={product.id}>
                                <div className={s.productCardWrapper}>
                                    <ProductCard
                                        id={product.id}
                                        title={product.title}
                                        weight={product.weight}
                                        price={product.price}
                                        unit={product.unit}
                                        badge={product.badge}
                                        image={product.image}
                                    />
                                </div>
                                {idx < bundleProducts.length - 1 && (
                                    <span className={s.plus}>+</span>
                                )}
                            </React.Fragment>
                        ))}
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
