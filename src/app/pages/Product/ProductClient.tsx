'use client';

import React, { useState } from 'react';
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
import AuthModal from '@/app/components/AuthModal';
import VideoReviewModal from '@/app/components/VideoReviewModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import { recordProductViewAsync } from '@/store/slices/viewedProductsSlice';
import clsx from 'clsx';
import Image from 'next/image';
import { Locale } from '@/i18n/config';
import { Dictionary } from '@/i18n/types';
import type { BlogPost, Product, ProductCostVariant, OrderingInfoBlock } from '@/lib/graphql';
import { resolveProductImageUrl } from '@/lib/graphql';
import type { BreadcrumbItem } from '@/utils/category-url';


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getProductImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('/')) return `https://dev-api.myastoriya.com.ua${url}`;
    return url;
}

function getProductBadge(product: Product): string | null {
    if (product.is_new) return 'NEW';
    if (product.oldCost && product.oldCost > product.cost) return 'АКЦІЯ';
    return null;
}

function getProductWeight(product: Product): string {
    const weightSpec = product.specifications?.find(sp =>
        sp.name.toLowerCase().includes('вага') ||
        sp.name.toLowerCase().includes("об'єм")
    );
    if (weightSpec && weightSpec.values.length > 0) return weightSpec.values[0];
    return product.multiplier ? `${product.multiplier}` : '';
}

