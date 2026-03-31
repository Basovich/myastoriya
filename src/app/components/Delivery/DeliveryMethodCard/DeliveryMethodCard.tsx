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
        const keyword = "доставка безкоштовна";
        const hasKeyword = text.toLowerCase().includes(keyword);
        
        // Match both **bold** and keyword
        // Regex: /(\*\*.*?\*\*|доставка безкоштовна)/gi
        const parts = text.split(/(\*\*.*?\*\*|доставка безкоштовна)/gi);

        return (
            <p className={className}>
                {parts.map((part, i) => {
                    const lowerPart = part.toLowerCase();
                    if (lowerPart === keyword) {
                        return <strong key={i} className={s.red}>{part}</strong>;
                    }
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i}>{part.slice(2, -2)}</strong>;
                    }
                    return <span key={i}>{part}</span>;
                })}
            </p>
        );
    };

    const firstFeature = item.features[0];
    const isPromo = firstFeature && firstFeature.toLowerCase().includes("безкоштовна");
    const otherFeatures = isPromo ? item.features.slice(1) : item.features;

    return (
        <div className={s.card}>
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
                
                {item.shippingCostValue && (
                    <div className={s.infoRow}>
                        <span className={s.label}>{item.shippingCostLabel}</span>
                        <span className={s.value}>{item.shippingCostValue}</span>
                    </div>
                )}
                
                {item.minOrderValue && (
                    <div className={s.infoRow}>
                        <span className={s.label}>{item.minOrderLabel}</span>
                        <span className={s.value}>{item.minOrderValue}</span>
                    </div>
                )}

                {isPromo && renderStyledText(firstFeature, s.promoText)}

                {otherFeatures.length > 0 && (
                    <ul className={s.features}>
                        {otherFeatures.map((feature, index) => (
                            <li key={index} className={s.featureItem}>
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
