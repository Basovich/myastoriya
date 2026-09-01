'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import s from './DonenessSelector.module.scss';
import type { ProductCostVariant } from '@/lib/graphql';

const STATIC_IMAGES: Record<string, string> = {
    rare: '/images/product/doneness/rare.png',
    'medium-rare': '/images/product/doneness/medium-rare.png',
    medium: '/images/product/doneness/medium.png',
    'medium-well': '/images/product/doneness/medium-well.png',
    'well-done': '/images/product/doneness/well-done.png',
};

const DEFAULT_IMAGE_LIST = [
    '/images/product/doneness/rare.png',
    '/images/product/doneness/medium-rare.png',
    '/images/product/doneness/medium.png',
    '/images/product/doneness/medium-well.png',
    '/images/product/doneness/well-done.png',
];

/** Статичні варіанти прожарки — використовуються як fallback */
const STATIC_OPTIONS = [
    { id: 'rare', label: 'Rare', image: '/images/product/doneness/rare.png' },
    { id: 'medium-rare', label: 'Medium rare', image: '/images/product/doneness/medium-rare.png' },
    { id: 'medium', label: 'Medium', image: '/images/product/doneness/medium.png' },
    { id: 'medium-well', label: 'Medium well', image: '/images/product/doneness/medium-well.png' },
    { id: 'well-done', label: 'Well done', image: '/images/product/doneness/well-done.png' },
];

interface DonenessInfoItem {
    id: string;
    name: string;
    desc: string;
}

const DONENESS_INFO: Record<'ua' | 'ru', DonenessInfoItem[]> = {
    ua: [
        {
            id: 'raw',
            name: 'Без прожарки / Сирий',
            desc: ' — сирий стейк без термообробки для самостійного приготування.'
        },
        {
            id: 'blue',
            name: 'Blue (Extra Rare)',
            desc: ' — екстра-рейр сирий, але не холодний, з тонкою обсмаженою скоринкою (46–49°C).'
        },
        {
            id: 'rare',
            name: 'Rare',
            desc: ' — слабке просмажування, з червоним соком та теплою червоною серцевиною (49–52°C).'
        },
        {
            id: 'medium-rare',
            name: 'Medium Rare',
            desc: ' — середньо-слабке просмажування, з рожевим соком. Найпопулярніший вибір (52–57°C).'
        },
        {
            id: 'medium',
            name: 'Medium',
            desc: ' — середнє просмажування, з рожевим соком та теплою рожевою серцевиною (57–63°C).'
        },
        {
            id: 'medium-well',
            name: 'Medium Well',
            desc: ' — майже повністю просмажене, з прозорим соком і сіро-рожевою серцевиною (63–68°C).'
        },
        {
            id: 'well-done',
            name: 'Well Done',
            desc: ' — повністю просмажене готове м\'ясо без соку (понад 68°C).'
        }
    ],
    ru: [
        {
            id: 'raw',
            name: 'Без прожарки / Сырой',
            desc: ' — сырой стейк без термообработки для самостоятельного приготовления.'
        },
        {
            id: 'blue',
            name: 'Blue (Extra Rare)',
            desc: ' — экстра-рейр сырой, но не холодный, с тонкой обжаренной корочкой (46–49°C).'
        },
        {
            id: 'rare',
            name: 'Rare',
            desc: ' — слабая прожарка, с красным соком и теплой красной сердцевиной (49–52°C).'
        },
        {
            id: 'medium-rare',
            name: 'Medium Rare',
            desc: ' — средне-слабая прожарка, с розовым соком. Самый популярный выбор (52–57°C).'
        },
        {
            id: 'medium',
            name: 'Medium',
            desc: ' — средняя прожарка, со светло-розовым соком и теплой розовой сердцевиной (57–63°C).'
        },
        {
            id: 'medium-well',
            name: 'Medium Well',
            desc: ' — почти полностью прожаренное, с прозрачным соком и серо-розовой сердцевиной (63–68°C).'
        },
        {
            id: 'well-done',
            name: 'Well Done',
            desc: ' — полностью прожаренное готовое мясо без сока (более 68°C).'
        }
    ]
};

