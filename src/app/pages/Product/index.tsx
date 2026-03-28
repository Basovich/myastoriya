'use client';

import React, { useState, useMemo } from 'react';
import s from './Product.module.scss';
import Container from '@/app/components/ui/Container/Container';
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

    const product = {
        id: matchedItem ? String(matchedItem.id) : (slug || "1"),
        name: matchedItem ? matchedItem.title : "Стейк Рібай USA",
        category: "Ресторанне меню",
        categorySlug: "restoranne-menu",
        price: matchedItem ? matchedItem.price : 850,
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

    const totalPrice = useMemo(() => {
        let base = product.price;
        selectedMods.forEach(id => {
            const mod = product.modifications.find(m => m.id === id);
            if (mod) base += mod.price;
        });
        selectedSouces.forEach(id => {
            const souce = product.souces.find(s => s.id === id);
            if (souce) base += souce.price;
        });
        return base * quantity;
    }, [product.price, selectedMods, selectedSouces, quantity]);

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
            <main>
                <div className={s.productPage}>
                    <Container>
                        <div className={s.breadcrumbsWrapper}>
                            <Breadcrumbs items={breadcrumbs} />
                        </div>
                        
                        <div className={s.mainGrid}>
                            <section className={s.gallery}>
                                <ProductGallery id={product.id} images={product.images} discount={product.discount} />
                            </section>

                            <section className={s.info}>
                                <div className={s.metaInfo}>
                                    <div className={s.reviewsMeta} onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}>
                                        <div className={s.metaStars}>
                                            {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
                                        </div>
                                        <span className={s.reviewsCount}>1 відгук</span>
                                    </div>
                                </div>

                                <h1 className={s.title}>{product.name}</h1>
                                
                                <div className={s.priceSection}>
                                    <div className={s.priceWrapper}>
                                        <span className={s.price}>{product.price} ₴</span>
                                        <span className={s.unit}>/ {product.unit}</span>
                                    </div>
                                    {product.oldPrice && <span className={s.oldPrice}>Стара ціна {product.oldPrice} ₴</span>}
                                </div>
                                
                                <div className={s.badgeBanner}>
                                    {product.badge}
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

                                <div className={s.actionsBlock}>
                                    <QuantitySelector value={quantity} onChange={setQuantity} />
                                    <Button variant="primary" className={s.mainBuyBtn}>Додати до кошика</Button>
                                </div>

                                <div className={s.totalBlock}>
                                    <span className={s.totalLabel}>Всього:</span>
                                    <span className={s.totalValue}>{totalPrice} ₴</span>
                                </div>
                            </section>
                        </div>

                        <ProductTabs 
                            description={product.description} 
                            characteristics={product.characteristics} 
                            delivery={product.delivery} 
                        />

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
                    </Container>
                </div>
            </main>
            <Footer lang={locale} />
        </>
    );
};

export default Product;
