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
import BankCardItem, { type BankCard } from './BankCardItem';
import AddBankCardBtn from './AddBankCardBtn';

const MOCK_CARDS: BankCard[] = [
    { id: '1', number: '4265 **** **** 5874', expiry: '10 / 2023', type: 'visa' },
    { id: '2', number: '4265 **** **** 5874', expiry: '10 / 2023', type: 'visa' },
    { id: '3', number: '4265 **** **** 5874', expiry: '10 / 2023', type: 'visa' },
    { id: '4', number: '4265 **** **** 5874', expiry: '10 / 2023', type: 'visa' },
    { id: '5', number: '4265 **** **** 5874', expiry: '10 / 2023', type: 'visa' },
    { id: '6', number: '4265 **** **** 5874', expiry: '10 / 2023', type: 'visa' },
];

const localDict = {
    ua: {
        subtitle: "Ваші банківські картки",
        addCard: "Додати картку",
    },
    ru: {
        subtitle: "Ваши банковские карты",
        addCard: "Добавить карту",
    }
};

interface CardsClientProps {
    user: AuthUser | null;
    lang: 'ua' | 'ru';
}

export default function CardsClient({ user, lang }: CardsClientProps) {
    const [cards, setCards] = useState<BankCard[]>(MOCK_CARDS);
    const [selectedCardId, setSelectedCardId] = useState<string>(MOCK_CARDS[0].id);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const pDict = personalDict[lang];
    const dict = localDict[lang];

    const handleDelete = (id: string) => {
        if (window.confirm(lang === 'ua' ? 'Ви впевнені?' : 'Вы уверены?')) {
            setCards(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleSelect = (id: string) => {
        setSelectedCardId(id);
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
                        <BankCardItem 
                            key={card.id}
                            card={card}
                            isSelected={selectedCardId === card.id}
                            onSelect={handleSelect}
                            onDelete={handleDelete}
                            lang={lang}
                            showDelete
                        />
                    ))}

                    <AddBankCardBtn 
                        onClick={() => setIsModalOpen(true)}
                        lang={lang}
                    />
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
