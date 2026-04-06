'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import s from './Step2.module.scss';
import StepIndicator from '../components/StepIndicator';
import CartSummary from '../components/CartSummary';
import PromoBlock from '../components/PromoBlock/Index';
import CustomSelect from '@/app/components/ui/CustomSelect/CustomSelect';
import DatePicker from '@/app/components/ui/DatePicker/DatePicker';
import Button from '@/app/components/ui/Button/Button';
import { useAppSelector } from '@/store/hooks';
import CartModal from '@/app/components/CartModal/CartModal';
import AuthModal from '@/app/components/AuthModal';
import { useRouter } from 'next/navigation';
import AddressRow from '../components/AddressRow/AddressRow';
import AddAddressModal from '@/app/components/AddAddressModal/AddAddressModal';
import { addAddress } from '@/store/slices/authSlice';
import { useDispatch } from 'react-redux';
import Image from 'next/image';

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CITIES = [
    { value: 'kyiv', label: 'Київ' },
    { value: 'kyiv-region', label: 'Київська область' },
    { value: 'lviv', label: 'Львів' },
    { value: 'odesa', label: 'Одеса' },
];

const KYIV_DELIVERY = [
    { id: 'courier-kyiv', label: 'Кур’єром по Києву', price: 125 },
    { id: 'courier-region', label: 'Кур’єром в Київській області', price: 80 },
    { id: 'pickup', label: 'Самовивіз з закладу М’ясторія', price: 0, free: true },
];

const OTHER_DELIVERY = [
    { id: 'courier-nova-poshta', label: 'Курьєром Нової Пошти', price: 125, isNP: true },
    { id: 'branch-nova-poshta', label: 'У відділення Нової Пошти', price: 225, isNP: true },
];

const MOCK_DATES = [
    { value: 'today', label: 'Сьогодні' },
    { value: 'tomorrow', label: 'Завтра' },
];

const MOCK_TIMES = [
    { value: '14:00-15:00', label: '14:00 - 15:00' },
    { value: '15:00-16:00', label: '15:00 - 16:00' },
    { value: '16:00-17:00', label: '16:00 - 17:00' },
];

// ── Main Step2 Component ──────────────────────────────────────────────────────

