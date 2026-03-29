import React from 'react';
import Image from 'next/image';
import s from './DeliveryMethodCard.module.scss';
import { DeliveryMethodCard as DeliveryMethodCardType } from '@/i18n/types';

interface DeliveryMethodCardProps {
    item: DeliveryMethodCardType;
}

const DeliveryMethodCard: React.FC<DeliveryMethodCardProps> = ({ item }) => {
    return (
        <div className={s.card}>
            <div className={s.imageWrapper}>
                <Image
                    src={item.image}
                    alt={item.title}
                    width={100}
                    height={100}
                    className={s.image}
                />
            </div>
            <div className={s.content}>
                <h3 className={s.title}>{item.title}</h3>
                
                {(item.shippingCostLabel || item.shippingCostValue) && (
                    <div className={s.infoRow}>
                        <span className={s.label}>{item.shippingCostLabel}</span>
                        <span className={s.value}>{item.shippingCostValue}</span>
                    </div>
                )}
                
                {(item.minOrderLabel || item.minOrderValue) && (
                    <div className={s.infoRow}>
                        <span className={s.label}>{item.minOrderLabel}</span>
                        <span className={s.value}>{item.minOrderValue}</span>
                    </div>
                )}

                <ul className={s.features}>
                    {item.features.map((feature, index) => (
                        <li key={index} className={s.featureItem}>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DeliveryMethodCard;