function resolveDonenessImage(item: { id: string; label: string; image?: string | null }, index: number): string {
    if (item.image && typeof item.image === 'string' && item.image.trim() !== '') {
        return item.image.startsWith('/') ? `https://dev-api.myastoriya.com.ua${item.image}` : item.image;
    }

    const idLower = (item.id || '').toLowerCase();
    if (STATIC_IMAGES[idLower]) {
        return STATIC_IMAGES[idLower];
    }

    const labelLower = (item.label || '').toLowerCase();
    if (labelLower.includes('well') || labelLower.includes('повніст') || labelLower.includes('полност')) {
        return STATIC_IMAGES['well-done'];
    }
    if (labelLower.includes('medium-well') || labelLower.includes('medium well')) {
        return STATIC_IMAGES['medium-well'];
    }
    if (labelLower.includes('medium-rare') || labelLower.includes('medium rare') || labelLower.includes('середньо-слабк') || labelLower.includes('средне-слаб')) {
        return STATIC_IMAGES['medium-rare'];
    }
    if (labelLower.includes('medium') || labelLower.includes('середн') || labelLower.includes('средн')) {
        return STATIC_IMAGES['medium'];
    }
    if (labelLower.includes('rare') || labelLower.includes('blue') || labelLower.includes('слабк') || labelLower.includes('слаб') || labelLower.includes('екстра') || labelLower.includes('экстра')) {
        return STATIC_IMAGES['rare'];
    }

    return DEFAULT_IMAGE_LIST[index % DEFAULT_IMAGE_LIST.length];
}

const isCurrentInfo = (infoId: string, selectedLabel: string, selectedId: string) => {
    const labelLower = (selectedLabel || '').toLowerCase();
    const idLower = (selectedId || '').toLowerCase();

    if (idLower === infoId) return true;

    if (infoId === 'blue' && (labelLower.includes('blue') || labelLower.includes('екстра') || labelLower.includes('экстра'))) {
        return true;
    }
    if (infoId === 'raw' && (labelLower.includes('без прож') || labelLower.includes('без просм') || labelLower.includes('сирий') || labelLower.includes('сырой'))) {
        return true;
    }
    if (infoId === 'medium-well' && (labelLower.includes('medium-well') || labelLower.includes('medium well') || labelLower.includes('майже') || labelLower.includes('почти'))) {
        return true;
    }
    if (infoId === 'medium-rare' && (labelLower.includes('medium-rare') || labelLower.includes('medium rare') || (labelLower.includes('слабк') && !labelLower.includes('екстра')) || (labelLower.includes('слабая') && !labelLower.includes('экстра')))) {
        return true;
    }
    if (infoId === 'well-done' && (labelLower.includes('well-done') || labelLower.includes('well done') || labelLower.includes('повністю') || labelLower.includes('полностью'))) {
        return true;
    }
    if (infoId === 'medium' && labelLower.includes('medium') && !labelLower.includes('rare') && !labelLower.includes('well')) {
        return true;
    }
    return infoId === 'rare' && labelLower.includes('rare') && !labelLower.includes('medium') && !labelLower.includes('blue') && !labelLower.includes('extra') && !labelLower.includes('екстра') && !labelLower.includes('экстра');


};

interface DonenessSelectorProps {
    value: string;
    onChange: (id: string) => void;
    /** Реальні варіанти з API. Якщо передано — використовуються замість статичних. */
    options?: ProductCostVariant[];
    lang?: 'ua' | 'ru';
    noBorder?: boolean;
}

interface DonenessItemProps {
    item: { id: string; label: string; image?: string | null };
    index: number;
    isSelected: boolean;
    onClick: () => void;
}

