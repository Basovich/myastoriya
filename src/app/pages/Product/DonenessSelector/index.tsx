import React from 'react';
import Image from 'next/image';
import s from './DonenessSelector.module.scss';
import type { ProductCostVariant } from '@/lib/graphql';

/** Статичні варіанти прожарки — використовуються як fallback */
const STATIC_OPTIONS = [
    { id: 'rare', label: 'Rare', image: '/images/product/doneness/rare.png' },
    { id: 'medium-rare', label: 'Medium rare', image: '/images/product/doneness/medium-rare.png' },
    { id: 'medium', label: 'Medium', image: '/images/product/doneness/medium.png' },
    { id: 'medium-well', label: 'Medium well', image: '/images/product/doneness/medium-well.png' },
    { id: 'well-done', label: 'Well done', image: '/images/product/doneness/well-done.png' },
];

const DONENESS_INFO = {
    ua: [
        { id: 'rare', name: 'Rare', desc: ' — слабке просмажування, з червоним соком та теплою червоною серцевиною (49–52°C).' },
        { id: 'medium-rare', name: 'Medium Rare', desc: ' — середньо-слабке просмажування, з рожевим соком. Найпопулярніший вибір (52–57°C).' },
        { id: 'medium', name: 'Medium', desc: ' — середнє просмажування, з рожевим соком та теплою рожевою серцевиною (57–63°C).' },
        { id: 'medium-well', name: 'Medium Well', desc: ' — майже повністю просмажене, з прозорим соком і сіро-рожевою серцевиною (63–68°C).' },
        { id: 'well-done', name: 'Well Done', desc: ' — повністю просмажене готове м\'ясо без соку (понад 68°C).' }
    ],
    ru: [
        { id: 'rare', name: 'Rare', desc: ' — слабая прожарка, с красным соком и теплой красной сердцевиной (49–52°C).' },
        { id: 'medium-rare', name: 'Medium Rare', desc: ' — средне-слабая прожарка, с розовым соком. Самый популярный выбор (52–57°C).' },
        { id: 'medium', name: 'Medium', desc: ' — средняя прожарка, со светло-розовым соком и теплой розовой сердцевиной (57–63°C).' },
        { id: 'medium-well', name: 'Medium Well', desc: ' — почти полностью прожаренное, с прозрачным соком и серо-розовой сердцевиной (63–68°C).' },
        { id: 'well-done', name: 'Well Done', desc: ' — полностью прожаренное готовое мясо без сока (более 68°C).' }
    ]
};

const isCurrent = (infoId: string, currentVal: string) => {
    const normalize = (val: string) => val.toLowerCase().replace(/[^a-z]/g, '');
    return normalize(infoId) === normalize(currentVal);
};

interface DonenessSelectorProps {
    value: string;
    onChange: (id: string) => void;
    /** Реальні варіанти з API. Якщо передано — використовуються замість статичних. */
    options?: ProductCostVariant[];
    lang?: 'ua' | 'ru';
}

const DonenessSelector: React.FC<DonenessSelectorProps> = ({ value, onChange, options, lang = 'ua' }) => {
    const [showTooltip, setShowTooltip] = React.useState(false);
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const btnRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
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
        <div className={s.selectorWrapper}>
            <div className={s.labelRow}>
                <span className={s.label}>
                    {currentLang === 'ru' ? 'Степень прожарки:' : 'Рівень прожарки:'}
                </span>
                <span className={s.currentValue}>{selectedItem?.label}</span>
                {selectedItem?.cost != null && (
                    <span className={s.currentCost}>{selectedItem.cost} ₴</span>
                )}
                <div className={s.infoWrapper}>
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
                        {DONENESS_INFO[currentLang].map((info) => (
                            <li key={info.id} className={`${s.tooltipItem} ${isCurrent(info.id, value) ? s.highlighted : ''}`}>
                                <span className={s.donenessName}>{info.name}</span>
                                <span className={s.donenessDesc}>{info.desc}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className={s.grid}>
                {items.map((item) => (
                    <div
                        key={item.id}
                        className={`${s.item} ${value === item.id ? s.active : ''}`}
                        onClick={() => onChange(item.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onChange(item.id)}
                        aria-pressed={value === item.id}
                        aria-label={item.label}
                    >
                        {value === item.id && (
                            <div className={s.activeTag}>
                                {item.label}
                                <div className={s.tagArraw}></div>
                            </div>
                        )}
                        <div className={s.imageBox}>
                            {item.image ? (
                                <Image
                                    src={item.image.startsWith('/') ? `https://dev-api.myastoriya.com.ua${item.image}` : item.image}
                                    alt={item.label}
                                    width={60}
                                    height={34}
                                    style={{ objectFit: 'cover' }}
                                    unoptimized
                                />
                            ) : (
                                <Image
                                    src={`/images/product/doneness/${item.id}.png`}
                                    alt={item.label}
                                    width={60}
                                    height={34}
                                    style={{ objectFit: 'cover' }}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonenessSelector;
