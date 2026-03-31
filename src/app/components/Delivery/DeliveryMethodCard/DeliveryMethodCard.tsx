import React from 'react';
import Image from 'next/image';
import s from './DeliveryMethodCard.module.scss';
import { DeliveryMethodCard as DeliveryMethodCardType } from '@/i18n/types';

interface DeliveryMethodCardProps {
    item: DeliveryMethodCardType;
    hasBackground?: boolean;
}



const DeliveryMethodCard: React.FC<DeliveryMethodCardProps> = ({ item, hasBackground }) => {
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
        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="9" viewBox="0 0 8 9" fill="none">
            <path d="M7.981 3.43803C7.91494 2.78455 7.67195 2.15847 7.27571 1.62075C6.87947 1.08303 6.34347 0.651999 5.71992 0.369631C5.09637 0.0872617 4.40651 -0.0368225 3.71753 0.00946075C3.02854 0.055744 2.3639 0.270817 1.78833 0.633738C1.29386 0.947999 0.878749 1.36245 0.572828 1.84732C0.266908 2.33218 0.0777679 2.87543 0.0189965 3.43803C-0.0386564 3.99694 0.0353129 4.56105 0.235538 5.08942C0.435763 5.61778 0.757222 6.09716 1.17659 6.49278L3.6706 8.8677C3.71435 8.90962 3.76639 8.9429 3.82374 8.9656C3.88108 8.98831 3.94259 9 4.00471 9C4.06683 9 4.12833 8.98831 4.18568 8.9656C4.24302 8.9429 4.29506 8.90962 4.33881 8.8677L6.82341 6.49278C7.24278 6.09716 7.56424 5.61778 7.76446 5.08942C7.96469 4.56105 8.03866 3.99694 7.981 3.43803ZM6.16461 5.86215L4 7.91952L1.83539 5.86215C1.51639 5.55893 1.27203 5.19231 1.11987 4.78863C0.967724 4.38495 0.911562 3.95425 0.955427 3.52748C0.999574 3.09413 1.14448 2.67553 1.37968 2.30193C1.61487 1.92833 1.93447 1.60907 2.31537 1.36724C2.81461 1.05203 3.40064 0.883885 4 0.883885C4.59936 0.883885 5.18539 1.05203 5.68463 1.36724C6.06438 1.60814 6.38327 1.92598 6.61841 2.29795C6.85354 2.66991 6.99908 3.08675 7.04457 3.51853C7.08987 3.94675 7.03441 4.37917 6.88222 4.78451C6.73003 5.18984 6.48491 5.55794 6.16461 5.86215ZM4 1.81449C3.58119 1.81449 3.17178 1.93253 2.82355 2.15368C2.47532 2.37484 2.20391 2.68917 2.04363 3.05693C1.88336 3.4247 1.84143 3.82937 1.92313 4.21979C2.00484 4.6102 2.20652 4.96882 2.50266 5.2503C2.79881 5.53177 3.17612 5.72346 3.58689 5.80111C3.99765 5.87877 4.42342 5.83892 4.81035 5.68658C5.19729 5.53425 5.528 5.27628 5.76068 4.94531C5.99336 4.61433 6.11756 4.2252 6.11756 3.82714C6.11631 3.29371 5.89281 2.78248 5.49596 2.40529C5.09911 2.0281 4.56123 1.81567 4 1.81449ZM4 4.94528C3.76733 4.94528 3.53988 4.8797 3.34642 4.75684C3.15296 4.63397 3.00217 4.45934 2.91313 4.25503C2.82409 4.05072 2.80079 3.8259 2.84619 3.609C2.89158 3.3921 3.00362 3.19287 3.16815 3.0365C3.33267 2.88012 3.54229 2.77363 3.77049 2.73049C3.99869 2.68734 4.23523 2.70949 4.4502 2.79411C4.66516 2.87874 4.84889 3.02206 4.97816 3.20593C5.10742 3.38981 5.17642 3.60599 5.17642 3.82714C5.17642 4.12369 5.05248 4.40809 4.83185 4.61778C4.61123 4.82747 4.31201 4.94528 4 4.94528Z" fill="black"/>
        </svg>
    );

    return (
        <div className={`${s.card} ${hasBackground ? s.hasBackground : ''}`}>
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

                <div className={s.cardBody}>
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
        </div>
    );
};

export default DeliveryMethodCard;
