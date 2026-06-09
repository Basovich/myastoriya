'use client';

import React, { useState, useEffect } from 'react';
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
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import BankCardItem, { type BankCard } from '@/app/components/Personal/Cards/BankCardItem';
import AddBankCardBtn from '@/app/components/Personal/Cards/AddBankCardBtn';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
import { getAccessToken } from '@/app/actions/authActions';
import { 
    getPaymentsApi, 
    createOrderApi, 
    Payment, 
    CheckoutUserData, 
    CheckoutDeliveryData, 
    CheckoutPaymentData 
} from '@/lib/graphql/queries/orders';
import { GraphQLError } from '@/lib/graphql/client';
import { 
    getUserBankCardsApi, 
    requestTokenizeCardApi, 
    type UserBankCard 
} from '@/lib/graphql';


// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits ? `+${digits}` : phone;
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const CONTACT_METHODS = [
    { value: 'no-call', label: 'Не передзвонювати' },
    { value: 'call', label: 'Передзвонити для уточнення' },
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
    
    // Payments State
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoadingPayments, setIsLoadingPayments] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [changeAmount, setChangeAmount] = useState('');
    const [selectedCardId, setSelectedCardId] = useState('');
    const [userCards, setUserCards] = useState<BankCard[]>([]);
    const [isLoadingCards, setIsLoadingCards] = useState(false);

    
    // Submit / Success State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [successOrderInfo, setSuccessOrderInfo] = useState<{ id: string; total: number; currency: string } | null>(null);

    // UI state
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);

    const [deliveryPrice, setDeliveryPrice] = useState<number | undefined>(undefined);
    const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector(state => state.auth);

    // Load saved delivery parameters, promo, and fetch payment methods
    useEffect(() => {
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

        const fetchPayments = async () => {
            setIsLoadingPayments(true);
            try {
                let localityId: number | undefined;
                const savedDelivery = localStorage.getItem('checkout_delivery_data');
                if (savedDelivery) {
                    const parsed = JSON.parse(savedDelivery);
                    if (parsed.selectedCity?.id) {
                        localityId = parsed.selectedCity.id;
                    }
                }
                const token = await getAccessToken();
                const res = await getPaymentsApi(localityId, undefined, token || undefined, lang);
                setPayments(res);
                if (res.length > 0) {
                    setPaymentMethod(res[0].id);
                }
            } catch (e) {
                console.error('Failed to load payment methods', e);
            } finally {
                setIsLoadingPayments(false);
            }
        };
        fetchPayments();
    }, [lang]);
    const handleBack = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('step', '2');
        window.history.pushState({}, '', url.toString());
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Fetch saved bank cards for authenticated user
    useEffect(() => {
        const fetchCards = async () => {
            if (!isAuthenticated) return;
            setIsLoadingCards(true);
            try {
                const token = await getAccessToken();
                if (!token) return;
                const res = await getUserBankCardsApi(token, lang);
                const mapped = res.map((c: UserBankCard): BankCard => ({
                    id: c.id,
                    number: c.number,
                    expiry: c.formattedExpire || c.expire,
                    type: (c.icon?.toLowerCase() === 'mastercard' ? 'mastercard' : 'visa') as 'visa' | 'mastercard',
                    isDefault: c.isDefault,
                }));
                setUserCards(mapped);
                const defaultCard = mapped.find(c => c.isDefault) || mapped[0];
                if (defaultCard) {
                    setSelectedCardId(defaultCard.id);
                }
            } catch (e) {
                console.error('Failed to load user bank cards:', e);
            } finally {
                setIsLoadingCards(false);
            }
        };
        fetchCards();
    }, [isAuthenticated, lang]);

    useEffect(() => {
        const handleFocus = async () => {
            if (!isAuthenticated) return;
            try {
                const token = await getAccessToken();
                if (!token) return;
                const res = await getUserBankCardsApi(token, lang);
                const mapped = res.map((c: UserBankCard): BankCard => ({
                    id: c.id,
                    number: c.number,
                    expiry: c.formattedExpire || c.expire,
                    type: (c.icon?.toLowerCase() === 'mastercard' ? 'mastercard' : 'visa') as 'visa' | 'mastercard',
                    isDefault: c.isDefault,
                }));
                setUserCards(mapped);
            } catch (e) {
                console.error('Failed to reload bank cards on focus:', e);
            }
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [isAuthenticated, lang]);

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


    const handleSubmit = async () => {
        setSubmitError('');
        
        const savedParamsStr = localStorage.getItem('checkout_delivery_params');
        const savedUserDataStr = localStorage.getItem('checkout_user_data');
        const savedDeliveryDataStr = localStorage.getItem('checkout_delivery_data');
        
        if (!savedParamsStr || !savedUserDataStr) {
            setSubmitError(lang === 'ru' 
                ? 'Ошибка: отсутствуют данные оформления заказа. Пожалуйста, вернитесь на предыдущие шаги.'
                : 'Помилка: відсутні дані оформлення замовлення. Будь ласка, поверніться на попередні кроки.');
            return;
        }

        const deliveryParams = JSON.parse(savedParamsStr);
        const savedUserData = JSON.parse(savedUserDataStr);
        const savedDeliveryData = savedDeliveryDataStr ? JSON.parse(savedDeliveryDataStr) : null;
        
        if (!paymentMethod) {
            setSubmitError(lang === 'ru' ? 'Пожалуйста, выберите способ оплаты' : 'Будь ласка, оберіть спосіб оплати');
            return;
        }

        const selectedPayment = payments.find(p => p.id === paymentMethod);
        if (!selectedPayment) {
            setSubmitError(lang === 'ru' ? 'Выбранный способ оплаты недействителен' : 'Обраний спосіб оплати недійсний');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await getAccessToken();

            let userData: CheckoutUserData;
            const localityId = savedDeliveryData?.selectedCity?.id;
            if (!localityId) {
                throw new Error(lang === 'ru' ? 'Не указан населенный пункт для доставки.' : 'Не вказано населений пункт для доставки.');
            }

            if (savedUserData.anotherRecipient && isAuthenticated && user) {
                userData = {
                    localityId,
                    name: user.name?.split(' ')[0] || 'Покупець',
                    surname: user.name?.split(' ').slice(1).join(' ') || 'Покупець',
                    phone: formatPhone(user.phone || ''),
                    email: user.email || null,
                    anotherRecipient: true,
                    recipientFullName: `${savedUserData.firstName} ${savedUserData.lastName}`.trim(),
                    recipientPhone: formatPhone(savedUserData.phone),
                };
            } else {
                userData = {
                    localityId,
                    name: savedUserData.firstName,
                    surname: savedUserData.lastName,
                    phone: formatPhone(savedUserData.phone),
                    email: savedUserData.email || null,
                    anotherRecipient: false,
                    recipientFullName: null,
                    recipientPhone: null,
                };
            }

            const deliveryData: CheckoutDeliveryData = {
                deliveryId: deliveryParams.deliveryId,
                // These values are already numbers (stored as parseInt in Step2)
                userAddressId: deliveryParams.userAddressId ?? null,
                desiredDeliveryDate: deliveryParams.desiredDeliveryDate || null,
                desiredDeliveryTime: deliveryParams.desiredDeliveryTime || null,
                userPickupPointId: deliveryParams.userPickupPointId ?? null,
            };

            const paymentData: CheckoutPaymentData = {
                paymentId: Number(paymentMethod),
                userCardId: selectedPayment.driver?.includes('liqpay') || selectedPayment.driver?.includes('card')
                    ? (selectedCardId ? Number(selectedCardId.replace('card-', '')) : null) 
                    : null,
                change: selectedPayment.showChangeField && changeAmount ? Number(changeAmount) || null : null,
                browserInfo: {
                    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
                    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
                },
            };

            const res = await createOrderApi(
                {
                    userData,
                    deliveryData,
                    paymentData,
                    comment: comment || undefined,
                    personsCount: personsCount,
                    communicationMethod: contactMethod === 'no-call' ? 'no-call' : 'call',
                    dontCallBack: contactMethod === 'no-call',
                    useBonuses: false,
                },
                token || '',
                lang
            );

            if (res.action === 'redirect' && res.url) {
                window.location.href = res.url;
            } else {
                setSuccessOrderInfo({
                    id: res.orderId,
                    total: res.total,
                    currency: res.currencyCode || '₴',
                });
                setIsSuccess(true);
                
                dispatch(clearCart());
                localStorage.removeItem('checkout_delivery_data');
                localStorage.removeItem('checkout_delivery_params');
                localStorage.removeItem('checkout_user_data');
                localStorage.removeItem('applied_promo');
            }
        } catch (e: any) {
            console.error('Failed to create order', e);
            let msg = lang === 'ru' 
                ? 'Произошла ошибка при создании заказа. Пожалуйста, попробуйте еще раз.'
                : 'Сталася помилка при створенні замовлення. Будь ласка, спробуйте ще раз.';
            if (e instanceof GraphQLError && e.errors.length > 0) {
                const firstError = e.errors[0];
                const errorCode = firstError.extensions?.error_code;
                if (firstError.message === 'Internal server error' || errorCode === 86 || errorCode === '86') {
                    msg = lang === 'ru'
                        ? 'Произошла внутренняя ошибка сервера при создании заказа. Пожалуйста, попробуйте позже или обратитесь в поддержку.'
                        : 'Виникла внутрішня помилка сервера при створенні замовлення. Будь ласка, спробуйте пізніше або зверніться до служби підтримки.';
                } else {
                    msg = firstError.message;
                }
            } else if (e instanceof Error) {
                if (e.message === 'Internal server error') {
                    msg = lang === 'ru'
                        ? 'Произошла внутренняя ошибка сервера при создании заказа. Пожалуйста, попробуйте позже или обратитесь в поддержку.'
                        : 'Виникла внутрішня помилка сервера при створенні замовлення. Будь ласка, спробуйте пізніше або зверніться до служби підтримки.';
                } else {
                    msg = e.message;
                }
            }
            setSubmitError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess && successOrderInfo) {
        return (
            <div className={s.successContainer}>
                <div className={s.successCard}>
                    <div className={s.successIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
                            <circle cx="32" cy="32" r="30" fill="#E3051B" />
                            <path d="M20 32L28 40L44 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 className={s.successTitle}>
                        {lang === 'ru' ? 'Спасибо за ваш заказ!' : 'Дякуємо за ваше замовлення!'}
                    </h1>
                    <p className={s.successMessage}>
                        {lang === 'ru' 
                            ? 'Ваш заказ успешно создан и принят в обработку.' 
                            : 'Ваше замовлення успішно створено та прийнято в обробку.'}
                    </p>
                    <div className={s.orderInfoBlock}>
                        <div className={s.infoRow}>
                            <span>{lang === 'ru' ? 'Номер заказа:' : 'Номер замовлення:'}</span>
                            <strong>#{successOrderInfo.id}</strong>
                        </div>
                        <div className={s.infoRow}>
                            <span>{lang === 'ru' ? 'Сумма к оплате:' : 'Сума до сплати:'}</span>
                            <strong>{successOrderInfo.total} {successOrderInfo.currency}</strong>
                        </div>
                    </div>
                    <p className={s.successSubtext}>
                        {lang === 'ru'
                            ? 'В ближайшее время наш менеджер свяжется с вами или вы получите SMS-подтверждение.'
                            : 'Найближчим часом наш менеджер зв’яжеться з вами або ви отримаєте SMS-підтвердження.'}
                    </p>
                    <Button
                        variant="red"
                        onClick={() => window.location.href = lang === 'ua' ? '/' : `/${lang}`}
                        className={s.homeBtn}
                    >
                        {lang === 'ru' ? 'На главную' : 'На головну'}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={s.layout}>
            {/* ── Left: Form ── */}
            <div className={s.formCard}>
                <StepIndicator current={3} />

                <div className={s.formSection}>
                    <h2 className={s.sectionTitle}>
                        {lang === 'ru' ? 'Добавить комментарий' : 'Додати коментар'}
                    </h2>
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
                        <h2 className={s.sectionTitle}>
                            {lang === 'ru' ? 'Количество персон' : 'Кількість персон'}
                        </h2>
                        <QuantitySelector 
                            value={personsCount}
                            onChange={setPersonsCount}
                            min={1}
                            className={s.personsCounter}
                        />
                    </div>
                    <div className={s.fieldGroup}>
                        <h2 className={s.sectionTitle}>
                            {lang === 'ru' ? 'Желаемый способ связи' : 'Бажаний спосіб зв’язку'}
                        </h2>
                        <CustomSelect 
                            options={lang === 'ru' ? CONTACT_METHODS.map(m => ({
                                value: m.value,
                                label: m.value === 'no-call' ? 'Не перезванивать' : 'Перезвонить для уточнения'
                            })) : CONTACT_METHODS}
                            value={contactMethod}
                            onChange={setContactMethod}
                            className={s.contactSelect}
                        />
                    </div>
                </div>

                <div className={s.formSection}>
                    <h2 className={s.sectionTitle}>
                        {lang === 'ru' ? 'Выберите способ оплаты' : 'Оберіть спосіб оплати'}
                    </h2>
                    <div className={s.paymentMethods}>
                        {isLoadingPayments ? (
                            <div className={s.loadingPayments}>
                                {lang === 'ru' ? 'Загрузка способов оплаты...' : 'Завантаження способів оплати...'}
                            </div>
                        ) : payments.length === 0 ? (
                            <div className={s.noPayments}>
                                {lang === 'ru' ? 'Нет доступных способов оплаты' : 'Немає доступних способів оплати'}
                            </div>
                        ) : (
                            payments.map(method => {
                                const isSelected = paymentMethod === method.id;
                                const isCardDriver = !!method.driver?.includes('liqpay') || !!method.driver?.includes('card');
                                return (
                                    <div key={method.id} className={s.methodContainer}>
                                        <label className={s.methodItem}>
                                            <input 
                                                type="radio" 
                                                name="paymentMethod"
                                                value={method.id}
                                                checked={isSelected}
                                                onChange={() => {
                                                    setPaymentMethod(method.id);
                                                    setChangeAmount('');
                                                }}
                                                className={s.hiddenRadio}
                                            />
                                            <span className={s.radioCircle} />
                                            <span className={s.methodLabel}>
                                                {method.name}
                                                {isCardDriver && (
                                                    <div className={s.paymentLogos}>
                                                        <Image src="/icons/visa_logo_card.svg" alt="Visa" width={46} height={15} />
                                                        <Image src="/icons/MC_logo.svg" alt="MasterCard" width={36} height={22} />
                                                    </div>
                                                )}
                                            </span>
                                        </label>

                                        {isSelected && method.showChangeField && (
                                            <div className={s.changeSection}>
                                                <input
                                                    type="number"
                                                    placeholder={lang === 'ru' ? 'Сдача с какой суммы?' : 'Решта з якої суми?'}
                                                    value={changeAmount}
                                                    onChange={e => setChangeAmount(e.target.value)}
                                                    className={s.changeInput}
                                                    min={0}
                                                />
                                            </div>
                                        )}

                                        {isSelected && isCardDriver && (
                                            <div className={s.cardsSection}>
                                                <div className={s.cardsList}>
                                                    {userCards.map(card => (
                                                        <BankCardItem 
                                                            key={card.id}
                                                            card={card}
                                                            isSelected={selectedCardId === card.id}
                                                            onSelect={setSelectedCardId}
                                                            lang={lang as 'ua' | 'ru'}
                                                            className={s.checkoutCard}
                                                        />
                                                    ))}
                                                    <AddBankCardBtn 
                                                        onClick={handleAddCard}
                                                        lang={lang as 'ua' | 'ru'}
                                                        className={s.checkoutAddCard}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {submitError && (
                    <div className={s.submitError}>{submitError}</div>
                )}

                <div className={s.actions}>
                    <Button 
                        variant="red" 
                        onClick={handleSubmit}
                        className={s.submitBtn}
                        disabled={isSubmitting || isLoadingPayments}
                    >
                        {isSubmitting 
                            ? (lang === 'ru' ? 'Оформление...' : 'Оформлення...') 
                            : (lang === 'ru' ? 'ОФОРМИТЬ ЗАКАЗ' : 'ОФОРМИТИ ЗАМОВЛЕННЯ')}
                    </Button>
                    <button 
                        type="button" 
                        onClick={handleBack} 
                        className={s.backBtn}
                        disabled={isSubmitting}
                    >
                        {lang === 'ru' ? 'ВЕРНУТЬСЯ НАЗАД' : 'ПОВЕРНУТИСЯ НАЗАД'}
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
                    {lang === 'ru'
                        ? 'В общую сумму заказа не входит стоимость пакета'
                        : 'До загальної суми замовлення не входить вартість пакету'}
                </p>
            </div>

            {/* ── Modals ── */}
            <CartModal 
                isOpen={isCartModalOpen} 
                onClose={() => setIsCartModalOpen(false)} 
                isCheckoutMode={true}
            />
        </div>
    );
}

