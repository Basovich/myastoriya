'use client';

import React from 'react';
import s from './StoreMenuProductCard.module.scss';
import Image from 'next/image';
import { RestaurantProduct } from '@/lib/graphql/queries/pages/restaurantMenu';

interface StoreMenuProductCardProps {
    product: RestaurantProduct;
}

const StoreMenuProductCard: React.FC<StoreMenuProductCardProps> = ({ product }) => {
    const isOutOfStock = product.available === 0;
    const hasDiscount = product.oldCost > product.cost;
    
    // Resolve image URL (using product.images[0] as fallback, then placeholder)
    const imgUrl = product.images?.[0]?.url?.main2x 
        || '/images/product-placeholder.svg';
    const altText = product.name;

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

    // 3. Fallback to portionSize
    if (!weight && product.portionSize) {
        const hasWeightUnit = /[гgкmшт]/i.test(product.portionSize);
        if (hasWeightUnit) {
            weight = product.portionSize;
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
                </div>
            </div>
        </div>
    );
};

export default StoreMenuProductCard;
