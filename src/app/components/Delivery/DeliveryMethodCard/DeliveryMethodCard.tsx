import React from 'react';
import Image from 'next/image';
import s from './DeliveryMethodCard.module.scss';
import { DeliveryMethodCard as DeliveryMethodCardType } from '@/i18n/types';

interface DeliveryMethodCardProps {
    item: DeliveryMethodCardType;
}



const DeliveryMethodCard: React.FC<DeliveryMethodCardProps> = ({ item }) => {
    // Helper to render text with bold parts and red highlighting
    const renderStyledText = (text: string, className?: string) => {
        // Match both **bold** and keyword variations for free delivery
        // Keywords: "доставка безкоштовна", "безкоштовна доставка", "доставка бесплатная", "бесплатная доставка"
        const keywords = [
            "доставка безкоштовна", 
            "безкоштовна доставка", 
            "доставка бесплатная", 
            "бесплатная доставка"
        ];
        
        const regex = new RegExp(`(\\*\\*.*?\\*\\*|${keywords.join('|')})`, 'gi');
        const parts = text.split(regex);

        return (
            <div className={className}>
                {parts.map((part, i) => {
                    const lowerPart = part.toLowerCase();
                    if (keywords.includes(lowerPart)) {
                        return <strong key={i} className={s.red}>{part}</strong>;
                    }
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i}>{part.slice(2, -2)}</strong>;
                    }
                    return <span key={i}>{part}</span>;
                })}
            </div>
        );
    };

    const firstFeature = item.features[0];
    const isPromo = firstFeature && (
        firstFeature.toLowerCase().includes("безкоштовна") || 
        firstFeature.toLowerCase().includes("бесплатная")
    );
    const otherFeatures = isPromo ? item.features.slice(1) : item.features;

    const LocationIcon = () => (
        <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 0C3.13 0 0 3.13 0 7C0 12.25 7 18 7 18C7 18 14 12.25 14 7C14 3.13 10.87 0 7 0ZM7 9.5C5.62 9.5 4.5 8.38 4.5 7C4.5 5.62 5.62 4.5 7 4.5C8.38 4.5 9.5 5.62 9.5 7C9.5 8.38 8.38 9.5 7 9.5Z" fill="#333333"/>
        </svg>
    );

    return (
        <div className={s.card}>
            {item.badge && <div className={s.badge}>{item.badge}</div>}
            <div className={s.imageWrapper}>
                <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className={s.image}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                />
            </div>
            <div className={s.content}>
                <h3 className={s.title}>{item.title}</h3>
                
                {item.shippingCostLabel && (
                    <div className={s.infoRow}>
                        {renderStyledText(item.shippingCostLabel, s.label)}
                        {item.shippingCostValue && <div className={s.value}>{renderStyledText(item.shippingCostValue)}</div>}
                    </div>
                )}
                
                {item.minOrderLabel && (
                    <div className={s.infoRow}>
                        {renderStyledText(item.minOrderLabel, s.label)}
                        {item.minOrderValue && <div className={s.value}>{renderStyledText(item.minOrderValue)}</div>}
                    </div>
                )}

                {isPromo && renderStyledText(firstFeature, s.promoText)}

                {otherFeatures.length > 0 && (
                    <ul className={`${s.features} ${item.isPickup ? s.pickupList : ''}`}>
                        {otherFeatures.map((feature, index) => (
                            <li key={index} className={s.featureItem}>
                                {item.isPickup && <div className={s.icon}><LocationIcon /></div>}
                                {renderStyledText(feature)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default DeliveryMethodCard;
