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
import Search from '@/app/components/ui/Search/Search';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import CartModal from '@/app/components/CartModal/CartModal';
import AuthModal from '@/app/components/AuthModal';
import { useParams } from 'next/navigation';
import AddressRow from '../components/AddressRow/AddressRow';
import AddAddressModal from '@/app/components/AddAddressModal/AddAddressModal';
import Image from 'next/image';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { getAccessToken } from '@/app/actions/authActions';
import { setSelectedCity } from '@/store/slices/localitySlice';
import { 
    getLocalitiesApi, 
    selectLocalityApi, 
    getDeliveriesApi, 
    getDeliveryTimesApi, 
    getWarehousesApi, 
    addUserPickupPointApi, 
    getUserAddressesApi, 
    createUserAddressApi, 
    getShopsApi,
    Locality,
    Delivery,
    Warehouse,
    Shop
} from '@/lib/graphql';

interface Address {
    id: string;
    title: string;
    street: string;
}

function formatDeliveryTimesDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} 00:00:00.000000`;
}

function formatDate(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
}

export default function Step2() {
    const hydrated = useIsHydrated();
    const dispatch = useAppDispatch();
    const params = useParams();
    const lang = (params?.lang as 'ua' | 'ru') || 'ua';
    
    const { isAuthenticated } = useAppSelector(state => state.auth);
    const selectedCity = useAppSelector(state => state.locality.selectedCity);
    
    // API lists
    const [citiesList, setCitiesList] = useState<Locality[]>([]);
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [dbAddresses, setDbAddresses] = useState<any[]>([]);
    const [guestAddresses, setGuestAddresses] = useState<Address[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    
    // Selected fields
    const [deliveryMethod, setDeliveryMethod] = useState('');
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [selectedShopId, setSelectedShopId] = useState<string>('');
    const [npSearchQuery, setNpSearchQuery] = useState('');
    const [npResults, setNpResults] = useState<Warehouse[]>([]);
    const [selectedNPRef, setSelectedNPRef] = useState<string>('');
    const [isSearchingNP, setIsSearchingNP] = useState(false);
    
    const [deliveryDate, setDeliveryDate] = useState<Date | null>(new Date());
    const [deliveryTimes, setDeliveryTimes] = useState<string[]>([]);
    const [deliveryTime, setDeliveryTime] = useState('');
    const [isLoadingTimes, setIsLoadingTimes] = useState(false);
    
    // UI states
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
    
    const [restoredData, setRestoredData] = useState<any>(null);

    // 1. Restore saved states from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('checkout_delivery_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setRestoredData(parsed);
                if (parsed.deliveryMethod) setDeliveryMethod(parsed.deliveryMethod);
                if (parsed.selectedAddressId) setSelectedAddressId(parsed.selectedAddressId);
                if (parsed.selectedShopId) setSelectedShopId(parsed.selectedShopId);
                if (parsed.selectedNPRef) setSelectedNPRef(parsed.selectedNPRef);
                if (parsed.npSearchQuery) setNpSearchQuery(parsed.npSearchQuery);
                if (parsed.deliveryDate) setDeliveryDate(new Date(parsed.deliveryDate));
                if (parsed.deliveryTime) setDeliveryTime(parsed.deliveryTime);
            } catch (e) {
                console.error('Failed to parse checkout delivery data', e);
            }
        }
    }, []);

    // 2. Load cities list on mount
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await getLocalitiesApi(undefined, 100, 1, lang);
                setCitiesList(res.data);
            } catch (e) {
                console.error('Failed to fetch cities list', e);
            }
        };
        fetchCities();
    }, [lang]);

    // 3. Load user addresses if authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            setDbAddresses([]);
            return;
        }
        const fetchAddresses = async () => {
            try {
                const token = await getAccessToken();
                if (token) {
                    const res = await getUserAddressesApi(token);
                    setDbAddresses(res);
                }
            } catch (e) {
                console.error('Failed to fetch user addresses', e);
            }
        };
        fetchAddresses();
    }, [isAuthenticated]);

    // 4. Load shops list on mount
    useEffect(() => {
        const fetchShops = async () => {
            try {
                const res = await getShopsApi({ limit: 100, onlyCompanyStores: true }, lang);
                setShops(res.shops.data);
            } catch (e) {
                console.error('Failed to fetch shops', e);
            }
        };
        fetchShops();
    }, [lang]);

    // 5. Initialize selected shop
    useEffect(() => {
        if (shops.length > 0 && !selectedShopId) {
            setSelectedShopId(shops[0].id.toString());
        }
    }, [shops, selectedShopId]);

    // 6. Fetch deliveries when city changes
    useEffect(() => {
        if (!selectedCity) return;
        const fetchDeliveries = async () => {
            try {
                const res = await getDeliveriesApi(undefined, selectedCity.id, lang);
                setDeliveries(res);
                
                // Determine what delivery method to select
                let restored = '';
                if (restoredData && res.some(d => d.id === restoredData.deliveryMethod)) {
                    restored = restoredData.deliveryMethod;
                } else {
                    const saved = localStorage.getItem('checkout_delivery_data');
                    if (saved) {
                        try {
                            const parsed = JSON.parse(saved);
                            if (parsed.deliveryMethod && res.some(d => d.id === parsed.deliveryMethod)) {
                                restored = parsed.deliveryMethod;
                            }
                        } catch (e) {}
                    }
                }
                
                if (restored) {
                    setDeliveryMethod(restored);
                } else {
                    const firstEnabled = res.find(d => !d.disabled);
                    if (firstEnabled) {
                        setDeliveryMethod(firstEnabled.id);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch deliveries for locality', e);
            }
        };
        fetchDeliveries();
    }, [selectedCity, lang, restoredData]);

    // 7. Debounced search for Nova Poshta warehouses
    useEffect(() => {
        if (!selectedCity) {
            setNpResults([]);
            return;
        }
        const fetchNP = async () => {
            setIsSearchingNP(true);
            try {
                const res = await getWarehousesApi(selectedCity.id, npSearchQuery, 50, 1, lang);
                setNpResults(res.data);
            } catch (e) {
                console.error('Failed to fetch Nova Poshta warehouses', e);
            } finally {
                setIsSearchingNP(false);
            }
        };
        const timer = setTimeout(fetchNP, 300);
        return () => clearTimeout(timer);
    }, [npSearchQuery, selectedCity, lang]);

    // 8. Fetch dynamic delivery times
    useEffect(() => {
        if (!deliveryMethod || !deliveryDate) return;
        const fetchTimes = async () => {
            setIsLoadingTimes(true);
            try {
                const formattedDate = formatDeliveryTimesDate(deliveryDate);
                const times = await getDeliveryTimesApi(parseInt(deliveryMethod, 10), formattedDate, lang);
                setDeliveryTimes(times);
                
                if (times.length > 0) {
                    if (!times.includes(deliveryTime)) {
                        setDeliveryTime(times[0]);
                    }
                } else {
                    setDeliveryTime('');
                }
            } catch (e) {
                console.error('Failed to fetch delivery times', e);
                setDeliveryTimes([]);
                setDeliveryTime('');
            } finally {
                setIsLoadingTimes(false);
            }
        };
        fetchTimes();
    }, [deliveryMethod, deliveryDate, lang]);

    // 9. Load saved promo
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

    // Address list mapping
    const formattedDbAddresses = React.useMemo(() => {
        return dbAddresses.map(addr => ({
            id: addr.id.toString(),
            title: addr.isDefault ? 'Основна адреса' : 'Адреса',
            street: `вул. ${addr.street || ''}, буд. ${addr.house || ''}` + (addr.apartment ? `, кв. ${addr.apartment}` : '')
        }));
    }, [dbAddresses]);

    const addresses = React.useMemo(() => {
        return [...formattedDbAddresses, ...guestAddresses];
    }, [formattedDbAddresses, guestAddresses]);

    // Set default selected address
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(addresses[0].id);
        }
    }, [addresses, selectedAddressId]);

    const activeDelivery = React.useMemo(() => {
        return deliveries.find(d => d.id === deliveryMethod);
    }, [deliveries, deliveryMethod]);

    const isCourier = activeDelivery?.driver === 'courier';
    const isNP = activeDelivery?.driver === 'nova-poshta-postal';
    const isShop = activeDelivery?.driver === 'shop';
    const showDeliveryTimeBlock = activeDelivery ? activeDelivery.showDeliveryTime : true;
    const elapsedForFree = activeDelivery?.elapsedForFree || 0;
    const deliveryPrice = activeDelivery?.deliveryCost || 0;

    const cityOptions = React.useMemo(() => {
        const list = [...citiesList];
        if (selectedCity && !list.some(c => c.id === selectedCity.id)) {
            list.unshift(selectedCity);
        }
        return list.map(c => ({
            value: c.id.toString(),
            label: c.name
        }));
    }, [citiesList, selectedCity]);

    const shopOptions = React.useMemo(() => {
        return shops.map(shop => ({
            value: shop.id.toString(),
            label: shop.name || shop.siteName || `Магазин №${shop.id}`
        }));
    }, [shops]);

    const timeOptions = React.useMemo(() => {
        return deliveryTimes.map(t => ({
            value: t,
            label: t
        }));
    }, [deliveryTimes]);

    const handleCityChange = async (cityIdStr: string) => {
        const cityId = parseInt(cityIdStr, 10);
        const cityObj = citiesList.find(c => c.id === cityId) || (selectedCity?.id === cityId ? selectedCity : null);
        if (cityObj) {
            dispatch(setSelectedCity(cityObj));
            try {
                await selectLocalityApi(cityId, lang);
            } catch (e) {
                console.error('Failed to select locality on backend', e);
            }
        }
    };

    const handleBack = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('step', '1');
        window.history.pushState({}, '', url.toString());
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNext = async () => {
        setValidationError('');
        
        if (!activeDelivery) {
            setValidationError('Будь ласка, оберіть спосіб доставки');
            return;
        }
        
        if (isCourier && !selectedAddressId) {
            setValidationError('Будь ласка, додайте або оберіть адресу доставки');
            return;
        }
        
        if (isShop && !selectedShopId) {
            setValidationError('Будь ласка, оберіть магазин для самовивозу');
            return;
        }
        
        if (isNP && !selectedNPRef) {
            setValidationError('Будь ласка, оберіть відділення Нової Пошти');
            return;
        }
        
        if (showDeliveryTimeBlock && !deliveryTime) {
            setValidationError('Будь ласка, оберіть бажаний час доставки');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            let finalPickupPointId: number | null = null;
            if (isShop || isNP) {
                const token = await getAccessToken();
                const type = isShop ? 'brand_store' : 'nova_poshta';
                const key = isShop ? selectedShopId : selectedNPRef;
                
                const pickupPoint = await addUserPickupPointApi(type, key, token || '', lang);
                finalPickupPointId = parseInt(pickupPoint.id, 10);
            }
            
            // Save state to localStorage for back navigation / reload restoration
            const rawData = {
                deliveryMethod,
                selectedAddressId,
                selectedShopId,
                selectedNPRef,
                npSearchQuery,
                deliveryDate: deliveryDate ? deliveryDate.toISOString() : null,
                deliveryTime,
            };
            localStorage.setItem('checkout_delivery_data', JSON.stringify(rawData));
            
            // Save step 3 parameters
            const checkoutDeliveryParams = {
                deliveryId: parseInt(deliveryMethod, 10),
                userAddressId: isCourier ? (selectedAddressId ? parseInt(selectedAddressId, 10) : null) : null,
                desiredDeliveryDate: deliveryDate ? formatDate(deliveryDate) : null,
                desiredDeliveryTime: deliveryTime || null,
                userPickupPointId: finalPickupPointId,
                deliveryPrice: deliveryPrice,
            };
            localStorage.setItem('checkout_delivery_params', JSON.stringify(checkoutDeliveryParams));
            
            const url = new URL(window.location.href);
            url.searchParams.set('step', '3');
            window.history.pushState({}, '', url.toString());
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            console.error('Failed to proceed to step 3:', e);
            setValidationError('Сталася помилка при збереженні вибору доставки. Спробуйте ще раз.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddAddress = async (newAddr: {
        id: string;
        title: string;
        street: string;
        city?: string;
        house?: string;
        apartment?: string;
        entrance?: string;
        floor?: string;
    }) => {
        try {
            const token = await getAccessToken();
            if (token) {
                const created = await createUserAddressApi({
                    city: newAddr.city || selectedCity?.name || 'Київ',
                    street: newAddr.street,
                    house: newAddr.house || '',
                    apartment: newAddr.apartment ? parseInt(newAddr.apartment, 10) : undefined,
                    entrance: newAddr.entrance ? parseInt(newAddr.entrance, 10) : undefined,
                    floor: newAddr.floor ? parseInt(newAddr.floor, 10) : undefined,
                    isDefault: true,
                }, token);
                
                setDbAddresses(prev => [created, ...prev]);
                setSelectedAddressId(created.id.toString());
            } else {
                const tempAddr: Address = {
                    id: newAddr.id || Math.random().toString(),
                    title: newAddr.title || 'Тимчасова адреса',
                    street: `вул. ${newAddr.street}, буд. ${newAddr.house || ''}` + (newAddr.apartment ? `, кв. ${newAddr.apartment}` : ''),
                };
                setGuestAddresses(prev => [...prev, tempAddr]);
                setSelectedAddressId(tempAddr.id);
            }
        } catch (e) {
            console.error('Failed to create address:', e);
            const tempAddr: Address = {
                id: newAddr.id || Math.random().toString(),
                title: newAddr.title || 'Тимчасова адреса',
                street: `вул. ${newAddr.street}, буд. ${newAddr.house || ''}` + (newAddr.apartment ? `, кв. ${newAddr.apartment}` : ''),
            };
            setGuestAddresses(prev => [...prev, tempAddr]);
            setSelectedAddressId(tempAddr.id);
        }
    };

    const currentCityId = selectedCity?.id?.toString() || '';

    return (
        <div className={s.layout}>
            {/* ── Left: Delivery Form ── */}
            <div className={s.formCard}>
                <StepIndicator current={2} />

                <div className={s.formSection}>
                    <h2 className={s.sectionTitle}>Ваше місто ?</h2>
                    {hydrated && (
                        <CustomSelect 
                            options={cityOptions}
                            value={currentCityId}
                            onChange={handleCityChange}
                            className={s.citySelect}
                        />
                    )}
                </div>

                <div className={s.formSection}>
                    <h2 className={s.sectionTitle}>Оберіть спосіб доставки чи самовивозу</h2>
                    <div className={s.deliveryMethods}>
                        {deliveries.map(method => {
                            const isSelected = deliveryMethod === method.id;
                            const isMethodCourier = method.driver === 'courier';
                            const isMethodShop = method.driver === 'shop';
                            const isMethodNP = method.driver === 'nova-poshta-postal';
                            const showNpIcon = isMethodNP || method.name?.toLowerCase().includes('нова пошта') || method.type?.toLowerCase().includes('nova');

                            if (method.disabled) return null;

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
                                            {method.name} 
                                            <span className={s.methodPrice}>
                                                ({method.deliveryCost === 0 ? 'Безкоштовно' : `${method.deliveryCost} ₴`})
                                            </span>
                                            {showNpIcon && (
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
                                    
                                    {(hydrated && isSelected && isMethodCourier) && (
                                        <div className={s.nestedAddressRow}>
                                            <AddressRow 
                                                addresses={addresses}
                                                selectedAddressId={selectedAddressId}
                                                onSelect={setSelectedAddressId}
                                                onAddClick={() => setIsAddAddressModalOpen(true)}
                                            />
                                        </div>
                                    )}

                                    {(hydrated && isSelected && isMethodShop) && (
                                        <div className={s.nestedSelectRow}>
                                            <h4 className={s.nestedSelectTitle}>Оберіть магазин М'ясторія:</h4>
                                            <CustomSelect 
                                                options={shopOptions}
                                                value={selectedShopId}
                                                onChange={setSelectedShopId}
                                                placeholder="Оберіть магазин"
                                                className={s.nestedSelect}
                                            />
                                        </div>
                                    )}

                                    {(hydrated && isSelected && isMethodNP) && (
                                        <div className={s.nestedSelectRow}>
                                            <h4 className={s.nestedSelectTitle}>Введіть номер або адресу відділення Нової Пошти:</h4>
                                            <Search 
                                                value={npSearchQuery}
                                                onChange={setNpSearchQuery}
                                                placeholder="Пошук відділення (наприклад: 125 або Хрещатик)"
                                                showButton={false}
                                                className={s.nestedSearch}
                                            />
                                            {isSearchingNP ? (
                                                <div className={s.npLoader}>Пошук відділень...</div>
                                            ) : (
                                                <div className={s.npResultsList}>
                                                    {npResults.map(wh => {
                                                        const isWhSelected = selectedNPRef === wh.ref;
                                                        return (
                                                            <div 
                                                                key={wh.ref} 
                                                                className={clsx(s.npResultItem, isWhSelected && s.npResultItemActive)}
                                                                onClick={() => setSelectedNPRef(wh.ref)}
                                                            >
                                                                <div className={s.npName}>{wh.name}</div>
                                                                {wh.schedule && wh.schedule.length > 0 && (
                                                                    <div className={s.npSchedule}>
                                                                        {wh.schedule.map((sch, idx) => (
                                                                            <span key={idx} className={s.npScheduleItem}>
                                                                                {sch.days}: {sch.workTime}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                    {!isSearchingNP && npResults.length === 0 && (
                                                        <div className={s.npNoResults}>Нічого не знайдено</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {hydrated && elapsedForFree > 0 && (
                    <div className={s.freeDeliveryBlock}>
                        <div className={s.freeDeliveryText}>
                            Для безкоштовної доставки не вистачає <span>{elapsedForFree} ₴</span>
                        </div>
                    </div>
                )}

                {hydrated && showDeliveryTimeBlock && (
                    <div className={s.formSection}>
                        <h2 className={s.sectionTitle}>Оберіть бажаний час доставки чи самовивозу</h2>
                        <div className={s.timeSelectors}>
                            <DatePicker 
                                selected={deliveryDate}
                                onChange={(date: Date | null) => setDeliveryDate(date)}
                                className={s.timeSelect}
                            />
                            <CustomSelect 
                                options={timeOptions}
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
                )}

                {validationError && (
                    <div className={s.errorText}>{validationError}</div>
                )}

                <div className={s.actions}>
                    <Button 
                        variant="red" 
                        onClick={handleNext}
                        className={s.nextBtn}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'ЗБЕРЕЖЕННЯ...' : 'ДАЛІ'}
                    </Button>
                    <button 
                        type="button" 
                        onClick={handleBack} 
                        className={s.backBtn}
                        disabled={isSubmitting}
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
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <AddAddressModal 
                isOpen={isAddAddressModalOpen} 
                onClose={() => setIsAddAddressModalOpen(false)} 
                onAdd={handleAddAddress}
            />
        </div>
    );
}
