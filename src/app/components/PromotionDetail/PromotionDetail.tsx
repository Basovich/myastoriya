import React from 'react';
import Image from 'next/image';
import s from './PromotionDetail.module.scss';
import ProductCard from '../ui/ProductCard/ProductCard';
import Container from '../ui/Container/Container';
import Breadcrumbs from '../ui/Breadcrumbs/Breadcrumbs';
import HeroBanner from '../ui/HeroBanner/HeroBanner';

interface PromotionDetailProps {
    dict: any;
    lang: string;
    id: string;
}

export default function PromotionDetail({ dict, lang, id }: PromotionDetailProps) {
    const breadcrumbItems = [
        { label: dict.home.promotionsPage.breadcrumbs.home, href: '/' },
        { label: dict.home.promotionsPage.breadcrumbs.promotions, href: '/promotions' },
        { label: 'Steak Days щовівторка!' }
    ];

    return (
        <section className={s.section}>
            <Container>
                <Breadcrumbs items={breadcrumbItems} />

                <HeroBanner image="/images/promotions/promo-hero-bg2.png">
                    <div className={s.timerBlock}>
                        <div className={s.timerHeader}>До кінця акції залишилось:</div>
                        <div className={s.timerValues}>
                            <div className={s.timerItem}>
                                <div className={s.timerNumber}>02</div>
                                <div className={s.timerLabel}>Днів</div>
                            </div>
                            <div className={s.timerSeparator}>:</div>
                            <div className={s.timerItem}>
                                <div className={s.timerNumber}>12</div>
                                <div className={s.timerLabel}>Годин</div>
                            </div>
                            <div className={s.timerSeparator}>:</div>
                            <div className={s.timerItem}>
                                <div className={s.timerNumber}>27</div>
                                <div className={s.timerLabel}>Хвилин</div>
                            </div>
                            <div className={s.timerSeparator}>:</div>
                            <div className={s.timerItem}>
                                <div className={s.timerNumber}>54</div>
                                <div className={s.timerLabel}>Секунди</div>
                            </div>
                        </div>
                    </div>
                </HeroBanner>

                <div className={s.contentLayout}>
                    <div className={s.textContent}>
                        <h1 className={s.title}>
                            Улюблені стейки – зі знижкою щовівторка!
                        </h1>
                        <div className={s.description}>
                            <p>Щовівторка даруємо 20% знижки на всі стейки з нашого гриль меню.</p>
                            <p>Це чудова нагода скуштувати улюблений стейк сухої чи вологої витримки або стейк від Бренд Шефа за ще приємнішою ціною. Акція діє лише офлайн у ресторанах «М'ясторія».</p>

                            <h3>Умови:</h3>
                            <ul>
                                <li>в акції беруть участь усі товари з категорій «Стейки від Бренд Шефа», «Стейки сухої витримки», «Стейки вологої витримки», а також позиції з категорії «М'ясо на грилі»: Рібай су-від, Філе Міньйон су-від;</li>
                                <li>розмір знижки 20%;</li>
                                <li>Акція діє кожен вівторок з 05.08.2025 до 30.11.2025 (включно).</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={s.productsSection}>
                    <h2 className={s.productsTitle}>Товари, що беруть участь у акції</h2>
                    <div className={s.productsGrid}>
                        {dict.home.products.items.slice(0, 8).map((item: any) => (
                            <ProductCard
                                key={item.id}
                                title={item.title}
                                weight={item.weight}
                                price={item.price}
                                unit={item.unit}
                                badge={item.badge}
                                image={item.image}
                            />
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}