const DonenessItem: React.FC<DonenessItemProps> = ({ item, index, isSelected, onClick }) => {
    const initialSrc = resolveDonenessImage(item, index);
    const [imgSrc, setImgSrc] = useState(initialSrc);

    useEffect(() => {
        setImgSrc(resolveDonenessImage(item, index));
    }, [item, index]);

    const handleError = () => {
        const fallback = DEFAULT_IMAGE_LIST[index % DEFAULT_IMAGE_LIST.length];
        if (imgSrc !== fallback) {
            setImgSrc(fallback);
        }
    };

    return (
        <div
            className={`${s.item} ${isSelected ? s.active : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
            aria-pressed={isSelected}
            aria-label={item.label}
        >
            {isSelected && (
                <div className={s.activeTag} title={item.label}>
                    <span>{item.label}</span>
                </div>
            )}
            <div className={s.imageBox}>
                <Image
                    src={imgSrc}
                    alt={item.label}
                    width={60}
                    height={34}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    onError={handleError}
                    unoptimized={imgSrc.startsWith('http')}
                />
            </div>
        </div>
    );
};

const DonenessSelector: React.FC<DonenessSelectorProps> = ({ value, onChange, options, lang = 'ua', noBorder }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                tooltipRef.current && !tooltipRef.current.contains(event.target as Node) &&
                btnRef.current && !btnRef.current.contains(event.target as Node)
            ) {
                setShowTooltip(false);
            }
        };
        if (showTooltip) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showTooltip]);

    const isDoneness = React.useMemo(() => {
        if (!options || options.length === 0) return true;
        const donenessKeywords = ['rare', 'medium', 'well', 'blue', 'прожар', 'просм', 'сирий', 'сырой', 'raw'];
        return options.some(o => {
            const str = `${o.id} ${o.name || ''}`.toLowerCase();
            return donenessKeywords.some(kw => str.includes(kw));
        });
    }, [options]);

    if (!isDoneness || (options && options.length === 0)) {
        return null;
    }

    // Якщо є реальні варіанти з API — будуємо з них
    const items = options && options.length > 0
        ? options.map(v => ({
            id: v.id,
            label: v.name ?? v.id,
            image: v.image?.size2x || v.image?.size1x || v.image?.size3x || null,
            cost: v.cost,
        }))
        : STATIC_OPTIONS.map(o => ({ ...o, cost: undefined }));

    const selectedItem = items.find(o => o.id === value) ?? items[0];
    const currentLang = lang === 'ru' ? 'ru' : 'ua';

    return (
        <div className={`${s.selectorWrapper} ${noBorder ? s.noBorder : ''}`}>
            <div className={s.labelRow}>
                <span className={s.label}>
                    {currentLang === 'ru' ? 'Степень прожарки:' : 'Рівень прожарки:'}
                </span>
                <div className={s.infoWrapper}>
                    <span className={s.currentValue}>{selectedItem?.label}</span>
                    <button
                        ref={btnRef}
                        className={s.infoBtn}
                        type="button"
                        aria-label="Інформація про рівень прожарки"
                        onClick={() => setShowTooltip(!showTooltip)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="7.26953" y="6.54517" width="1.45455" height="6.54545" rx="0.727273" fill="black"/>
                            <circle cx="8" cy="8" r="7.4" stroke="black" strokeWidth="1.2"/>
                            <circle cx="7.9968" cy="4.36448" r="0.727273" fill="black"/>
                        </svg>
                    </button>
                </div>
            </div>

            {showTooltip && (
                <div ref={tooltipRef} className={s.tooltip}>
                    <h4 className={s.tooltipTitle}>
                        {currentLang === 'ru' ? 'Степени прожарки стейков:' : 'Рівні прожарювання стейків:'}
                    </h4>
                    <ul className={s.tooltipList}>
                        {DONENESS_INFO[currentLang].map((info) => {
                            const isSelected = isCurrentInfo(info.id, selectedItem?.label ?? '', value);
                            return (
                                <li key={info.id} className={`${s.tooltipItem} ${isSelected ? s.highlighted : ''}`}>
                                    <span className={s.donenessName}>{info.name}</span>
                                    <span className={s.donenessDesc}>{info.desc}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            <div className={s.grid}>
                {items.map((item, index) => (
                    <DonenessItem
                        key={item.id}
                        item={item}
                        index={index}
                        isSelected={value === item.id}
                        onClick={() => onChange(item.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default DonenessSelector;