/** Resolves availability status: 1 = in stock, 2 = out of stock, 3 = discontinued */
function getAvailabilityLabel(available: number | null | undefined): { label: string; inStock: boolean } {
    if (available === 2) return { label: 'Немає в наявності', inStock: false };
    if (available === 3) return { label: 'Знято з виробництва', inStock: false };
    return { label: 'Є в наявності', inStock: true };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProductClientProps {
    product: Product;
    costVariants: ProductCostVariant[];
    publications: BlogPost[];
    relatedProducts: Product[];
    popularProducts: Product[];
    lang: Locale;
    dict: Dictionary;
    /** Pre-built breadcrumbs from server component (uses real category tree). */
    breadcrumbs?: BreadcrumbItem[];
    deliveryBlocks: OrderingInfoBlock[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ProductClient: React.FC<ProductClientProps> = ({
    product,
    costVariants,
    publications,
    relatedProducts,
    popularProducts,
    lang,
    dict,
    breadcrumbs: breadcrumbsProp,
    deliveryBlocks,
}) => {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

    // Record product view on mount
    React.useEffect(() => {
        if (product?.id) {
            void dispatch(recordProductViewAsync(String(product.id)));
        }
    }, [product?.id, dispatch]);

    const [quantity, setQuantity] = useState(1);
    const [selectedCostVariantId, setSelectedCostVariantId] = useState<string>(
        costVariants.find(v => v.isDefault)?.id ?? costVariants[0]?.id ?? ''
    );
    const [selectedMods, setSelectedMods] = useState<string[]>([]);
    const [selectedSouces, setSelectedSouces] = useState<string[]>([]);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isVideoReviewModalOpen, setIsVideoReviewModalOpen] = useState(false);

    // Hardcoded modifications (until API provides them)
    const productModifications = [
        { id: 'm1', name: 'Додаткова картопля фрі', price: 125 },
        { id: 'm2', name: 'Картопля по селянські', price: 125 },
        { id: 'm3', name: 'Батат фрі', price: 95 },
        { id: 'm4', name: 'Овочевий салат', price: 130 },
    ];

    const productSouces = [
        { id: 's1', name: 'Соус гострий Табаско', price: 35 },
        { id: 's2', name: 'Ворчестер Німеччина 140 мл', price: 25 },
        { id: 's3', name: 'Кіккоман соєвий соус 150 мл', price: 95 },
    ];

    const toggleMod = (id: string) => {
        setSelectedMods(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    const toggleSouce = (id: string) => {
        setSelectedSouces(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // Build display data from real product — читаємо з images[], бо image завжди null
    const mainEntry = product.images?.[0] ?? product.image ?? null;
    const mainImageUrl = mainEntry?.url?.main2x ||
        mainEntry?.url?.main1x ||
        mainEntry?.url?.grid2x ||
        mainEntry?.url?.grid1x ||
        mainEntry?.url?.big || '';

    const resolvedMain = getProductImageUrl(mainImageUrl);

    // Будуємо галерею з усіх зображень товару
    const displayImages = product.images && product.images.length > 0
        ? product.images.map(img => {
            const url = img?.url?.main2x || img?.url?.main1x || img?.url?.grid2x || img?.url?.grid1x || img?.url?.big || '';
            return getProductImageUrl(url);
          }).filter(Boolean)
        : resolvedMain
            ? [resolvedMain]
            : ['/images/product/product-main.png'];

    const characteristics: Record<string, string> = {};
    product.specifications?.forEach(spec => {
        if (spec.values.length > 0) {
            characteristics[spec.name] = spec.values.join(', ');
        }
    });
    if (product.multiplier) {
        characteristics['Вага'] = characteristics['Вага'] || `${product.multiplier}`;
    }

    const weight = getProductWeight(product);
    const badge = getProductBadge(product);
    const { label: availabilityLabel, inStock } = getAvailabilityLabel(product.available);

    const breadcrumbs: BreadcrumbItem[] = breadcrumbsProp ?? [
        { label: 'Головна', href: '/' },
        { label: product.name },
    ];

    // Map product list to RelatedProducts format
    function mapProductsToRelated(products: Product[]) {
        return products.slice(0, 8).map(p => ({
            id: p.id,
            title: p.name,
            price: p.cost,
            weight: getProductWeight(p),
            unit: p.unit || 'шт',
            image: resolveProductImageUrl(p),
            badge: getProductBadge(p),
        }));
    }

    const mappedRelated = mapProductsToRelated(relatedProducts);
    const mappedPopular = mapProductsToRelated(popularProducts);

    // Resolve gift product image if present
    const giftImageUrl = product.gift?.images?.[0]?.url?.grid2x
        ? getProductImageUrl(product.gift.images[0].url.grid2x)
        : null;

    return (
        <main className={s.productPage}>
            <Breadcrumbs items={breadcrumbs} className={s.breadcrumbsWrapper} />
            <div className={s.mainGrid}>
                <section className={s.gallery}>
                    <ProductGallery
                        id={String(product.id)}
                        images={displayImages}
                        discount={badge === 'АКЦІЯ' ? '-20%' : undefined}
                    />
                </section>

                <section className={s.info}>
                    <div className={clsx(s.availability, !inStock && s.availabilityUnavailable)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M11.448 6.111L7.587 9.981L6.102 8.496C6.02132 8.40178 5.92203 8.32526 5.81038 8.27124C5.69872 8.21722 5.5771 8.18687 5.45315 8.18208C5.3292 8.17729 5.2056 8.19818 5.09011 8.24342C4.97462 8.28867 4.86973 8.3573 4.78202 8.44501C4.69431 8.53272 4.62568 8.63761 4.58043 8.75311C4.53518 8.8686 4.5143 8.9922 4.51908 9.11615C4.52387 9.24009 4.55423 9.36171 4.60825 9.47337C4.66227 9.58503 4.73879 9.68431 4.833 9.765L6.948 11.889C7.0321 11.9724 7.13183 12.0384 7.24149 12.0832C7.35114 12.128 7.46856 12.1507 7.587 12.15C7.82311 12.149 8.04937 12.0553 8.217 11.889L12.717 7.389C12.8014 7.30533 12.8683 7.20579 12.914 7.09612C12.9597 6.98644 12.9832 6.86881 12.9832 6.75C12.9832 6.63119 12.9597 6.51355 12.914 6.40388C12.8683 6.29421 12.8014 6.19466 12.717 6.111C12.5484 5.94337 12.3203 5.84929 12.0825 5.84929C11.8447 5.84929 11.6166 5.94337 11.448 6.111ZM9 0C7.21997 0 5.47991 0.527841 3.99987 1.51677C2.51983 2.50571 1.36628 3.91131 0.685088 5.55585C0.00389956 7.20038 -0.17433 9.00998 0.172937 10.7558C0.520203 12.5016 1.37737 14.1053 2.63604 15.364C3.89472 16.6226 5.49836 17.4798 7.24419 17.8271C8.99002 18.1743 10.7996 17.9961 12.4442 17.3149C14.0887 16.6337 15.4943 15.4802 16.4832 14.0001C17.4722 12.5201 18 10.78 18 9C18 7.8181 17.7672 6.64778 17.3149 5.55585C16.8626 4.46392 16.1997 3.47177 15.364 2.63604C14.5282 1.80031 13.5361 1.13738 12.4442 0.685084C11.3522 0.232792 10.1819 0 9 0ZM9 16.2C7.57598 16.2 6.18393 15.7777 4.9999 14.9866C3.81586 14.1954 2.89302 13.0709 2.34807 11.7553C1.80312 10.4397 1.66054 8.99201 1.93835 7.59535C2.21616 6.19868 2.9019 4.91577 3.90883 3.90883C4.91577 2.90189 6.19869 2.21616 7.59535 1.93835C8.99202 1.66053 10.4397 1.80312 11.7553 2.34807C13.071 2.89302 14.1954 3.81586 14.9866 4.99989C15.7777 6.18393 16.2 7.57597 16.2 9C16.2 10.9096 15.4414 12.7409 14.0912 14.0912C12.7409 15.4414 10.9096 16.2 9 16.2Z" fill={inStock ? '#1BC573' : '#aaa'} />
                        </svg>
                        <span>{availabilityLabel}</span>
                    </div>

                    <h1 className={s.title}>{product.name}</h1>

                    {/* Rating */}
                    {product.rating != null && product.rating > 0 && (
                        <div className={s.ratingRow}>
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className={clsx(s.star, i < Math.round(product.rating!) && s.filled)}
                                    width="16" height="16" viewBox="0 0 32 32" fill="none"
                                >
                                    <path d="M16 2.66667L20.12 11.0267L29.3333 12.36L22.6667 18.8533L24.24 28.0267L16 23.6933L7.76 28.0267L9.33333 18.8533L2.66667 12.36L11.88 11.0267L16 2.66667Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ))}
                            <span className={s.ratingValue}>{product.rating.toFixed(1)}</span>
                        </div>
                    )}

                    <div className={s.priceSection}>
                        <div className={s.priceWrapper}>
                            <span className={clsx(s.price, product.oldCost && s.newPrice)}>{product.cost} ₴</span>
                            {product.oldCost && <span className={s.oldPrice}>{product.oldCost} ₴</span>}
                        </div>
                        {weight && (
                            <div className={s.priceSubtitle}>
                                Вага: <span className={s.weight}>{weight}</span>
                            </div>
                        )}
                    </div>

                    <div className={s.actionsBlock}>
                        {inStock ? (
                            <>
                                <Button variant="primary" className={s.mainBuyBtn}>Додати у кошик</Button>
                                <QuantitySelector value={quantity} onChange={setQuantity} className={s.quantitySelector} />
                            </>
                        ) : (
                            <Button variant="outline-black" className={s.mainBuyBtn}>
                                Повідомити про наявність
                            </Button>
                        )}

                        {/* Gift banner — real data or static fallback */}
                        {product.hasGift && product.gift ? (
                            <div className={s.promoBanner}>
                                {giftImageUrl && (
                                    <Image
                                        src={giftImageUrl}
                                        alt={product.giftText ?? `Подарунок: ${product.gift.name}`}
                                        width={60}
                                        height={60}
                                        style={{ objectFit: 'cover', borderRadius: 8 }}
                                    />
                                )}
                                <div className={s.promoBannerText}>
                                    <span className={s.promoBannerLabel}>
                                        {product.giftText ?? 'Отримайте товар у подарунок:'}
                                    </span>
                                    <span className={s.promoBannerProductName}>{product.gift.name}</span>
                                </div>
                            </div>
                        ) : product.hasGift ? (
                            <div className={s.promoBanner}>
                                <Image
                                    src="/images/product/gift-banner.png"
                                    alt={product.giftText ?? 'При покупці отримайте подарунок'}
                                    width={320}
                                    height={80}
                                    style={{ width: '100%', height: 'auto' }}
                                />
                            </div>
                        ) : null}
                    </div>

                    {/* Doneness selector — shown only when product has cost variants */}
                    {product.hasCostVariants && costVariants.length > 0 && (
                        <DonenessSelector
                            value={selectedCostVariantId}
                            onChange={setSelectedCostVariantId}
                            options={costVariants}
                        />
                    )}

                    <ProductModifications
                        title="Додати до замовлення:"
                        items={productModifications}
                        selectedItems={selectedMods}
                        onToggle={toggleMod}
                        className={s.productModifications}
                    />
                    <ProductModifications
                        title="Додати соус до замовлення:"
                        items={productSouces}
                        selectedItems={selectedSouces}
                        onToggle={toggleSouce}
                    />
                </section>

                <ProductTabs
                    description={product.text ?? product.name}
                    characteristics={characteristics}
                    deliveryBlocks={deliveryBlocks}
                />

                <ProductReviews
                    productId={Number(product.id)}
                    isAuthenticated={isAuthenticated}
                    onAuthRequired={() => setIsAuthModalOpen(true)}
                    onVideoReviewRequired={() => setIsVideoReviewModalOpen(true)}
                />
            </div>

            <div className={s.relatedProductsGrid}>
                {mappedRelated.length > 0 && (
                    <RelatedProducts
                        title="З цим товаром купують"
                        products={mappedRelated}
                        className={s.recommendations}
                    />
                )}
                {mappedPopular.length > 0 && (
                    <RelatedProducts
                        title="Популярні позиції"
                        products={mappedPopular}
                        className={s.recommendations}
                        isSliderOnMobile={true}
                    />
                )}
                <div className={s.showMoreWrapper}>
                    <Button variant="outline-black">
                        <span className={s.showMoreText}>ПОКАЗАТИ ЩЕ</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Button>
                </div>
            </div>

            <Publications dict={dict.home.publications} posts={publications} lang={lang} className={s.publications} />

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <VideoReviewModal isOpen={isVideoReviewModalOpen} onClose={() => setIsVideoReviewModalOpen(false)} />
        </main>
    );
};

export default ProductClient;
