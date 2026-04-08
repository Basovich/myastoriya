'use client';

import React, { useState, useMemo } from 'react';
import s from './Product.module.scss';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs/Breadcrumbs';
import Button from '@/app/components/ui/Button/Button';
import ProductGallery from './ProductGallery/index';
import ProductTabs from './ProductTabs/index';
import ProductModifications from './ProductModifications/index';
import DonenessSelector from './DonenessSelector/index';
import ProductReviews from './ProductReviews/index';
import RelatedProducts from './RelatedProducts/index';
import QuantitySelector from '@/app/components/ui/QuantitySelector/QuantitySelector';
import Publications from '@/app/components/Publications';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import uaData from '@/content/ua.json';
import ruData from '@/content/ru.json';
import { Locale } from '@/i18n/config';
import AuthModal from '@/app/components/AuthModal';
import VideoReviewModal from '@/app/components/VideoReviewModal';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import clsx from "clsx";
import Image from "next/image";
import { BlogPost } from "@/lib/graphql";


const Product: React.FC<{ params: Promise<{ lang: string; slug?: string }>; publications?: BlogPost[] }> = ({ params, publications = [] }) => {

    const { lang, slug } = React.use(params);
    const locale = lang as Locale;
    const dict = locale === 'ru' ? ruData : uaData;
    
    // Auth state
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    // State
    const [quantity, setQuantity] = useState(1);
    const [selectedDoneness, setSelectedDoneness] = useState('medium');
    const [selectedMods, setSelectedMods] = useState<string[]>([]);
    const [selectedSouces, setSelectedSouces] = useState<string[]>([]);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isVideoReviewModalOpen, setIsVideoReviewModalOpen] = useState(false);

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

    const relatedProducts = list.slice(0, 4).map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        weight: item.weight || "350г",
        unit: item.unit || "шт",
        image: item.image,
        badge: item.badge
    }));

    // Create 12 items for "Popular products" by repeating the mock data
    const popularProducts = [];
    for (let i = 0; i < 12; i++) {
        const item = list[i % list.length];
        if (item) {
            popularProducts.push({
                id: `${item.id}-${i}`, // Unique ID for key
                title: item.title,
                price: item.price,
                weight: item.weight || "330г",
                unit: item.unit || "упаковка",
                image: item.image,
                badge: item.badge
            });
        }
    }

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
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M11.448 6.111L7.587 9.981L6.102 8.496C6.02132 8.40178 5.92203 8.32526 5.81038 8.27124C5.69872 8.21722 5.5771 8.18687 5.45315 8.18208C5.3292 8.17729 5.2056 8.19818 5.09011 8.24342C4.97462 8.28867 4.86973 8.3573 4.78202 8.44501C4.69431 8.53272 4.62568 8.63761 4.58043 8.75311C4.53518 8.8686 4.5143 8.9922 4.51908 9.11615C4.52387 9.24009 4.55423 9.36171 4.60825 9.47337C4.66227 9.58503 4.73879 9.68431 4.833 9.765L6.948 11.889C7.0321 11.9724 7.13183 12.0384 7.24149 12.0832C7.35114 12.128 7.46856 12.1507 7.587 12.15C7.82311 12.149 8.04937 12.0553 8.217 11.889L12.717 7.389C12.8014 7.30533 12.8683 7.20579 12.914 7.09612C12.9597 6.98644 12.9832 6.86881 12.9832 6.75C12.9832 6.63119 12.9597 6.51355 12.914 6.40388C12.8683 6.29421 12.8014 6.19466 12.717 6.111C12.5484 5.94337 12.3203 5.84929 12.0825 5.84929C11.8447 5.84929 11.6166 5.94337 11.448 6.111ZM9 0C7.21997 0 5.47991 0.527841 3.99987 1.51677C2.51983 2.50571 1.36628 3.91131 0.685088 5.55585C0.00389956 7.20038 -0.17433 9.00998 0.172937 10.7558C0.520203 12.5016 1.37737 14.1053 2.63604 15.364C3.89472 16.6226 5.49836 17.4798 7.24419 17.8271C8.99002 18.1743 10.7996 17.9961 12.4442 17.3149C14.0887 16.6337 15.4943 15.4802 16.4832 14.0001C17.4722 12.5201 18 10.78 18 9C18 7.8181 17.7672 6.64778 17.3149 5.55585C16.8626 4.46392 16.1997 3.47177 15.364 2.63604C14.5282 1.80031 13.5361 1.13738 12.4442 0.685084C11.3522 0.232792 10.1819 0 9 0ZM9 16.2C7.57598 16.2 6.18393 15.7777 4.9999 14.9866C3.81586 14.1954 2.89302 13.0709 2.34807 11.7553C1.80312 10.4397 1.66054 8.99201 1.93835 7.59535C2.21616 6.19868 2.9019 4.91577 3.90883 3.90883C4.91577 2.90189 6.19869 2.21616 7.59535 1.93835C8.99202 1.66053 10.4397 1.80312 11.7553 2.34807C13.071 2.89302 14.1954 3.81586 14.9866 4.99989C15.7777 6.18393 16.2 7.57597 16.2 9C16.2 10.9096 15.4414 12.7409 14.0912 14.0912C12.7409 15.4414 10.9096 16.2 9 16.2Z" fill="#1BC573"/>
                            </svg>
                            <span>Є в наявності</span>
                        </div>

                        <h1 className={s.title}>{product.name}</h1>

                        <div className={s.priceSection}>
                            <div className={s.priceWrapper}>
                                <span className={clsx(s.price, product.oldPrice && s.newPrice)}>{product.price} ₴</span>
                                {product.oldPrice && <span className={s.oldPrice}>{product.oldPrice} ₴</span>}
                            </div>
                            <div className={s.priceSubtitle}>
                                Вага: <span className={s.weight}>{product.characteristics['Вага'] || "1000 г"}</span> <span className={s.weightPrice}> (361 грн / 100г)</span>
                            </div>
                        </div>

                        <div className={s.actionsBlock}>
                            <Button variant="primary" className={s.mainBuyBtn}>Додати у кошик</Button>
                            <QuantitySelector value={quantity} onChange={setQuantity} className={s.quantitySelector} />

                            <div className={s.promoBanner}>
                                <Image
                                    src="/images/product/gift-banner.png"
                                    alt="При покупці отримайте стейк Рібай у подарунок"
                                    width={320}
                                    height={80}
                                    layout="responsive"
                                />
                            </div>
                        </div>

                        <DonenessSelector 
                            value={selectedDoneness} 
                            onChange={setSelectedDoneness} 
                        />

                        <ProductModifications
                            title="Додати до замовлення:"
                            items={product.modifications}
                            selectedItems={selectedMods}
                            onToggle={toggleMod}
                            className={s.productModifications}
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

                    <ProductReviews 
                        reviews={dict.home.reviews.items.map(review => ({
                            ...review,
                            scores: {
                                "Якість обслуговування": review.rating,
                                "Ввічливість персоналу": review.rating,
                                "Швидкість доставки": review.rating,
                                "Якість продукції": review.rating
                            }
                        }))} 
                        isAuthenticated={isAuthenticated}
                        onAuthRequired={() => setIsAuthModalOpen(true)}
                        onVideoReviewRequired={() => setIsVideoReviewModalOpen(true)}
                    />
                </div>

                <div className={s.relatedProductsGrid}>
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
                        products={popularProducts}
                        className={s.recommendations}
                        isSliderOnMobile={true}
                    />
                    <div className={s.showMoreWrapper}>
                        <Button variant="outline-black">
                            <span className={s.showMoreText}>ПОКАЗАТЬ ЕЩЕ</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </Button>
                    </div>
                </div>
                <Publications dict={dict.home.publications} posts={publications} lang={locale} className={s.publications} />

            </main>
            <Footer lang={locale} />
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <VideoReviewModal isOpen={isVideoReviewModalOpen} onClose={() => setIsVideoReviewModalOpen(false)} />
        </>
    );
};

export default Product;
