'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import s from './Step2.module.scss';
import StepIndicator from '../components/StepIndicator';
import CartSummary from '../components/CartSummary';
import PromoBlock from '../components/PromoBlock/Index';
import CustomSelect from '@/app/components/ui/CustomSelect/index';
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
    const [deliveryDate, setDeliveryDate] = useState(MOCK_DATES[0].value);
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
                        <CustomSelect 
                            options={MOCK_DATES}
                            value={deliveryDate}
                            onChange={setDeliveryDate}
                            className={s.timeSelect}
                            arrowVariant="right"
                            leftIcon={
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M7 8.4C7.13845 8.4 7.27379 8.35895 7.3889 8.28203C7.50401 8.20511 7.59373 8.09579 7.64672 7.96788C7.6997 7.83997 7.71356 7.69922 7.68655 7.56344C7.65954 7.42765 7.59287 7.30292 7.49497 7.20503C7.39708 7.10713 7.27235 7.04046 7.13656 7.01345C7.00078 6.98644 6.86003 7.0003 6.73212 7.05328C6.60421 7.10627 6.49489 7.19599 6.41797 7.3111C6.34105 7.42621 6.3 7.56155 6.3 7.7C6.3 7.88565 6.37375 8.0637 6.50503 8.19497C6.6363 8.32625 6.81435 8.4 7 8.4ZM10.5 8.4C10.6384 8.4 10.7738 8.35895 10.8889 8.28203C11.004 8.20511 11.0937 8.09579 11.1467 7.96788C11.1997 7.83997 11.2136 7.69922 11.1865 7.56344C11.1595 7.42765 11.0929 7.30292 10.995 7.20503C10.8971 7.10713 10.7724 7.04046 10.6366 7.01345C10.5008 6.98644 10.36 7.0003 10.2321 7.05328C10.1042 7.10627 9.99489 7.19599 9.91797 7.3111C9.84105 7.42621 9.8 7.56155 9.8 7.7C9.8 7.88565 9.87375 8.0637 10.005 8.19497C10.1363 8.32625 10.3143 8.4 10.5 8.4ZM7 11.2C7.13845 11.2 7.27379 11.1589 7.3889 11.082C7.50401 11.0051 7.59373 10.8958 7.64672 10.7679C7.6997 10.64 7.71356 10.4992 7.68655 10.3634C7.65954 10.2276 7.59287 10.1029 7.49497 10.005C7.39708 9.90713 7.27235 9.84046 7.13656 9.81345C7.00078 9.78644 6.86003 9.8003 6.73212 9.85328C6.60421 9.90627 6.49489 9.99599 6.41797 10.1111C6.34105 10.2262 6.3 10.3616 6.3 10.5C6.3 10.6857 6.37375 10.8637 6.50503 10.995C6.6363 11.1263 6.81435 11.2 7 11.2ZM10.5 11.2C10.6384 11.2 10.7738 11.1589 10.8889 11.082C11.004 11.0051 11.0937 10.8958 11.1467 10.7679C11.1997 10.64 11.2136 10.4992 11.1865 10.3634C11.1595 10.2276 11.0929 10.1029 10.995 10.005C10.8971 9.90713 10.7724 9.84046 10.6366 9.81345C10.5008 9.78644 10.36 9.8003 10.2321 9.85328C10.1042 9.90627 9.99489 9.99599 9.91797 10.1111C9.84105 10.2262 9.8 10.3616 9.8 10.5C9.8 10.6857 9.87375 10.8637 10.005 10.995C10.1363 11.1263 10.3143 11.2 10.5 11.2ZM3.5 8.4C3.63845 8.4 3.77378 8.35895 3.8889 8.28203C4.00401 8.20511 4.09373 8.09579 4.14672 7.96788C4.1997 7.83997 4.21356 7.69922 4.18655 7.56344C4.15954 7.42765 4.09287 7.30292 3.99497 7.20503C3.89708 7.10713 3.77235 7.04046 3.63656 7.01345C3.50078 6.98644 3.36003 7.0003 3.23212 7.05328C3.10421 7.10627 2.99489 7.19599 2.91797 7.3111C2.84105 7.42621 2.8 7.56155 2.8 7.7C2.8 7.88565 2.87375 8.0637 3.00503 8.19497C3.1363 8.32625 3.31435 8.4 3.5 8.4ZM11.9 1.4H11.2V0.7C11.2 0.514348 11.1263 0.336301 10.995 0.205025C10.8637 0.0737498 10.6857 0 10.5 0C10.3143 0 10.1363 0.0737498 10.005 0.205025C9.87375 0.336301 9.8 0.514348 9.8 0.7V1.4H4.2V0.7C4.2 0.514348 4.12625 0.336301 3.99497 0.205025C3.8637 0.0737498 3.68565 0 3.5 0C3.31435 0 3.1363 0.0737498 3.00503 0.205025C2.87375 0.336301 2.8 0.514348 2.8 0.7V1.4H2.1C1.54305 1.4 1.0089 1.62125 0.615076 2.01508C0.221249 2.4089 0 2.94305 0 3.5V11.9C0 12.457 0.221249 12.9911 0.615076 13.3849C1.0089 13.7788 1.54305 14 2.1 14H11.9C12.457 14 12.9911 13.7788 13.3849 13.3849C13.7788 12.9911 14 12.457 14 11.9V3.5C14 2.94305 13.7788 2.4089 13.3849 2.01508C12.9911 1.62125 12.457 1.4 11.9 1.4ZM12.6 11.9C12.6 12.0857 12.5263 12.2637 12.395 12.395C12.2637 12.5263 12.0857 12.6 11.9 12.6H2.1C1.91435 12.6 1.7363 12.5263 1.60503 12.395C1.47375 12.2637 1.4 12.0857 1.4 11.9V5.6H12.6V11.9ZM12.6 4.2H1.4V3.5C1.4 3.31435 1.47375 3.1363 1.60503 3.00503C1.7363 2.87375 1.91435 2.8 2.1 2.8H11.9C12.0857 2.8 12.2637 2.87375 12.395 3.00503C12.5263 3.1363 12.6 3.31435 12.6 3.5V4.2ZM3.5 11.2C3.63845 11.2 3.77378 11.1589 3.8889 11.082C4.00401 11.0051 4.09373 10.8958 4.14672 10.7679C4.1997 10.64 4.21356 10.4992 4.18655 10.3634C4.15954 10.2276 4.09287 10.1029 3.99497 10.005C3.89708 9.90713 3.77235 9.84046 3.63656 9.81345C3.50078 9.78644 3.36003 9.8003 3.23212 9.85328C3.10421 9.90627 2.99489 9.99599 2.91797 10.1111C2.84105 10.2262 2.8 10.3616 2.8 10.5C2.8 10.6857 2.87375 10.8637 3.00503 10.995C3.1363 11.1263 3.31435 11.2 3.5 11.2Z" fill="#E3051B"/>
                                </svg>
                            }
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
