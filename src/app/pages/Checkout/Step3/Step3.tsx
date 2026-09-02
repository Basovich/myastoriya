'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { useRouter } from 'next/navigation';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import BankCardItem, { type BankCard } from '@/app/components/Personal/Cards/BankCardItem';
import AddBankCardBtn from '@/app/components/Personal/Cards/AddBankCardBtn';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearCart, fetchCartAsync } from '@/store/slices/cartSlice';
import { getAccessToken } from '@/app/actions/authActions';
import { 
    getPaymentsApi, 
    createOrderApi, 
    orderGooglePayApi,
    FinishPayResponse,
    Payment, 
    CheckoutUserData, 
    CheckoutDeliveryData, 
    CheckoutPaymentData 
} from '@/lib/graphql/queries/orders';
import { GraphQLError } from '@/lib/graphql/client';
import { 
    getUserBankCardsApi, 
    requestTokenizeCardApi, 
    getDeliveryTimesApi,
    type UserBankCard 
} from '@/lib/graphql';
import ReselectDeliveryTimeModal from '@/app/components/ReselectDeliveryTimeModal/ReselectDeliveryTimeModal';
import * as Sentry from '@sentry/nextjs';


// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits ? `+${digits}` : phone;
}

function formatDeliveryTimesDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    
    const now = new Date();
    const isToday = date.getFullYear() === now.getFullYear() &&
                    date.getMonth() === now.getMonth() &&
                    date.getDate() === now.getDate();
                    
    if (isToday) {
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}.000000`;
    }

    return `${yyyy}-${mm}-${dd} 00:00:00.000000`;
}

function formatDate(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const CONTACT_METHODS = [
    { value: 'phone', label: 'Телефон' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'viber', label: 'Viber' },
    { value: 'dontCallBack', label: 'Не передзвонювати' },
];

import { type Locale } from '@/i18n/config';

interface Step3Props {
    lang: Locale;
}

export default function Step3({ lang }: Step3Props) {
    const hydrated = useIsHydrated();
    const [comment, setComment] = useState('');
    const [personsCount, setPersonsCount] = useState(1);
    const [contactMethod, setContactMethod] = useState('dontCallBack');
    
    // Payments State
    const rawPaymentsRef = useRef<Payment[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoadingPayments, setIsLoadingPayments] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [changeAmount, setChangeAmount] = useState('');
    const [selectedCardId, setSelectedCardId] = useState('');
    const [userCards, setUserCards] = useState<BankCard[]>([]);
    const [isLoadingCards, setIsLoadingCards] = useState(false);

    const router = useRouter();

    // Submit State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Stale delivery time modal state
    const [isReselectTimeModalOpen, setIsReselectTimeModalOpen] = useState(false);
    const [staleDeliveryId, setStaleDeliveryId] = useState<number | null>(null);
    const [staleInitialDate, setStaleInitialDate] = useState<Date | null>(null);

    // UI state
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);

    const [deliveryPrice, setDeliveryPrice] = useState<number | undefined>(undefined);
    // Promo functionality from Redux
    const promoCode = useAppSelector(state => state.cart.promoCode);
    const useBonuses = useAppSelector(state => state.cart.useBonuses);
    const appliedPromo = React.useMemo(() => {
        if (promoCode && promoCode.isApplied && promoCode.code) {
            const discountStr = promoCode.discount || '0';
            const discountVal = parseFloat(discountStr.replace(/[^\d.]/g, '')) || 0;
            return {
                code: promoCode.code,
                discount: discountVal
            };
        }
        return null;
    }, [promoCode]);

    const dispatch = useAppDispatch();
    const { user, isAuthenticated, isGuest } = useAppSelector(state => state.auth);

    // Restore saved step 3 parameters from localStorage
    useEffect(() => {
        const savedStep3 = localStorage.getItem('checkout_step3_data');
        if (savedStep3) {
            try {
                const parsed = JSON.parse(savedStep3);
                if (parsed.comment !== undefined) setComment(parsed.comment);
                if (parsed.personsCount !== undefined) setPersonsCount(parsed.personsCount);
                if (parsed.contactMethod !== undefined) setContactMethod(parsed.contactMethod);
                if (parsed.paymentMethod !== undefined) setPaymentMethod(parsed.paymentMethod);
                if (parsed.changeAmount !== undefined) setChangeAmount(parsed.changeAmount);
                if (parsed.selectedCardId !== undefined) setSelectedCardId(parsed.selectedCardId);
            } catch (e) {
                console.error('Failed to parse checkout_step3_data', e);
            }
        }
    }, []);

    // Auto-save step 3 choices
    useEffect(() => {
        const data = {
            comment,
            personsCount,
            contactMethod,
            paymentMethod,
            changeAmount,
            selectedCardId,
        };
        localStorage.setItem('checkout_step3_data', JSON.stringify(data));
    }, [comment, personsCount, contactMethod, paymentMethod, changeAmount, selectedCardId]);

    // Load saved delivery parameters, promo, and fetch payment methods
    useEffect(() => {
        let activeDeliveryId: number | undefined;
        let activeLocalityId: number | undefined;

        const savedDeliveryData = localStorage.getItem('checkout_delivery_data');
        if (savedDeliveryData) {
            try {
                const parsed = JSON.parse(savedDeliveryData);
                if (parsed.deliveryMethod) {
                    activeDeliveryId = parseInt(parsed.deliveryMethod, 10);
                }
                if (parsed.selectedCity?.id) {
                    activeLocalityId = parseInt(String(parsed.selectedCity.id), 10);
                }
            } catch (e) {
                console.error(e);
            }
        }

        const savedParams = localStorage.getItem('checkout_delivery_params');
        if (savedParams) {
            try {
                const parsed = JSON.parse(savedParams);
                if (typeof parsed.deliveryPrice === 'number') {
                    setDeliveryPrice(parsed.deliveryPrice);
                }
                if (!activeDeliveryId && parsed.deliveryId) {
                    activeDeliveryId = parseInt(String(parsed.deliveryId), 10);
                }
            } catch (e) {
                console.error(e);
            }
        }

        if (activeDeliveryId) {
            void dispatch(fetchCartAsync({
                deliveryId: activeDeliveryId,
                localityId: activeLocalityId,
            }));
        }

        const fetchPayments = async () => {
            setIsLoadingPayments(true);
            try {
                let localityId: number | undefined = activeLocalityId;
                if (!localityId && savedDeliveryData) {
                    const parsed = JSON.parse(savedDeliveryData);
                    if (parsed.selectedCity?.id) {
                        localityId = parsed.selectedCity.id;
                    }
                }
                const token = await getAccessToken();
                const res = await getPaymentsApi(localityId, undefined, token || undefined, lang);
                
                rawPaymentsRef.current = res;
                
                const hasGPay = res.some(p => p.id === '9');
                const hasAPay = res.some(p => p.id === '10');
                
                let processed = [...res];
                if (hasGPay || hasAPay) {
                    processed = processed.filter(p => p.id !== '9' && p.id !== '10');
                    processed.push({
                        id: 'merged-gpay-apay',
                        name: 'Оплата Google pay / Apple pay',
                        driver: 'merged-gpay-apay',
                        showChangeField: false
                    });
                }
                
                setPayments(processed);
                if (processed.length > 0) {
                    const savedStep3 = localStorage.getItem('checkout_step3_data');
                    let restoredMethod = '';
                    if (savedStep3) {
                        try {
                            const parsed = JSON.parse(savedStep3);
                            if (parsed.paymentMethod && processed.some(p => p.id === parsed.paymentMethod)) {
                                restoredMethod = parsed.paymentMethod;
                            }
                        } catch {}
                    }
                    setPaymentMethod(prev => {
                        if (prev && processed.some(p => p.id === prev)) return prev;
                        if (restoredMethod) return restoredMethod;
                        return processed[0].id;
                    });
                }
            } catch (e) {
                console.error('Failed to load payment methods', e);
            } finally {
                setIsLoadingPayments(false);
            }
        };
        fetchPayments();
    }, [dispatch, lang]);
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
                    setSelectedCardId(prev => prev || defaultCard.id);
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
                setUserCards(prev => {
                    // Find if a new card was added
                    const newCard = mapped.find(c => !prev.some(p => p.id === c.id));
                    if (newCard) {
                        setSelectedCardId(newCard.id);
                    }
                    return mapped;
                });

                // Make sure payment method remains / switches to card payment option if cards exist
                if (rawPaymentsRef.current.length > 0) {
                    const cardPayment = rawPaymentsRef.current.find(p => p.driver?.includes('liqpay') || p.driver?.includes('card'));
                    if (cardPayment) {
                        setPaymentMethod(prev => prev || cardPayment.id);
                    }
                }
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
            const url = await requestTokenizeCardApi(token, lang, '/checkout?step=3');
            if (url) {
                window.open(url, '_blank');
            } else {
                alert(lang === 'ua' ? 'Помилка отримання посилання для додавання картки' : 'Ошибка получения ссылки для добавления карты');
            }
        } catch (e) {
            console.error('Failed to request tokenize card:', e);
        }
    };


    const handleReselectDeliveryTime = (newDate: Date, newTime: string) => {
        const formattedDateStr = formatDate(newDate);
        
        const savedParamsStr = localStorage.getItem('checkout_delivery_params');
        if (savedParamsStr) {
            try {
                const parsed = JSON.parse(savedParamsStr);
                parsed.desiredDeliveryDate = formattedDateStr;
                parsed.desiredDeliveryTime = newTime;
                localStorage.setItem('checkout_delivery_params', JSON.stringify(parsed));
            } catch (e) {
                console.error(e);
            }
        }

        const savedDeliveryDataStr = localStorage.getItem('checkout_delivery_data');
        if (savedDeliveryDataStr) {
            try {
                const parsed = JSON.parse(savedDeliveryDataStr);
                parsed.deliveryDate = newDate.toISOString();
                parsed.deliveryTime = newTime;
                localStorage.setItem('checkout_delivery_data', JSON.stringify(parsed));
            } catch (e) {
                console.error(e);
            }
        }

        setIsReselectTimeModalOpen(false);
        
        setTimeout(() => {
            void handleSubmit();
        }, 100);
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

        // Pre-validate delivery time if specified
        if (deliveryParams.deliveryId && deliveryParams.desiredDeliveryTime) {
            let checkDate: Date = new Date();
            if (savedDeliveryData?.deliveryDate) {
                checkDate = new Date(savedDeliveryData.deliveryDate);
            } else if (deliveryParams.desiredDeliveryDate) {
                const parts = String(deliveryParams.desiredDeliveryDate).split('.');
                if (parts.length === 3) {
                    const dd = parseInt(parts[0], 10);
                    const mm = parseInt(parts[1], 10) - 1;
                    const yyyy = parseInt(parts[2], 10);
                    checkDate = new Date(yyyy, mm, dd);
                }
            }

            try {
                const formattedDateStr = formatDeliveryTimesDate(checkDate);
                const activeTimes = await getDeliveryTimesApi(Number(deliveryParams.deliveryId), formattedDateStr, lang);
                
                if (!activeTimes || activeTimes.length === 0 || !activeTimes.includes(deliveryParams.desiredDeliveryTime)) {
                    setStaleDeliveryId(Number(deliveryParams.deliveryId));
                    setStaleInitialDate(checkDate);
                    setIsReselectTimeModalOpen(true);
                    setIsSubmitting(false);
                    return;
                }
            } catch (err) {
                console.error('Failed to validate delivery time prior to submit:', err);
            }
        }

        const handleFinishAndRedirect = (orderId: string, successUrl?: string | null) => {
            dispatch(clearCart());
            void dispatch(fetchCartAsync());
            localStorage.removeItem('checkout_delivery_data');
            localStorage.removeItem('checkout_delivery_params');
            localStorage.removeItem('checkout_user_data');
            localStorage.removeItem('checkout_step3_data');
            localStorage.removeItem('applied_promo');

            if (successUrl) {
                window.location.href = successUrl;
            } else {
                const thanksPath = lang === 'ua' ? `/thanks?orderId=${orderId}` : `/${lang}/thanks?orderId=${orderId}`;
                router.push(thanksPath);
            }
        };

        try {
            const token = await getAccessToken();

            let userData: CheckoutUserData;
            const localityId = savedDeliveryData?.selectedCity?.id;
            if (!localityId) {
                setSubmitError(lang === 'ru' ? 'Не указан населенный пункт для доставки.' : 'Не вказано населений пункт для доставки.');
                setIsSubmitting(false);
                return;
            }

            if (savedUserData.anotherRecipient && isAuthenticated && user) {
                userData = {
                    localityId,
                    name: user.surname ? (user.name || 'Покупець') : (user.name?.split(' ')[0] || 'Покупець'),
                    surname: user.surname || user.name?.split(' ').slice(1).join(' ') || 'Покупець',
                    phone: formatPhone(user.phone || ''),
                    email: user.email || null,
                    anotherRecipient: true,
                    recipientFullName: savedUserData.recipientName || '',
                    recipientPhone: formatPhone(savedUserData.recipientPhone || ''),
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

            let finalPaymentMethodId = paymentMethod;
            if (paymentMethod === 'merged-gpay-apay') {
                const hasGPay = rawPaymentsRef.current.some(p => p.id === '9');
                const hasAPay = rawPaymentsRef.current.some(p => p.id === '10');
                
                const isAppleDevice = typeof window !== 'undefined' && (
                    /Macintosh|MacIntel|iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /Mac/.test(navigator.userAgent)) ||
                    'ApplePaySession' in window
                );
                
                if (isAppleDevice && hasAPay) {
                    finalPaymentMethodId = '10';
                } else if (hasGPay) {
                    finalPaymentMethodId = '9';
                } else if (hasAPay) {
                    finalPaymentMethodId = '10';
                }
            }

            const paymentData: CheckoutPaymentData = {
                paymentId: Number(finalPaymentMethodId),
                userCardId: selectedPayment.driver?.includes('liqpay') || selectedPayment.driver?.includes('card')
                    ? (selectedCardId ? Number(selectedCardId.replace('card-', '')) : null) 
                    : null,
                change: selectedPayment.showChangeField && changeAmount ? Number(changeAmount) || null : null,
                browserInfo: {
                    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
                    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
                },
            };

            const isGuestUser = !isAuthenticated || isGuest;

            const res = await createOrderApi(
                {
                    userData,
                    deliveryData,
                    paymentData,
                    comment: comment || undefined,
                    personsCount: personsCount,
                    communicationMethod: contactMethod,
                    dontCallBack: contactMethod === 'dontCallBack',
                    useBonuses: useBonuses,
                    registerMe: isGuestUser ? true : undefined,
                    returnPath: '/checkout?step=3',
                },
                token || '',
                lang
            );

            const requestGooglePayToken = async (totalAmount: number, currency: string): Promise<string> => {
                if (typeof window === 'undefined' || !('PaymentRequest' in window)) {
                    throw new Error(lang === 'ua' ? 'Google Pay не підтримується цим браузером' : 'Google Pay не поддерживается этим браузером');
                }

                const paymentDataData = {
                    environment: 'PRODUCTION',
                    apiVersion: 2,
                    apiVersionMinor: 0,
                    merchantInfo: {
                        merchantName: "М'ясторія",
                    },
                    allowedPaymentMethods: [{
                        type: 'CARD',
                        parameters: {
                            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                            allowedCardNetworks: ['MASTERCARD', 'VISA'],
                        },
                        tokenizationSpecification: {
                            type: 'PAYMENT_GATEWAY',
                            parameters: {
                                gateway: 'easypay',
                                gatewayMerchantId: 'MIASTORIIA-GA',
                            },
                        },
                    }],
                };

                const methodData: PaymentMethodData[] = [{
                    supportedMethods: 'https://google.com/pay',
                    data: paymentDataData,
                }];

                const details: PaymentDetailsInit = {
                    total: {
                        label: "М'ясторія",
                        amount: {
                            currency: currency || 'UAH',
                            value: String(totalAmount),
                        },
                    },
                };

                const request = new PaymentRequest(methodData, details);
                
                try {
                    const canPay = await request.canMakePayment();
                    if (!canPay) {
                        throw new Error(lang === 'ua' ? 'Google Pay не налаштовано або недоступний' : 'Google Pay не настроен или недоступен');
                    }
                } catch (e) {
                    console.warn('canMakePayment check failed or returned false', e);
                }

                try {
                    const paymentResponse = await request.show();
                    const detailsObj = paymentResponse.details as Record<string, unknown> | undefined;
                    const paymentMethodData = detailsObj?.paymentMethodData as Record<string, unknown> | undefined;
                    const tokenizationData = paymentMethodData?.tokenizationData as Record<string, unknown> | undefined;
                    const tokenData = tokenizationData?.token;

                    await paymentResponse.complete('success');
                    if (!tokenData) {
                        throw new Error(lang === 'ua' ? 'Не вдалося отримати токен Google Pay' : 'Не удалось получить токен Google Pay');
                    }
                    return typeof tokenData === 'string' ? tokenData : JSON.stringify(tokenData);
                } catch (e: unknown) {
                    const err = e as { name?: string; message?: string };
                    if (err && (err.name === 'AbortError' || err.message?.includes('cancel') || err.message?.includes('user closed'))) {
                        const cancelErr = new Error('USER_CANCELLED');
                        cancelErr.name = 'USER_CANCELLED';
                        throw cancelErr;
                    }
                    throw e;
                }
            };

            const processFinishPay = async (orderIdNum: number, tokenStr: string) => {
                const browserInfo = {
                    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
                    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
                };
                const finishRes: FinishPayResponse = await orderGooglePayApi(
                    orderIdNum,
                    tokenStr,
                    browserInfo,
                    token || '',
                    lang
                );

                if (finishRes.action === 'redirect_to_url' && finishRes.url) {
                    dispatch(clearCart());
                    window.location.href = finishRes.url;
                } else {
                    handleFinishAndRedirect(String(orderIdNum), finishRes.successUrl);
                }
            };

            if (res.action === 'online_payment' && (res.driver === 'google-pay' || res.driver === 'apple-pay')) {
                try {
                    const gpayToken = await requestGooglePayToken(res.total, res.currencyCode || 'UAH');
                    await processFinishPay(Number(res.orderId), gpayToken);
                } catch (payErr: unknown) {
                    const err = payErr as { name?: string; message?: string };
                    if (err?.name === 'USER_CANCELLED' || err?.message === 'USER_CANCELLED') {
                        setSubmitError(lang === 'ua' 
                            ? 'Оплату скасовано. Ви можете спробувати оплатити ще раз.' 
                            : 'Оплата отменена. Вы можете попробовать оплатить еще раз.');
                        return;
                    }
                    throw payErr;
                }
            } else if (res.url) {
                // Будь-який action з url (redirect / authenticate / confirm) — редірект на платіжний шлюз
                dispatch(clearCart());
                window.location.href = res.url;
            } else {
                handleFinishAndRedirect(res.orderId, res.successUrl);
            }
        } catch (e: unknown) {
            console.error('Failed to create order', e);
            Sentry.captureException(e, {
                tags: { category: 'checkout', action: 'create_order' },
                extra: { paymentMethod, comment, personsCount },
            });

            const isDeliveryTimeError = e instanceof GraphQLError && e.errors.some(err => {
                const msgLower = (err.message || '').toLowerCase();
                return msgLower.includes('time') || msgLower.includes('date') || msgLower.includes('час') || msgLower.includes('дат') || msgLower.includes('время');
            });
            if (isDeliveryTimeError && deliveryParams.deliveryId) {
                let checkDate: Date = new Date();
                if (savedDeliveryData?.deliveryDate) {
                    checkDate = new Date(savedDeliveryData.deliveryDate);
                }
                setStaleDeliveryId(Number(deliveryParams.deliveryId));
                setStaleInitialDate(checkDate);
                setIsReselectTimeModalOpen(true);
                setIsSubmitting(false);
                return;
            }

            let msg = lang === 'ru' 
                ? 'Произошла ошибка при создании заказа. Пожалуйста, попробуйте еще раз.'
                : 'Сталася помилка при створенні замовлення. Будь ласка, спробуйте ще раз.';
            if (e instanceof GraphQLError && e.errors.length > 0) {
                const firstError = e.errors[0];
                const errorCode = firstError.extensions?.error_code;

                if (errorCode === 54 || errorCode === '54') {
                    // Замовлення вже оплачено
                    handleFinishAndRedirect(String(deliveryParams.orderId || ''));
                    return;
                } else if (errorCode === 53 || errorCode === '53' || errorCode === 55 || errorCode === '55') {
                    msg = lang === 'ru'
                        ? 'Ошибка при оплате заказа. Попробуйте еще раз.'
                        : 'Помилка при оплаті замовлення. Спробуйте ще раз.';
                } else if (firstError.message === 'Internal server error' || errorCode === 86 || errorCode === '86') {
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
                                label: m.value === 'phone' ? 'Телефон' : 
                                       m.value === 'telegram' ? 'Telegram' :
                                       m.value === 'viber' ? 'Viber' : 'Не перезванивать'
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
                                                    {isLoadingCards ? (
                                                        <div className={s.loadingPayments}>
                                                            {lang === 'ru' ? 'Загрузка карт...' : 'Завантаження карток...'}
                                                        </div>
                                                    ) : (
                                                        userCards.map(card => (
                                                            <BankCardItem 
                                                                key={card.id}
                                                                card={card}
                                                                isSelected={selectedCardId === card.id}
                                                                onSelect={setSelectedCardId}
                                                                lang={lang as 'ua' | 'ru'}
                                                                className={s.checkoutCard}
                                                            />
                                                        ))
                                                    )}
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
                        onApply={() => {
                            void dispatch(fetchCartAsync());
                        }} 
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
            <ReselectDeliveryTimeModal 
                isOpen={isReselectTimeModalOpen}
                onClose={() => setIsReselectTimeModalOpen(false)}
                onConfirm={handleReselectDeliveryTime}
                deliveryId={staleDeliveryId || 0}
                initialDate={staleInitialDate}
                lang={lang as 'ua' | 'ru'}
            />
        </div>
    );
}