export default function Step2() {
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useAppSelector(state => state.auth);
    const [guestAddresses, setGuestAddresses] = useState<{ id: string; title: string; street: string }[]>([]);
    
    const addresses = [...(user?.addresses || []), ...guestAddresses];

    const [city, setCity] = useState(MOCK_CITIES[0].value);
    
    const deliveryMethods = city === 'kyiv' ? KYIV_DELIVERY : OTHER_DELIVERY;

    const [deliveryMethod, setDeliveryMethod] = useState(deliveryMethods[0].id);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(addresses.length > 0 ? addresses[0].id : null);
    const [deliveryDate, setDeliveryDate] = useState<Date | null>(new Date());
    const [deliveryTime, setDeliveryTime] = useState(MOCK_TIMES[0].value);

    // Reset delivery method when city changes
    useEffect(() => {
        setDeliveryMethod(city === 'kyiv' ? KYIV_DELIVERY[0].id : OTHER_DELIVERY[0].id);
    }, [city]);
    
    // UI state
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
    
    // Promo functionality (reused from Step 1)
    const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('applied_promo');
        if (saved) {
            try {
                const val = JSON.parse(saved);
                if (val && val.code && typeof val.discount === 'number') {
                    setAppliedPromo(val);
                }
            } catch (e) {
                console.error('Error parsing saved promo', e);
            }
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(addresses[0].id);
        }
    }, [addresses, selectedAddressId]);

    const router = useRouter();
    const cartItems = useAppSelector(state => state.cart.items);

    const handleBack = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('step', '1');
        window.history.pushState({}, '', url.toString());
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNext = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('step', '3');
        window.history.pushState({}, '', url.toString());
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddAddress = (address: { id: string; title: string; street: string }) => {
        if (isAuthenticated) {
            dispatch(addAddress(address));
        } else {
            setGuestAddresses(prev => [...prev, address]);
        }
        setSelectedAddressId(address.id);
    };

    const freeDeliveryMissing = 1200;

    return (
        <div className={s.layout}>
            {/* ── Left: Delivery Form ── */}
            <div className={s.formCard}>
                <StepIndicator current={2} />

                <div className={s.formSection}>
                    <h2 className={s.sectionTitle}>Ваше місто ?</h2>
                    <CustomSelect 
                        options={MOCK_CITIES}
                        value={city}
                        onChange={setCity}
                        className={s.citySelect}
                    />
                </div>

                <div className={s.formSection}>
                    <h2 className={s.sectionTitle}>Оберіть спосіб доставки чи самовивозу</h2>
                    <div className={s.deliveryMethods}>
                        {deliveryMethods.map(method => {
                            const isCourier = ['courier-kyiv', 'courier-region', 'courier-nova-poshta'].includes(method.id);
                            const isSelected = deliveryMethod === method.id;

                            return (
                                <div key={method.id} className={s.methodContainer}>
                                    <label className={s.methodItem}>
                                        <input 
                                            type="radio" 
                                            name="deliveryMethod"
                                            value={method.id}
                                            checked={isSelected}
                                            onChange={() => setDeliveryMethod(method.id)}
                                            className={s.hiddenRadio}
                                        />
                                        <span className={s.radioCircle} />
                                        <span className={s.methodLabel}>
                                            {method.label} 
                                            <span className={s.methodPrice}>
                                                ({method.price === 0 ? 'Безкоштовно' : `${method.price} ₴`})
                                            </span>
                                            {('isNP' in method && method.isNP) && (
                                                <div className={s.npIconContainer}>
                                                    <Image
                                                        src="/icons/novaposhta_rounded.svg"
                                                        alt="Nova Poshta"
                                                        width={20}
                                                        height={20}
                                                        className={s.npIcon}
                                                    />
                                                </div>
                                            )}
                                        </span>
                                    </label>
                                    
                                    {(isSelected && isCourier) && (
                                        <div className={s.nestedAddressRow}>
                                            <AddressRow 
                                                addresses={addresses}
                                                selectedAddressId={selectedAddressId}
                                                onSelect={setSelectedAddressId}
                                                onAddClick={() => setIsAddAddressModalOpen(true)}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={s.freeDeliveryBlock}>
                    <div className={s.freeDeliveryText}>
                        Для безкоштовної доставки не вистачає <span>{freeDeliveryMissing} ₴</span>
                    </div>
                </div>

                <div className={s.formSection}>
                    <h2 className={s.sectionTitle}>Оберіть бажаний час доставки чи самовивозу</h2>
                    <div className={s.timeSelectors}>
                        <DatePicker 
                            selected={deliveryDate}
                            onChange={(date: Date | null) => setDeliveryDate(date)}
                            className={s.timeSelect}
                        />
                        <CustomSelect 
                            options={MOCK_TIMES}
                            value={deliveryTime}
                            onChange={setDeliveryTime}
                            className={s.timeSelect}
                            arrowVariant="right"
                            leftIcon={
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M9 2.625C5.48475 2.625 2.625 5.48475 2.625 9C2.625 12.5153 5.48475 15.375 9 15.375C12.5153 15.375 15.375 12.5153 15.375 9C15.375 5.48475 12.5153 2.625 9 2.625ZM9 16.5C4.8645 16.5 1.5 13.1355 1.5 9C1.5 4.8645 4.8645 1.5 9 1.5C13.1355 1.5 16.5 4.8645 16.5 9C16.5 13.1355 13.1355 16.5 9 16.5Z" fill="#E3051B"/>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M11.5736 11.7695C11.4753 11.7695 11.3763 11.744 11.2856 11.6908L8.45809 10.004C8.28859 9.90203 8.18359 9.71828 8.18359 9.52028V5.88428C8.18359 5.57378 8.43559 5.32178 8.74609 5.32178C9.05734 5.32178 9.30859 5.57378 9.30859 5.88428V9.20078L11.8623 10.7233C12.1286 10.883 12.2163 11.228 12.0573 11.495C11.9516 11.6713 11.7648 11.7695 11.5736 11.7695Z" fill="#E3051B"/>
                                </svg>
                            }
                        />
                    </div>
                </div>

                <div className={s.actions}>
                    <Button 
                        variant="red" 
                        onClick={handleNext}
                        className={s.nextBtn}
                    >
                        ДАЛІ
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
                    deliveryPrice={deliveryMethods.find(m => m.id === deliveryMethod)?.price || 0}
                />
                <PromoBlock 
                    onApply={(code, discount) => setAppliedPromo({ code, discount })} 
                    isApplied={!!appliedPromo}
                />
                
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
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <AddAddressModal 
                isOpen={isAddAddressModalOpen} 
                onClose={() => setIsAddAddressModalOpen(false)} 
                onAdd={handleAddAddress}
            />
        </div>
    );
}
