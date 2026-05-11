'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import s from './CardsClient.module.scss';
import PersonalContentBlock from '@/app/components/Personal/Shared/PersonalContentBlock';
import PersonalPageHeader from '@/app/components/Personal/Shared/PersonalPageHeader';
import { personalDict } from '@/app/components/Personal/Shared/PersonalShared';
import { AuthUser } from '@/store/slices/authSlice';
import AddCardModal from './AddCardModal';

interface BankCard {
    id: string;
    number: string;
    expiry: string;
    type: 'visa' | 'mastercard';
    isDefault: boolean;
}

const MOCK_CARDS: BankCard[] = [
    { id: '1', number: '4265 **** **** 5874', expiry: '10 / 2023', type: 'visa', isDefault: true },
    { id: '2', number: '4265 **** **** 5874', expiry: '10 / 2023', type: 'visa', isDefault: false },
    { id: '3', number: '4265 **** **** 5874', expiry: '10 / 2023', type: 'visa', isDefault: false },
    { id: '4', number: '4265 **** **** 5874', expiry: '10 / 2023', type: 'visa', isDefault: false },
    { id: '5', number: '4265 **** **** 5874', expiry: '10 / 2023', type: 'visa', isDefault: false },
    { id: '6', number: '4265 **** **** 5874', expiry: '10 / 2023', type: 'visa', isDefault: false },
];

const localDict = {
    ua: {
        subtitle: "Ваші банківські картки",
        cardNumber: "Номер картки",
        expiry: "Термін дії",
        addCard: "Додати картку",
    },
    ru: {
        subtitle: "Ваши банковские карты",
        cardNumber: "Номер карты",
        expiry: "Срок действия",
        addCard: "Добавить карту",
    }
};

interface CardsClientProps {
    user: AuthUser | null;
    lang: 'ua' | 'ru';
}

export default function CardsClient({ user, lang }: CardsClientProps) {
    const [cards, setCards] = useState<BankCard[]>(MOCK_CARDS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const pDict = personalDict[lang];
    const dict = localDict[lang];

    const handleDelete = (id: string) => {
        if (window.confirm(lang === 'ua' ? 'Ви впевнені?' : 'Вы уверены?')) {
            setCards(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleSetDefault = (id: string) => {
        setCards(prev => prev.map(c => ({
            ...c,
            isDefault: c.id === id
        })));
    };

    const handleLogout = () => {
        // Handled by layout
    };

    return (
        <div className={s.cardsPage}>
            <PersonalContentBlock className={s.contentBlock}>
                <PersonalPageHeader 
                    title={pDict.navigation.bankCards}
                    logoutLabel={pDict.navigation.logout}
                    onLogout={handleLogout}
                    user={user}
                    navDict={pDict.navigation}
                />

                <h2 className={s.subtitle}>{dict.subtitle}</h2>

                <div className={s.grid}>
                    {cards.map((card) => (
                        <div 
                            key={card.id} 
                            className={clsx(s.card, card.isDefault && s.defaultCard)}
                            onClick={() => handleSetDefault(card.id)}
                        >
                            <button 
                                className={s.deleteBtn}
                                onClick={() => handleDelete(card.id)}
                                aria-label="Delete"
                            >
                                <Image 
                                    src="/icons/icon-trash.svg" 
                                    alt="Delete" 
                                    width={12} 
                                    height={14} 
                                />
                            </button>
                            
                            <div className={s.cardContent}>
                                <div className={s.field}>
                                    <div className={s.label}>{dict.cardNumber}</div>
                                    <div className={s.value}>{card.number}</div>
                                </div>
                                
                                <div className={s.bottomRow}>
                                    <div className={s.field}>
                                        <div className={s.label}>{dict.expiry}</div>
                                        <div className={s.value}>{card.expiry}</div>
                                    </div>
                                    <div className={s.cardLogo}>
                                        <Image 
                                            src={card.type === 'visa' ? '/icons/visa_logo_card.svg' : '/icons/MC.png'}
                                            alt={card.type} 
                                            width={card.type === 'visa' ? 44 : 32} 
                                            height={card.type === 'visa' ? 28 : 26}
                                            style={{ objectFit: 'contain' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button className={s.addCard} onClick={() => setIsModalOpen(true)}>
                        <div className={s.plusCircle}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5V19M5 12H19" stroke="#999" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span>{dict.addCard}</span>
                    </button>
                </div>
            </PersonalContentBlock>

            <AddCardModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                lang={lang}
            />
        </div>
    );
}
