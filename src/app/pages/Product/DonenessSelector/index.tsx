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
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="7.26953" y="6.54517" width="1.45455" height="6.54545" rx="0.727273" fill="black"/>
                        <circle cx="8" cy="8" r="7.4" stroke="black" strokeWidth="1.2"/>
                        <circle cx="7.9968" cy="4.36448" r="0.727273" fill="black"/>
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
        </div>
    );
};

export default DonenessSelector;
