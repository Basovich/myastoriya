'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import s from './Step3.module.scss';
import StepIndicator from '../components/StepIndicator';
import CartSummary from '../components/CartSummary';
import PromoBlock from '../components/PromoBlock/Index';
import TextareaField from '@/app/components/ui/TextareaField';
import QuantitySelector from '@/app/components/ui/QuantitySelector/QuantitySelector';
import CustomSelect from '@/app/components/ui/CustomSelect';
import Button from '@/app/components/ui/Button/Button';
import CartModal from '@/app/components/CartModal/CartModal';
import AddCardModal from '@/app/components/Personal/Cards/AddCardModal';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import BankCardItem from '@/app/components/Personal/Cards/BankCardItem';
import AddBankCardBtn from '@/app/components/Personal/Cards/AddBankCardBtn';

// ── Mock Data ────────────────────────────────────────────────────────────────

const CONTACT_METHODS = [
    { value: 'no-call', label: 'Не передзвонювати' },
    { value: 'call', label: 'Передзвонити для уточнення' },
];

const SAVED_CARDS = [
    { id: 'card-1', number: '4265 **** **** 5874', expiry: '10 / 2023', type: 'visa' },
];

const PAYMENT_METHODS = [
    { id: 'google-apple-pay', label: 'Оплата Google pay / Apple pay' },
    { id: 'card', label: 'Оплата карткою Visa / MasterCard', hasLogos: true },
    { id: 'terminal', label: 'Оплата кур’єру на термінал' },
    { id: 'cash', label: 'Оплата кур’єру готівкою' },
];

import { type Locale } from '@/i18n/config';

interface Step3Props {
    lang: Locale;
}

export default function Step3({ lang }: Step3Props) {
    const hydrated = useIsHydrated();
    const [comment, setComment] = useState('');
    const [personsCount, setPersonsCount] = useState(1);
    const [contactMethod, setContactMethod] = useState('no-call');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [selectedCardId, setSelectedCardId] = useState('card-1');
    
    // UI state
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

    const [deliveryPrice, setDeliveryPrice] = useState<number | undefined>(undefined);
    const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

    React.useEffect(() => {
        const savedParams = localStorage.getItem('checkout_delivery_params');
        if (savedParams) {
            try {
                const parsed = JSON.parse(savedParams);
                if (typeof parsed.deliveryPrice === 'number') {
                    setDeliveryPrice(parsed.deliveryPrice);
                }
            } catch (e) {
                console.error(e);
            }
        }
        const savedPromo = localStorage.getItem('applied_promo');
        if (savedPromo) {
            try {
                const parsed = JSON.parse(savedPromo);
                if (parsed && parsed.code && typeof parsed.discount === 'number') {
                    setAppliedPromo(parsed);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, []);
    
    const handleBack = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('step', '2');
        window.history.pushState({}, '', url.toString());
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = () => {
        alert('Замовлення оформлено! (Демонстрація)');
    };

    return (
        <div className={s.layout}>
            {/* ── Left: Form ── */}
            <div className={s.formCard}>
                <StepIndicator current={3} />

                <div className={s.formSection}>
                    <h2 className={s.sectionTitle}>Додати коментар</h2>
                    <TextareaField 
                        id="checkout-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className={s.commentField}
                        textareaClassName={s.commentTextarea}
                    />
                </div>

                <div className={clsx(s.formSection, s.twoColumn)}>
                    <div className={s.fieldGroup}>
                        <h2 className={s.sectionTitle}>Кількість персон</h2>
                        <QuantitySelector 
                            value={personsCount}
                            onChange={setPersonsCount}
                            min={1}
                            className={s.personsCounter}
                        />
                    </div>
                    <div className={s.fieldGroup}>
                        <h2 className={s.sectionTitle}>Бажаний спосіб зв’язку</h2>
                        <CustomSelect 
                            options={CONTACT_METHODS}
                            value={contactMethod}
                            onChange={setContactMethod}
                            className={s.contactSelect}
                        />
                    </div>
                </div>

                <div className={s.formSection}>
                    <h2 className={s.sectionTitle}>Оберіть спосіб доставки чи самовивозу</h2>
                    <div className={s.paymentMethods}>
                        {PAYMENT_METHODS.map(method => {
                            const isSelected = paymentMethod === method.id;
                            return (
                                <div key={method.id} className={s.methodContainer}>
                                    <label className={s.methodItem}>
                                        <input 
                                            type="radio" 
                                            name="paymentMethod"
                                            value={method.id}
                                            checked={isSelected}
                                            onChange={() => setPaymentMethod(method.id)}
                                            className={s.hiddenRadio}
                                        />
                                        <span className={s.radioCircle} />
                                        <span className={s.methodLabel}>
                                            {method.label}
                                            {method.hasLogos && (
                                                <div className={s.paymentLogos}>
                                                    <Image src="/icons/visa_logo_card.svg" alt="Visa" width={46} height={15} />
                                                    <Image src="/icons/MC_logo.svg" alt="MasterCard" width={36} height={22} />
                                                </div>
                                            )}
                                        </span>
                                    </label>

                                    {isSelected && method.id === 'card' && (
                                        <div className={s.cardsSection}>
                                            <div className={s.cardsList}>
                                                {SAVED_CARDS.map(card => (
                                                    <BankCardItem 
                                                        key={card.id}
                                                        card={card as any}
                                                        isSelected={selectedCardId === card.id}
                                                        onSelect={setSelectedCardId}
                                                        lang={lang as 'ua' | 'ru'}
                                                        className={s.checkoutCard}
                                                    />
                                                ))}
                                                    <AddBankCardBtn 
                                                        onClick={() => setIsAddCardModalOpen(true)}
                                                        lang={lang as 'ua' | 'ru'}
                                                        className={s.checkoutAddCard}
                                                    />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={s.actions}>
                    <Button 
                        variant="red" 
                        onClick={handleSubmit}
                        className={s.submitBtn}
                    >
                        ОФОРМИТИ ЗАМОВЛЕННЯ
                    </Button>
                    <button 
                        type="button" 
                        onClick={handleBack} 
                        className={s.backBtn}
                    >
                        ПОВЕРНУТИСЯ НАЗАД
                    </button>
                </div>
            </div>

            {/* ── Right: Sidebar ── */}
            <div className={s.sidebar}>
                <CartSummary 
                    onEditCart={() => setIsCartModalOpen(true)} 
                    discountPercent={appliedPromo?.discount || 0}
                    deliveryPrice={deliveryPrice}
                />
                {hydrated && (
                    <PromoBlock 
                        onApply={(code, discount) => setAppliedPromo({ code, discount })} 
                        isApplied={!!appliedPromo}
                    />
                )}
                
                <p className={s.packageNote}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6.5" stroke="#E3051B" />
                        <path d="M7 4V7.5" stroke="#E3051B" strokeWidth="1.2" strokeLinecap="round" />
                        <circle cx="7" cy="9.5" r="0.6" fill="#E3051B" />
                    </svg>
                    До загальної суми замовлення не входить вартість пакету
                </p>
            </div>

            {/* ── Modals ── */}
            <CartModal 
                isOpen={isCartModalOpen} 
                onClose={() => setIsCartModalOpen(false)} 
                isCheckoutMode={true}
            />
            <AddCardModal 
                isOpen={isAddCardModalOpen} 
                onClose={() => setIsAddCardModalOpen(false)}
                lang={lang as 'ua' | 'ru'}
            />
        </div>
    );
}
