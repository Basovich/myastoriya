'use client';

import React, { useState, useEffect, useCallback } from 'react';
import s from './CardsClient.module.scss';
import PersonalContentBlock from '@/app/components/Personal/Shared/PersonalContentBlock';
import PersonalPageHeader from '@/app/components/Personal/Shared/PersonalPageHeader';
import { personalDict } from '@/app/components/Personal/Shared/PersonalShared';
import { AuthUser } from '@/store/slices/authSlice';
import BankCardItem, { type BankCard } from './BankCardItem';
import AddBankCardBtn from './AddBankCardBtn';
import DeleteCardModal from './DeleteCardModal';
import Spinner from '@/app/components/ui/Spinner/Spinner';
import { 
    getUserBankCardsApi, 
    deleteUserBankCardApi, 
    markUserBankCardAsDefaultApi, 
    requestTokenizeCardApi,
    UserBankCard
} from '@/lib/graphql';
import { getAccessToken } from '@/app/actions/authActions';

const localDict = {
    ua: {
        subtitle: "Ваші банківські картки",
        addCard: "Додати картку",
        loading: "Завантаження карток...",
    },
    ru: {
        subtitle: "Ваши банковские карты",
        addCard: "Добавить карту",
        loading: "Загрузка карт...",
    }
};

interface CardsClientProps {
    user: AuthUser | null;
    lang: 'ua' | 'ru';
}

export default function CardsClient({ user, lang }: CardsClientProps) {
    const [cards, setCards] = useState<BankCard[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [cardToDeleteId, setCardToDeleteId] = useState<string | null>(null);
    
    const pDict = personalDict[lang];
    const dict = localDict[lang];

    const fetchCards = useCallback(async () => {
        try {
            const token = await getAccessToken();
            if (!token) {
                setIsLoading(false);
                return;
            }
            const res = await getUserBankCardsApi(token, lang);
            const mapped = res.map((c: UserBankCard): BankCard => ({
                id: c.id,
                number: c.number,
                expiry: c.formattedExpire || c.expire,
                type: (c.icon?.toLowerCase() === 'mastercard' ? 'mastercard' : 'visa') as 'visa' | 'mastercard',
                isDefault: c.isDefault,
            }));
            setCards(mapped);
            const defaultCard = mapped.find(c => c.isDefault) || mapped[0];
            if (defaultCard) {
                setSelectedCardId(defaultCard.id);
            }
        } catch (e) {
            console.error('Failed to load bank cards:', e);
        } finally {
            setIsLoading(false);
        }
    }, [lang]);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    useEffect(() => {
        const handleFocus = () => {
            fetchCards();
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [fetchCards]);

    const handleDeleteClick = (id: string) => {
        setCardToDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!cardToDeleteId) return;
        try {
            const token = await getAccessToken();
            if (!token) return;
            const success = await deleteUserBankCardApi(cardToDeleteId, token, lang);
            if (success) {
                setCards(prev => prev.filter(c => c.id !== cardToDeleteId));
                if (selectedCardId === cardToDeleteId) {
                    setSelectedCardId('');
                }
            }
        } catch (e) {
            console.error('Failed to delete card:', e);
        } finally {
            setIsDeleteModalOpen(false);
            setCardToDeleteId(null);
        }
    };

    const handleSelect = async (id: string) => {
        setSelectedCardId(id);
        try {
            const token = await getAccessToken();
            if (!token) return;
            const numericId = parseInt(id, 10);
            if (!isNaN(numericId)) {
                await markUserBankCardAsDefaultApi(numericId, token, lang);
                // Refresh to update isDefault
                fetchCards();
            }
        } catch (e) {
            console.error('Failed to mark card as default:', e);
        }
    };

    const handleAddCard = async () => {
        try {
            const token = await getAccessToken();
            if (!token) return;
            const url = await requestTokenizeCardApi(token, lang);
            if (url) {
                window.open(url, '_blank');
            } else {
                alert(lang === 'ua' ? 'Помилка отримання посилання для додавання картки' : 'Ошибка получения ссылки для добавления карты');
            }
        } catch (e) {
            console.error('Failed to request tokenize card:', e);
        }
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

                {isLoading ? (
                    <Spinner />
                ) : (
                    <div className={s.grid}>
                        {cards.map((card) => (
                            <BankCardItem 
                                key={card.id}
                                card={card}
                                isSelected={selectedCardId === card.id}
                                onSelect={handleSelect}
                                onDelete={handleDeleteClick}
                                lang={lang}
                                showDelete
                            />
                        ))}

                        <AddBankCardBtn 
                            onClick={handleAddCard}
                            lang={lang}
                        />
                    </div>
                )}
                <DeleteCardModal 
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    lang={lang}
                />
            </PersonalContentBlock>
        </div>
    );

}
