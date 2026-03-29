'use client';

import React, { useState, useMemo } from 'react';
import s from './Product.module.scss';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs/Breadcrumbs';
import Button from '@/app/components/ui/Button/Button';
import ProductGallery from './ProductGallery';
import ProductTabs from './ProductTabs';
import ProductModifications from './ProductModifications';
import ProductReviews from './ProductReviews';
import RelatedProducts from './RelatedProducts';
import QuantitySelector from '@/app/components/ui/QuantitySelector/QuantitySelector';
import PublicationsHome from '../Home/Publications/Publications';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import uaData from '@/content/ua.json';
import ruData from '@/content/ru.json';
import { Locale } from '@/i18n/config';

const Product: React.FC<{ params: Promise<{ lang: string; slug?: string }> }> = ({ params }) => {
    const { lang, slug } = React.use(params);
    const locale = lang as Locale;
    const dict = locale === 'ru' ? ruData : uaData;
    
    // State
    const [quantity, setQuantity] = useState(1);
    const [selectedMods, setSelectedMods] = useState<string[]>([]);
    const [selectedSouces, setSelectedSouces] = useState<string[]>([]);

    // Find product data (mock logic for now based on slug)
    const parsedId = Number(slug);
    const baseId = isNaN(parsedId) ? 1 : (parsedId > 1000 ? parsedId % 1000 : parsedId);
    const safeBaseId = baseId === 0 ? 1 : baseId;

    const list = dict.home?.products?.items || [];
    let matchedItem = list.find((i) => i.id === safeBaseId);

    if (!matchedItem && list.length > 0) {
        matchedItem = list[0];
    }

    const productPrice = matchedItem ? matchedItem.price : 850;

    const productModifications = useMemo(() => [
        { id: "m1", name: "Додаткова картопля фрі", price: 125 },
        { id: "m2", name: "Картопля по селянські", price: 125 },
        { id: "m3", name: "Батат фрі", price: 95 },
        { id: "m4", name: "Овочевий салат", price: 130 },
    ], []);

    const productSouces = useMemo(() => [
        { id: "s1", name: "Соус гострий Табаско", price: 35 },
        { id: "s2", name: "Ворчестер Німеччина 140 мл", price: 25 },
        { id: "s3", name: "Кіккоман соєвий соус 150 мл", price: 95 },
    ], []);

    const product = {
        id: matchedItem ? String(matchedItem.id) : (slug || "1"),
        name: matchedItem ? matchedItem.title : "Стейк Рібай USA",
        category: "Ресторанне меню",
        categorySlug: "restoranne-menu",
        price: productPrice,
        unit: matchedItem ? matchedItem.weight || "350г" : "350г",
        oldPrice: 1060,
        discount: "-20%",
        badge: matchedItem?.badge || "Steak Days щовівторка!",
        description: "По классической американской технологии Стриплойн USA создается из самого ценного мяса передней части говяжьей полутуши. Мясо с тонким краем, срезается в поясничной части от 13 ребра до костреца. Причем животные откармливаются только на лучших кормах, с продуманным рационом, получая качественный уход на протяжении всего периода. Уже это становится залогом великолепного вкуса! Обратите внимание, при откорме не используются гормоны роста, ГМО или антибиотики.",
        images: [
            matchedItem ? matchedItem.image : "/images/product/product-main.png",
            matchedItem ? matchedItem.image : "/images/product/product-main.png",
            matchedItem ? matchedItem.image : "/images/product/product-main.png",
            matchedItem ? matchedItem.image : "/images/product/product-main.png",
        ],
        characteristics: {
            "Вага": "350г",
            "Країна": "США",
            "Тип": "Стейк",
            "Витримка": "Волога"
        },
        delivery: "Доставка здійснюється по всьому Києву та області. Вартість доставки згідно з тарифами перевізника.",
        modifications: productModifications,
        souces: productSouces,
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
        ]
    };

    const breadcrumbs = [
        { label: "Головна", href: "/" },
        { label: "Каталог", href: "/catalog" },
        { label: product.category, href: `/catalog/${product.categorySlug}` },
        { label: product.name, href: "" },
    ];

    const toggleMod = (id: string) => {
        setSelectedMods(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSouce = (id: string) => {
        setSelectedSouces(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const totalPrice = (() => {
        let base = productPrice;
        selectedMods.forEach(id => {
            const mod = productModifications.find(m => m.id === id);
            if (mod) base += mod.price;
        });
        selectedSouces.forEach(id => {
            const souce = productSouces.find(s => s.id === id);
            if (souce) base += souce.price;
        });
        return base * quantity;
    })();

    const relatedProducts = list.slice(0, 4).map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        weight: item.weight || "350г",
        unit: item.unit || "шт",
        image: item.image,
        badge: item.badge
    }));

    return (
        <>
            <Header lang={locale} />
            <main className={s.productPage}>
                <Breadcrumbs items={breadcrumbs} className={s.breadcrumbsWrapper} />
                <div className={s.mainGrid}>
                    <section className={s.gallery}>
                        <ProductGallery id={product.id} images={product.images} discount={product.discount} />
                    </section>

                    <section className={s.info}>
                        <div className={s.availability}>
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="9" cy="9" r="8" stroke="#00B060" strokeWidth="2"/>
                                <path d="M5 9L8 12L13 6" stroke="#00B060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Є в наявності</span>
                        </div>

                        <h1 className={s.title}>{product.name}</h1>

                        <div className={s.priceSection}>
                            <div className={s.priceWrapper}>
                                <span className={s.price}>{product.price} ₴</span>
                                {product.oldPrice && <span className={s.oldPrice}>{product.oldPrice} ₴</span>}
                            </div>
                            <div className={s.priceSubtitle}>
                                Вага: <span className={s.weight}>{product.characteristics['Вага'] || "1000 г"}</span> (361 грн / 100г)
                            </div>
                        </div>

                        <div className={s.actionsBlock}>
                            <Button variant="primary" className={s.mainBuyBtn}>Додати у кошик</Button>
                            <QuantitySelector value={quantity} onChange={setQuantity} />
                        </div>

                        <ProductModifications
                            title="Додати до замовлення:"
                            items={product.modifications}
                            selectedItems={selectedMods}
                            onToggle={toggleMod}
                        />
                        <ProductModifications
                            title="Додати соус до замовлення:"
                            items={product.souces}
                            selectedItems={selectedSouces}
                            onToggle={toggleSouce}
                        />
                    </section>

                    <ProductTabs
                        description={product.description}
                        characteristics={product.characteristics}
                        delivery={product.delivery}
                    />
                </div>

                <ProductReviews reviews={product.reviews} />

                <RelatedProducts
                    title="З цим товаром купують"
                    products={relatedProducts}
                    className={s.recommendations}
                />

                <RelatedProducts
                    title={`Популярні товари в категорії: ${product.category}`}
                    products={relatedProducts}
                    className={s.recommendations}
                />

                <RelatedProducts
                    title="Популярні позиції"
                    products={relatedProducts}
                    className={s.recommendations}
                />

                <div className={s.publications}>
                    <PublicationsHome dict={dict.home.publications} lang={locale} />
                </div>
            </main>
            <Footer lang={locale} />
        </>
    );
};

export default Product;
