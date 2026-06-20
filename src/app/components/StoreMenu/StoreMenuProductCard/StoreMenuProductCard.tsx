'use client';

import React from 'react';
import s from './StoreMenuProductCard.module.scss';
import Image from 'next/image';
import { RestaurantProduct } from '@/lib/graphql/queries/pages/restaurantMenu';

interface StoreMenuProductCardProps {
    product: RestaurantProduct;
}

const SpicyIcon = () => (
    <div className={s.spicyBadge} title="Гостра страва">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C11.5 3.5 10 5.5 8 7C6 8.5 4.5 10.5 4.1 13C3.5 16.5 6 20 9.5 20.8C13 21.6 16.5 19.5 17.5 16C18.5 12.5 16.5 9 14.5 7.5C13.5 6.7 12.8 5.5 12.5 4.2C12.3 3.5 12.1 2.8 12 2Z" fill="#E30613" />
            <path d="M12.5 2C13 3 14 3.5 14.5 3C15 2.5 14.5 1.5 14 1" stroke="#2D9A47" strokeWidth="2" strokeLinecap="round" />
        </svg>
    </div>
);

const StoreMenuProductCard: React.FC<StoreMenuProductCardProps> = ({ product }) => {
    const isOutOfStock = product.available === 0;
    const hasDiscount = product.oldCost > product.cost;
    
    // Resolve image URL (using product.images[0] as fallback, then placeholder)
    const imgUrl = product.image?.url?.main2x 
        || product.image?.url?.grid2x 
        || product.images?.[0]?.url?.main2x 
        || product.images?.[0]?.url?.grid2x 
        || '/images/product-placeholder.svg';
    const altText = product.image?.alt || product.images?.[0]?.alt || product.name;

    // Helper to strip HTML tags and decode HTML entities
    const stripHtml = (html: string) => {
        let text = html.replace(/<[^>]+>/g, ' ');
        text = text
            .replace(/&nbsp;/gi, ' ')
            .replace(/&ndash;/gi, '–')
            .replace(/&mdash;/gi, '—')
            .replace(/&amp;/gi, '&')
            .replace(/&quot;/gi, '"')
            .replace(/&apos;/gi, "'")
            .replace(/&#39;/gi, "'")
            .replace(/&deg;/gi, '°')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&ldquo;/gi, '“')
            .replace(/&rdquo;/gi, '”')
            .replace(/&laquo;/gi, '«')
            .replace(/&raquo;/gi, '»')
            .replace(/&middot;/gi, '·')
            .replace(/&bull;/gi, '•')
            .replace(/&reg;/gi, '®')
            .replace(/&copy;/gi, '©')
            .replace(/&trade;/gi, '™');
        return text.replace(/\s+/g, ' ').trim();
    };

    // Weight extraction logic
    let weight = '';
    
    // 1. Try parenthesized weight in title first, e.g. "(170 г)"
    const parenMatch = product.name.match(/\s*\(([^)]*(?:г|г\.|g|g\.|кг|kg|шт|мл|ml|гр))\)\s*$/i);
    if (parenMatch) {
        weight = parenMatch[1].trim();
    } else {
        // 2. Try plain weight at the end of title, e.g. "170 г"
        const plainMatch = product.name.match(/\s+(\d+(?:\/\d+)?\s*(?:г|г\.|g|g\.|кг|kg|шт|мл|ml|гр))\s*$/i);
        if (plainMatch) {
            weight = plainMatch[1].trim();
        }
    }

    // 3. Fallback to specifications
    if (!weight && product.specifications) {
        const weightSpec = product.specifications.find(sp =>
            sp.name.toLowerCase().includes('вага') ||
            sp.name.toLowerCase().includes('важ') ||
            sp.name.toLowerCase().includes('вес') ||
            sp.name.toLowerCase().includes("об'єм")
        );
        if (weightSpec && weightSpec.values.length > 0) {
            weight = weightSpec.values[0].trim();
        }
    }

    // 4. Fallback to description text (e.g. "Вага: 300 г.")
    if (!weight && product.text) {
        const plainText = stripHtml(product.text);
        const textWeightMatch = plainText.match(/(?:вага|вес|weight)\s*:\s*([^.,\r\n<]+)/i);
        if (textWeightMatch) {
            weight = textWeightMatch[1].trim();
        }
    }

    // Description cleaning logic
    let cleanDescription = '';
    if (product.text) {
        let desc = stripHtml(product.text);
        
        // Remove product name from start of description if present
        const lowerDesc = desc.toLowerCase();
        const lowerName = product.name.toLowerCase();
        
        const nameWithoutWeight = parenMatch ? product.name.replace(parenMatch[0], '').trim() : product.name;
        const lowerNameWithoutWeight = nameWithoutWeight.toLowerCase();

        if (lowerDesc.startsWith(lowerName)) {
            desc = desc.substring(lowerName.length).trim();
        } else if (lowerDesc.startsWith(lowerNameWithoutWeight)) {
            desc = desc.substring(lowerNameWithoutWeight.length).trim();
        }
        
        // Clean up leading punctuation
        desc = desc.replace(/^[:\s\-\u2014]+/, '').trim();
        
        // Remove the weight line to avoid duplicate weight displays
        if (weight) {
            const escapedWeight = weight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const weightPattern = new RegExp(`(?:вага|вес|weight)\\s*:?\\s*${escapedWeight}\\.?`, 'i');
            desc = desc.replace(weightPattern, '').trim();
        }

        // Clean up leading punctuation again after replacements
        desc = desc.replace(/^[:\s\-\u2014]+/, '').trim();
        cleanDescription = desc;
    }

    // Portion text rendering: default to "(1 порція)" if portionSize is empty
    const portionText = product.portionSize
        ? (product.portionSize.startsWith('(') ? product.portionSize : `(${product.portionSize})`)
        : '(1 порція)';

    return (
        <div className={`${s.card} ${isOutOfStock ? s.unavailable : ''}`}>
            <div className={s.imageWrapper}>
                <Image
                    src={imgUrl}
                    alt={altText}
                    fill
                    className={s.productImg}
                />
                
                {product.isSpicy && <SpicyIcon />}
                
                {isOutOfStock && (
                    <div className={s.unavailableBadge}>Немає в наявності</div>
                )}
            </div>
            
            <div className={s.content}>
                <h3 className={s.title}>{product.name}</h3>
                
                <div className={s.details}>
                    <span className={s.price}>{product.cost} ₴</span>
                    {hasDiscount && (
                        <span className={s.oldPrice}>{product.oldCost} ₴</span>
                    )}
                    <span className={s.unit}>{portionText}</span>
                </div>

                {cleanDescription && (
                    <p className={s.description}>{cleanDescription}</p>
                )}
                
                <div className={s.footerRow}>
                    {weight && (
                        <span className={s.weightText}>{weight}</span>
                    )}
                    
                    {product.dishSpecifics && product.dishSpecifics.length > 0 && (
                        <div className={s.specifics}>
                            {product.dishSpecifics.map(spec => (
                                <span key={spec.key} className={s.specBadge}>
                                    {spec.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoreMenuProductCard;
