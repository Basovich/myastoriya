import React from 'react';
import Image from 'next/image';
import s from './DonenessSelector.module.scss';

export interface DonenessOption {
    id: string;
    label: string;
    image: string;
}

interface DonenessSelectorProps {
    value: string;
    onChange: (id: string) => void;
}

const options: DonenessOption[] = [
    { id: 'rare', label: 'Rare', image: '/images/product/doneness/rare.png' },
    { id: 'medium-rare', label: 'Medium rare', image: '/images/product/doneness/medium-rare.png' },
    { id: 'medium', label: 'Medium', image: '/images/product/doneness/medium.png' },
    { id: 'medium-well', label: 'Medium well', image: '/images/product/doneness/medium-well.png' },
    { id: 'well-done', label: 'Well done', image: '/images/product/doneness/well-done.png' },
];

const DonenessSelector: React.FC<DonenessSelectorProps> = ({ value, onChange }) => {
    const selectedOption = options.find(opt => opt.id === value) || options[2];

    return (
        <div className={s.selectorWrapper}>
            <div className={s.labelRow}>
                <span className={s.label}>Оберіть рівень прожарки:</span>
                <span className={s.currentValue}>{selectedOption.label}</span>
                <button className={s.infoBtn} type="button">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9" cy="9" r="8" stroke="#000" strokeOpacity="0.4" strokeWidth="1.5"/>
                        <path d="M9 12V8" stroke="#000" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="9" cy="6" r="1" fill="#000" fillOpacity="0.4"/>
                    </svg>
                </button>
            </div>

            <div className={s.grid}>
                {options.map((option) => (
                    <div 
                        key={option.id}
                        className={`${s.item} ${value === option.id ? s.active : ''}`}
                        onClick={() => onChange(option.id)}
                    >
                        {value === option.id && (
                            <div className={s.activeTag}>
                                {option.label}
                                <div className={s.tagArraw}></div>
                            </div>
                        )}
                        <div className={s.imageBox}>
                            <Image 
                                src={option.image} 
                                alt={option.label}
                                width={60}
                                height={34}
                                objectFit="cover"
                            />
                        </div>
                    </div>
                ))}
            </div>

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
    );
};

export default DonenessSelector;
