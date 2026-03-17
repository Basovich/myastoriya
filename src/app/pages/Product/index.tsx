'use client';

import React from 'react';
import styles from './Product.module.scss';
import Container from '@/app/components/ui/Container/Container';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs/Breadcrumbs';
import Button from '@/app/components/ui/Button/Button';
import ProductGallery from './ProductGallery';
import ProductTabs from './ProductTabs';
import ProductModifications from './ProductModifications';
import ProductReviews from './ProductReviews';
import RelatedProducts from './RelatedProducts';

const Product: React.FC<{ params: Promise<{ lang: string }> }> = ({ params }) => {
    // In a real app, we would fetch product data based on slug
    const product = {
        id: "1",
        name: "Стейк Рібай USA",
        category: "Ресторанне меню",
        price: 850,
        oldPrice: 1060,
        discount: "-20%",
        badge: "Steak Days щовівторка!",
        description: "По классической американской технологии Стриплойн USA создается из самого ценного мяса передней части говяжьей полутуши. Мясо с тонким краем, срезается в поясничной части от 13 ребра до костреца. Причем животные откармливаются только на лучших кормах, с продуманным рационом, получая качественный уход на протяжении всего периода. Уже это становится залогом великолепного вкуса! Обратите внимание, при откорме не используются гормоны роста, ГМО или антибиотики.",
        images: [
            "/images/product/product-main.png",
            "/images/product/product-main.png",
            "/images/product/product-main.png",
        ],
        characteristics: {
            "Вага": "350г",
            "Країна": "США",
            "Тип": "Стейк",
            "Витримка": "Волога"
        },
        delivery: "Доставка здійснюється по всьому Києву та області. Вартість доставки згідно з тарифами перевізника.",
        modifications: [
            { id: "m1", name: "Додаткова картопля фрі", price: 125 },
            { id: "m2", name: "Картопля по селянські", price: 125 },
            { id: "m3", name: "Батат фрі", price: 95 },
            { id: "m4", name: "Овочевий салат", price: 130 },
        ],
        souces: [
            { id: "s1", name: "Соус гострий Табаско", price: 35 },
            { id: "s2", name: "Ворчестер Німеччина 140 мл", price: 25 },
            { id: "s3", name: "Кіккоман соєвий соус 150 мл", price: 95 },
        ],
        reviews: [
            {
                id: "r1",
                author: "Татьяна Величко",
                date: "22.05.2021",
                text: "Заказывала мужу на юбилей, блюдо очень понравилось. Мясо нежное и сочное. Очень вкусно! Я думаю такое мясо должен попробовать каждый в домашних условиях.",
                scores: {
                    "Якість обслуговування": 5,
                    "Ввічливість персоналу": 5,
                    "Швидкість доставки": 5,
                    "Якість продукції": 5
                }
            }
        ],
        relatedProducts: [
            { id: "p1", name: "Стейк Нью-Йорк", price: 780, image: "/images/product/product-main.png" },
            { id: "p2", name: "Стейк Філе Міньйон", price: 920, image: "/images/product/product-main.png" },
            { id: "p3", name: "Бургер Класичний", price: 350, image: "/images/product/product-main.png" },
            { id: "p4", name: "Салат Цезар", price: 280, image: "/images/product/product-main.png" },
        ]
    };

    const breadcrumbs = [
        { label: "Головна", href: "/" },
        { label: "Готова продукція", href: "/filter" },
        { label: product.category, href: "/filter" },
    ];

    return (
        <div className={styles.productPage}>
            <Container>
                <div className={styles.breadcrumbsWrapper}>
                    <Breadcrumbs items={breadcrumbs} />
                </div>
                
                <div className={styles.mainGrid}>
                    <section className={styles.gallery}>
                        <ProductGallery images={product.images} discount={product.discount} />
                    </section>

                    <section className={styles.info}>
                        <h1 className={styles.title}>{product.name}</h1>
                        <div className={styles.priceWrapper}>
                            <span className={styles.price}>{product.price} ₴</span>
                            {product.oldPrice && <span className={styles.oldPrice}>{product.oldPrice} ₴</span>}
                        </div>
                        
                        <div className={styles.badgeBanner}>
                            {product.badge}
                        </div>

                        <ProductModifications title="Додати до замовлення:" items={product.modifications} />
                        <ProductModifications title="Додати соус до замовлення:" items={product.souces} />

                        <div className={styles.pageActions}>
                            <Button variant="primary" className={styles.mainBuyBtn}>Додати до кошика</Button>
                        </div>
                    </section>
                </div>

                <ProductTabs 
                    description={product.description} 
                    characteristics={product.characteristics} 
                    delivery={product.delivery} 
                />

                <ProductReviews reviews={product.reviews} />

                <RelatedProducts title="З цим товаром купують" products={product.relatedProducts} />
                <RelatedProducts title={`Популярні товари в категорії: ${product.category}`} products={product.relatedProducts} />
            </Container>
        </div>
    );
};

export default Product;
