'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { setSelectedCity } from '@/store/slices/localitySlice';
import { fetchCartAsync } from '@/store/slices/cartSlice';
import CartModal from '@/app/components/CartModal/CartModal';
import AuthModal from '@/app/components/AuthModal';
import { useParams } from 'next/navigation';
import AddressRow from '../components/AddressRow/AddressRow';
import AddAddressModal from '@/app/components/AddAddressModal/AddAddressModal';
import PickupPointRow from '../components/PickupPointRow/PickupPointRow';
import AddPickupModal from '@/app/components/Personal/Pickup/AddPickupModal';
import Image from 'next/image';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { getAccessToken } from '@/app/actions/authActions';
import Spinner from '@/app/components/ui/Spinner/Spinner';
import { 
    getLocalitiesApi, 
    getDeliveriesApi, 
    getDeliveryTimesApi, 
    getWarehousesApi, 
    addUserPickupPointApi, 
    getUserPickupPointsApi,
    getUserAddressesApi, 
    createUserAddressApi, 
    getShopsApi,
    Locality,
    Delivery,
    Warehouse,
    Shop,
    UserPickupPoint,
    UserAddress
} from '@/lib/graphql';

interface Address {
    id: string;
    title: string;
    street: string;
    city?: string;
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

function isSameDay(d1: Date | null, d2: Date | null): boolean {
    if (!d1 || !d2) return d1 === d2;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

const PAGE_SIZE = 50;

export default function Step2() {
    const hydrated = useIsHydrated();
    const dispatch = useAppDispatch();
    const params = useParams();
    const lang = (params?.lang as 'ua' | 'ru') || 'ua';
    
    const { isAuthenticated } = useAppSelector(state => state.auth);
    const cartItems = useAppSelector(state => state.cart.items);
    const cartLoading = useAppSelector(state => state.cart.loading);
    const headerCity = useAppSelector(state => state.locality.selectedCity);
    const [checkoutCity, setCheckoutCity] = useState<Locality | null>(null);
    
    const citySelectRef = useRef<HTMLDivElement>(null);
    const npSelectRef = useRef<HTMLDivElement>(null);
    const isLoadingMoreCitiesRef = useRef(false);

    // Local states for custom city selector
    const [isOpenCitySelect, setIsOpenCitySelect] = useState(false);
    const [citySearchQuery, setCitySearchQuery] = useState('');
    const [citySearchResults, setCitySearchResults] = useState<Locality[]>([]);
    const [citySearchPage, setCitySearchPage] = useState(1);
    const [hasMoreSearchCities, setHasMoreSearchCities] = useState(true);
    const [isSearchingCities, setIsSearchingCities] = useState(false);
    
    const [allCitiesList, setAllCitiesList] = useState<Locality[]>([]);
    const [allCitiesPage, setAllCitiesPage] = useState(1);
    const [hasMoreAllCities, setHasMoreAllCities] = useState(true);
    const [isLoadingCitiesList, setIsLoadingCitiesList] = useState(false);
    const [isLoadingMoreCities, setIsLoadingMoreCities] = useState(false);

    // Local states for Nova Poshta selection dropdown
    const [isOpenNPDropdown, setIsOpenNPDropdown] = useState(false);
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [dbAddresses, setDbAddresses] = useState<UserAddress[]>([]);
    const [guestAddresses, setGuestAddresses] = useState<Address[]>([]);
    const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(true);
    const [shops, setShops] = useState<Shop[]>([]);
    const [userPickupPoints, setUserPickupPoints] = useState<UserPickupPoint[]>([]);
    const [guestPickupPoints, setGuestPickupPoints] = useState<UserPickupPoint[]>([]);

    // Selected fields
    const [deliveryMethod, setDeliveryMethod] = useState('');
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [selectedShopId, setSelectedShopId] = useState<string>('');
    const [isAddPickupModalOpen, setIsAddPickupModalOpen] = useState(false);
    const [npSearchQuery, setNpSearchQuery] = useState('');
    const [npResults, setNpResults] = useState<Warehouse[]>([]);
    const [selectedNPRef, setSelectedNPRef] = useState<string>('');
    const [isSearchingNP, setIsSearchingNP] = useState(false);

    const prevCityIdRef = useRef<number | null>(null);
    const deliveryMethodRef = useRef(deliveryMethod);
    useEffect(() => {
        deliveryMethodRef.current = deliveryMethod;
    }, [deliveryMethod]);
    
    const [deliveryDate, setDeliveryDate] = useState<Date | null>(new Date());
    const [deliveryTimes, setDeliveryTimes] = useState<string[]>([]);
    const [deliveryTime, setDeliveryTime] = useState('');
    
    // UI states
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Promo functionality from Redux
    const promoCode = useAppSelector(state => state.cart.promoCode);
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
    
    const [restoredData, setRestoredData] = useState<Record<string, unknown> | null>(null);

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
                if (parsed.deliveryDate) {
                    const restoredDate = new Date(parsed.deliveryDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const compareDate = new Date(restoredDate);
                    compareDate.setHours(0, 0, 0, 0);
                    setDeliveryDate(prev => {
                        const targetDateObj = compareDate >= today ? restoredDate : new Date();
                        if (isSameDay(prev, targetDateObj)) return prev;
                        return targetDateObj;
                    });
                }
                if (parsed.deliveryTime) setDeliveryTime(parsed.deliveryTime);
                if (parsed.selectedCity) {
                    setCheckoutCity(parsed.selectedCity);
                }
            } catch (e) {
                console.error('Failed to parse checkout delivery data', e);
            }
        }
    }, []);

    // 1b. Initialize local city state with headerCity if checkoutCity is not set yet
    useEffect(() => {
        if (headerCity && !checkoutCity) {
            setCheckoutCity(headerCity);
        }
    }, [headerCity, checkoutCity]);

    // 2. Load initial cities list on first open
    useEffect(() => {
        if (!isOpenCitySelect || allCitiesList.length > 0 || isLoadingCitiesList) return;

        const fetchInitialCities = async () => {
            setIsLoadingCitiesList(true);
            try {
                const res = await getLocalitiesApi(undefined, PAGE_SIZE, 1, lang);
                const list = [...res.data];
                if (checkoutCity && !list.some(c => c.id === checkoutCity.id)) {
                    list.unshift(checkoutCity);
                }
                setAllCitiesList(list);
                setHasMoreAllCities(res.has_more_pages);
                setAllCitiesPage(1);
            } catch (error) {
                console.error('Failed to fetch initial cities:', error);
            } finally {
                setIsLoadingCitiesList(false);
            }
        };
        fetchInitialCities();
    }, [isOpenCitySelect, allCitiesList.length, isLoadingCitiesList, checkoutCity, lang]);

    // 2b. Debounced search for cities
    useEffect(() => {
        if (citySearchQuery.length >= 2) {
            const searchCities = async () => {
                setIsSearchingCities(true);
                isLoadingMoreCitiesRef.current = false;
                try {
                    const res = await getLocalitiesApi(citySearchQuery, PAGE_SIZE, 1, lang);
                    const uniqueData = res.data.filter((c, index, self) =>
                        self.findIndex(item => item.id === c.id) === index
                    );
                    setCitySearchResults(uniqueData);
                    setHasMoreSearchCities(res.has_more_pages);
                    setCitySearchPage(1);
                } catch (error) {
                    console.error('City search failed:', error);
                } finally {
                    setIsSearchingCities(false);
                }
            };
            const timer = setTimeout(searchCities, 300);
            return () => clearTimeout(timer);
        } else {
            setCitySearchResults([]);
            isLoadingMoreCitiesRef.current = false;
        }
    }, [citySearchQuery, lang]);

    // 2c. Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (citySelectRef.current && !citySelectRef.current.contains(event.target as Node)) {
                setIsOpenCitySelect(false);
            }
            if (npSelectRef.current && !npSelectRef.current.contains(event.target as Node)) {
                setIsOpenNPDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLoadMoreCities = async () => {
        if (isLoadingMoreCitiesRef.current) return;
        isLoadingMoreCitiesRef.current = true;
        setIsLoadingMoreCities(true);

        if (citySearchQuery.length >= 2 && hasMoreSearchCities) {
            try {
                const nextPage = citySearchPage + 1;
                const res = await getLocalitiesApi(citySearchQuery, PAGE_SIZE, nextPage, lang);
                setCitySearchResults(prev => {
                    const existingIds = new Set(prev.map(c => c.id));
                    const newItems = res.data.filter(c => !existingIds.has(c.id));
                    return [...prev, ...newItems];
                });
                setHasMoreSearchCities(res.has_more_pages);
                setCitySearchPage(nextPage);
            } catch (error) {
                console.error('Load more search cities error:', error);
            } finally {
                setIsLoadingMoreCities(false);
                isLoadingMoreCitiesRef.current = false;
            }
        } else if (citySearchQuery.length < 2 && hasMoreAllCities) {
            try {
                const nextPage = allCitiesPage + 1;
                const res = await getLocalitiesApi(undefined, PAGE_SIZE, nextPage, lang);
                setAllCitiesList(prev => {
                    const existingIds = new Set(prev.map(c => c.id));
                    const newItems = res.data.filter(c => !existingIds.has(c.id));
                    return [...prev, ...newItems];
                });
                setHasMoreAllCities(res.has_more_pages);
                setAllCitiesPage(nextPage);
            } catch (error) {
                console.error('Load more cities error:', error);
            } finally {
                setIsLoadingMoreCities(false);
                isLoadingMoreCitiesRef.current = false;
            }
        } else {
            setIsLoadingMoreCities(false);
            isLoadingMoreCitiesRef.current = false;
        }
    };

    const handleCityScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const reachedBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
        if (reachedBottom && !isLoadingMoreCitiesRef.current) {
            handleLoadMoreCities();
        }
    };

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

    // 5. Load user pickup points if authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            setUserPickupPoints([]);
            return;
        }
        const fetchPoints = async () => {
            try {
                const token = await getAccessToken();
                if (token) {
                    const data = await getUserPickupPointsApi('brand_store', token, lang);
                    setUserPickupPoints(data);
                }
            } catch (e) {
                console.error('Failed to fetch user pickup points', e);
            }
        };
        fetchPoints();
    }, [isAuthenticated, lang]);

    // 6. Fetch deliveries when city or cart changes
    useEffect(() => {
        if (!checkoutCity) {
            setDeliveries([]);
            setDeliveryMethod('');
            setSelectedNPRef('');
            setNpSearchQuery('');
            setIsOpenNPDropdown(false);
            prevCityIdRef.current = null;
            setIsLoadingDeliveries(false);
            return;
        }

        if (cartLoading) {
            return;
        }

        const isCityChanged = prevCityIdRef.current !== checkoutCity.id;
        prevCityIdRef.current = checkoutCity.id;

        if (isCityChanged) {
            setIsLoadingDeliveries(true);
            // Reset deliveries and deliveryMethod immediately when city changes to avoid outdated API requests
            setDeliveries([]);
            setDeliveryMethod('');
            setSelectedNPRef('');
            setNpSearchQuery('');
            setIsOpenNPDropdown(false);
        }

        const fetchDeliveries = async () => {
            try {
                const cityId = parseInt(String(checkoutCity.id), 10);
                if (isNaN(cityId)) return;

                const res = await getDeliveriesApi(undefined, cityId, lang);
                const safeDeliveries = Array.isArray(res) ? res.filter(Boolean) : [];
                setDeliveries(safeDeliveries);
                
                // Determine enabled (active) delivery methods
                const enabledDeliveries = safeDeliveries.filter(d => !d?.disabled);

                if (enabledDeliveries.length === 0) {
                    // 1. Якщо жодна доставка неактивна — всі радіобатони неактивні (нічого не вибрано)
                    setDeliveryMethod('');
                } else if (enabledDeliveries.length === 1) {
                    // 2. Якщо одна доставка активна — обирається вона
                    setDeliveryMethod(enabledDeliveries[0].id);
                } else {
                    // 3. Якщо декілька доставок активні — обирається перша активна або раніше збережена активна
                    let restored = '';
                    if (restoredData && enabledDeliveries.some(d => d?.id === restoredData.deliveryMethod)) {
                        restored = String(restoredData.deliveryMethod);
                    } else {
                        const saved = localStorage.getItem('checkout_delivery_data');
                        if (saved) {
                            try {
                                const parsed = JSON.parse(saved);
                                if (parsed.deliveryMethod && enabledDeliveries.some(d => d?.id === parsed.deliveryMethod)) {
                                    restored = String(parsed.deliveryMethod);
                                }
                            } catch {}
                        }
                    }

                    if (restored) {
                        setDeliveryMethod(restored);
                    } else if (enabledDeliveries.some(d => d?.id === deliveryMethodRef.current)) {
                        setDeliveryMethod(deliveryMethodRef.current);
                    } else {
                        setDeliveryMethod(enabledDeliveries[0].id);
                    }
                }
            } catch (e) {
                console.error('[Step2] Failed to fetch deliveries for locality', e);
            } finally {
                setIsLoadingDeliveries(false);
            }
        };
        fetchDeliveries();
    }, [checkoutCity, lang, restoredData, cartItems, cartLoading]);

    // 7. Debounced search for Nova Poshta warehouses
    useEffect(() => {
        if (!checkoutCity) {
            setNpResults([]);
            return;
        }
        const fetchNP = async () => {
            setIsSearchingNP(true);
            try {
                const res = await getWarehousesApi(checkoutCity.id, npSearchQuery, 50, 1, lang);
                setNpResults(res.data);
            } catch (e) {
                console.error('Failed to fetch Nova Poshta warehouses', e);
            } finally {
                setIsSearchingNP(false);
            }
        };
        const timer = setTimeout(fetchNP, 300);
        return () => clearTimeout(timer);
    }, [npSearchQuery, checkoutCity, lang]);

    // 8. Fetch dynamic delivery times
    useEffect(() => {
        if (!deliveryMethod || !deliveryDate) {
            setDeliveryTimes([]);
            setDeliveryTime('');
            return;
        }

        const activeDelivery = deliveries.find(d => d.id === deliveryMethod);
        if (!activeDelivery || activeDelivery.disabled || !activeDelivery.showDeliveryTime) {
            setDeliveryTimes([]);
            setDeliveryTime('');
            return;
        }

        const fetchTimes = async () => {
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
            }
        };
        fetchTimes();
    }, [deliveryMethod, deliveryDate, lang, deliveries, deliveryTime]);

    // Stale localStorage logic removed - promo code is synced via Redux/API

    // Address list mapping
    const formattedDbAddresses = React.useMemo(() => {
        if (!checkoutCity) return [];

        const filtered = dbAddresses.filter(addr => {
            const addrCity = addr.city || '';
            const selectedCity = checkoutCity.name || '';
            
            const c1 = addrCity.toLowerCase().replace(/^(м\.|смт\.|с\.|город\.|село\.)\s*/, '').trim();
            const c2 = selectedCity.toLowerCase().replace(/^(м\.|смт\.|с\.|город\.|село\.)\s*/, '').trim();
            
            return c1 === c2 || c1.includes(c2) || c2.includes(c1);
        });

        return filtered.map(addr => {
            const title = lang === 'ua' 
                ? (addr.isDefault ? 'Основна адреса' : 'Адреса') 
                : (addr.isDefault ? 'Основной адрес' : 'Адрес');
            
            const streetPrefix = lang === 'ua' ? 'вул. ' : 'ул. ';
            const housePrefix = lang === 'ua' ? ', буд. ' : ', дом ';
            const aptPrefix = lang === 'ua' ? ', кв. ' : ', кв. ';
            
            const streetVal = addr.street || '';
            const houseVal = addr.house ? `${housePrefix}${addr.house}` : '';
            const aptVal = addr.apartment ? `${aptPrefix}${addr.apartment}` : '';
            
            return {
                id: addr.id.toString(),
                title,
                street: `${streetPrefix}${streetVal}${houseVal}${aptVal}`,
                city: addr.city
            };
        });
    }, [dbAddresses, lang, checkoutCity]);

    const filteredGuestAddresses = React.useMemo(() => {
        if (!checkoutCity) return [];
        return guestAddresses.filter(addr => {
            const addrCity = addr.city || '';
            const selectedCity = checkoutCity.name || '';
            
            const c1 = addrCity.toLowerCase().replace(/^(м\.|смт\.|с\.|город\.|село\.)\s*/, '').trim();
            const c2 = selectedCity.toLowerCase().replace(/^(м\.|смт\.|с\.|город\.|село\.)\s*/, '').trim();
            
            return !addrCity || c1 === c2 || c1.includes(c2) || c2.includes(c1);
        });
    }, [guestAddresses, checkoutCity]);

    const addresses = React.useMemo(() => {
        return [...formattedDbAddresses, ...filteredGuestAddresses];
    }, [formattedDbAddresses, filteredGuestAddresses]);

    // Set default selected address
    useEffect(() => {
        if (addresses.length > 0) {
            const exists = addresses.some(addr => addr.id === selectedAddressId);
            if (!exists) {
                setSelectedAddressId(addresses[0].id);
            }
        } else {
            setSelectedAddressId('');
        }
    }, [addresses, selectedAddressId]);

    const pickupPoints = React.useMemo(() => {
        const list = [...userPickupPoints, ...guestPickupPoints];
        const seen = new Set<string>();
        return list.filter(point => {
            const matchedShop = shops.find(s => s.name === point.name || s.siteName === point.name);
            const key = matchedShop ? `shop-${matchedShop.id}` : `point-${point.name || point.id}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }, [userPickupPoints, guestPickupPoints, shops]);

    const existingShopIds = React.useMemo(() => {
        return pickupPoints
            .map(point => {
                const matchedShop = shops.find(s => s.name === point.name || s.siteName === point.name);
                return matchedShop?.id.toString();
            })
            .filter((id): id is string => !!id);
    }, [pickupPoints, shops]);

    // Set default selected shop
    useEffect(() => {
        if (pickupPoints.length > 0) {
            const exists = pickupPoints.some(point => {
                const matchedShop = shops.find(s => s.name === point.name || s.siteName === point.name);
                return matchedShop && matchedShop.id.toString() === selectedShopId;
            });
            if (!exists) {
                const defaultPoint = pickupPoints.find(p => p.isDefault) || pickupPoints[0];
                const matchedShop = shops.find(s => s.name === defaultPoint.name || s.siteName === defaultPoint.name);
                if (matchedShop) {
                    setSelectedShopId(matchedShop.id.toString());
                }
            }
        }
    }, [pickupPoints, shops, selectedShopId]);

    // Restore selected shop from restoredData / localStorage as virtual guest point if not in user points
    useEffect(() => {
        if (restoredData?.selectedShopId && shops.length > 0) {
            const shopId = restoredData.selectedShopId;
            const matchedShop = shops.find(s => s.id.toString() === shopId.toString());
            if (matchedShop) {
                const matchedInPoints = pickupPoints.some(p => p.name === matchedShop.name || p.name === matchedShop.siteName);
                if (!matchedInPoints) {
                    const tempPoint: UserPickupPoint = {
                        id: `restored-${matchedShop.id}`,
                        isDefault: false,
                        type: 'brand_store',
                        name: matchedShop.name || matchedShop.siteName || '',
                        schedule: matchedShop.schedule || []
                    };
                    setGuestPickupPoints(prev => {
                        if (prev.some(p => p.id === tempPoint.id)) return prev;
                        return [...prev, tempPoint];
                    });
                }
                setSelectedShopId(shopId.toString());
            }
        }
    }, [restoredData, shops, pickupPoints]);

    const activeDelivery = React.useMemo(() => {
        const found = deliveries.find(d => d?.id === deliveryMethod);
        if (found && !found.disabled) return found;
        return undefined;
    }, [deliveries, deliveryMethod]);

    const minOrderVal = React.useMemo(() => {
        const vals = deliveries.map(d => d?.needForAvailable || 0).filter(v => v > 0);
        return vals.length > 0 ? Math.min(...vals) : 0;
    }, [deliveries]);

    const isCourier = activeDelivery?.type === 'courier';
    const isNP = activeDelivery?.driver === 'nova-poshta-postal';
    const isShop = activeDelivery?.driver === 'shop';
    const isShopCourierOrPickup = activeDelivery && (activeDelivery.driver === 'courier' || activeDelivery.driver === 'shop');
    const showDeliveryTimeBlock = Boolean(isShopCourierOrPickup && activeDelivery?.showDeliveryTime);
    const elapsedForFree = activeDelivery?.elapsedForFree || 0;
    const deliveryPrice = activeDelivery ? (activeDelivery.deliveryCost ?? 0) : undefined;

    const timeOptions = React.useMemo(() => {
        return deliveryTimes.map(t => ({
            value: t,
            label: t
        }));
    }, [deliveryTimes]);

    const handleSelectCheckoutCity = async (city: Locality) => {
        setCheckoutCity(city);
        setIsOpenCitySelect(false);
        setCitySearchQuery('');
        
        // 1. Sync city with global Redux store (Header)
        dispatch(setSelectedCity(city));

        // 2. Persist chosen city to localStorage for Header and Checkout
        try {
            localStorage.setItem('mya_selected_city', JSON.stringify(city));
            const saved = localStorage.getItem('checkout_delivery_data');
            const parsed = saved ? JSON.parse(saved) : {};
            parsed.selectedCity = city;
            localStorage.setItem('checkout_delivery_data', JSON.stringify(parsed));
        } catch (e) {
            console.error('Failed to save selected city to localStorage', e);
        }

        // 3. Persist city in local state and Redux
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
                selectedCity: checkoutCity,
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
        streetId?: number | string;
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
                    city: newAddr.city || checkoutCity?.name || 'Київ',
                    street: newAddr.street,
                    streetId: newAddr.streetId ? parseInt(String(newAddr.streetId), 10) : undefined,
                    house: newAddr.house || '',
                    apartment: newAddr.apartment ? parseInt(newAddr.apartment, 10) : undefined,
                    entrance: newAddr.entrance ? parseInt(newAddr.entrance, 10) : undefined,
                    floor: newAddr.floor ? parseInt(newAddr.floor, 10) : undefined,
                    isDefault: true,
                }, token);
                
                setDbAddresses(prev => [created, ...prev]);
                setSelectedAddressId(created.id.toString());
            } else {
                const streetPrefix = lang === 'ua' ? 'вул. ' : 'ул. ';
                const housePrefix = lang === 'ua' ? ', буд. ' : ', дом ';
                const aptPrefix = lang === 'ua' ? ', кв. ' : ', кв. ';
                
                const tempAddr: Address = {
                    id: newAddr.id || Math.random().toString(),
                    title: newAddr.title || (lang === 'ua' ? 'Тимчасова адреса' : 'Временный адрес'),
                    street: `${streetPrefix}${newAddr.street}${newAddr.house ? `${housePrefix}${newAddr.house}` : ''}${newAddr.apartment ? `${aptPrefix}${newAddr.apartment}` : ''}`,
                    city: newAddr.city || checkoutCity?.name || 'Київ',
                };
                setGuestAddresses(prev => [...prev, tempAddr]);
                setSelectedAddressId(tempAddr.id);
            }
        } catch (e) {
            console.error('Failed to create address:', e);
            const streetPrefix = lang === 'ua' ? 'вул. ' : 'ул. ';
            const housePrefix = lang === 'ua' ? ', буд. ' : ', дом ';
            const aptPrefix = lang === 'ua' ? ', кв. ' : ', кв. ';
            
            const tempAddr: Address = {
                id: newAddr.id || Math.random().toString(),
                title: newAddr.title || (lang === 'ua' ? 'Тимчасова адреса' : 'Временный адрес'),
                street: `${streetPrefix}${newAddr.street}${newAddr.house ? `${housePrefix}${newAddr.house}` : ''}${newAddr.apartment ? `${aptPrefix}${newAddr.apartment}` : ''}`,
                city: newAddr.city || checkoutCity?.name || 'Київ',
            };
            setGuestAddresses(prev => [...prev, tempAddr]);
            setSelectedAddressId(tempAddr.id);
        }
    };

    const handleAddPickupPoint = async (store: {
        id: string;
        name: string;
        address: string;
        hours: string;
        lat: number;
        lng: number;
    }) => {
        try {
            const token = await getAccessToken();
            if (token && isAuthenticated) {
                const newPoint = await addUserPickupPointApi('brand_store', store.id, token, lang);
                setUserPickupPoints(prev => {
                    if (prev.some(p => p.id === newPoint.id)) return prev;
                    return [...prev, newPoint];
                });
            } else {
                const tempPoint: UserPickupPoint = {
                    id: `guest-${store.id}`,
                    isDefault: false,
                    type: 'brand_store',
                    name: store.name,
                    schedule: [{ days: 'Пн-Нд', workTime: store.hours }]
                };
                setGuestPickupPoints(prev => {
                    if (prev.some(p => p.id === tempPoint.id)) return prev;
                    return [...prev, tempPoint];
                });
            }
            setSelectedShopId(store.id);
            setIsAddPickupModalOpen(false);
        } catch (e) {
            console.error('Failed to add pickup point:', e);
        }
    };


    return (
        <div className={s.layout}>
            {/* ── Left: Delivery Form ── */}
            <div className={s.formCard}>
                <StepIndicator current={2} />

                {!hydrated || isLoadingDeliveries ? (
                    <div className={s.stepLoading}>
                        <Spinner />
                    </div>
                ) : (
                    <>
                        <div className={s.formSection}>
                            <h2 className={s.sectionTitle}>Ваше місто ?</h2>
                    {hydrated && (
                        <div className={s.citySelectContainer} ref={citySelectRef}>
                            <button
                                type="button"
                                className={clsx(s.citySelectBtn, isOpenCitySelect && s.isOpen)}
                                onClick={() => setIsOpenCitySelect(!isOpenCitySelect)}
                            >
                                <span>{checkoutCity?.name || (lang === 'ua' ? 'Оберіть місто' : 'Выберите город')}</span>
                                <svg
                                    className={clsx(s.arrow, isOpenCitySelect && s.arrowOpen)}
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>

                            {isOpenCitySelect && (
                                <div className={s.cityDropdown}>
                                    <div className={s.searchWrapper}>
                                        <div className={s.searchIcon}>
                                            <Image src="/icons/icon-search.svg" alt="Search" width={16} height={16} />
                                        </div>
                                        <input
                                            type="text"
                                            className={s.searchInput}
                                            placeholder={lang === 'ua' ? 'Введіть назву' : 'Введите название'}
                                            value={citySearchQuery}
                                            onChange={(e) => setCitySearchQuery(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className={s.cityList} onScroll={handleCityScroll}>
                                        {citySearchQuery.length < 2 ? (
                                            isLoadingCitiesList ? (
                                                <div className={s.loader}></div>
                                            ) : allCitiesList.length > 0 ? (
                                                <>
                                                    {allCitiesList.map((city) => (
                                                        <div
                                                            key={city.id}
                                                            className={clsx(
                                                                s.cityItem,
                                                                Number(checkoutCity?.id) === Number(city.id) && s.cityItemSelected
                                                            )}
                                                            onClick={() => handleSelectCheckoutCity(city)}
                                                        >
                                                            {city.name}
                                                        </div>
                                                    ))}
                                                    {isLoadingMoreCities && <div className={s.loader}></div>}
                                                </>
                                            ) : (
                                                <div className={s.notFound}>
                                                    {lang === 'ua' ? 'Місто не знайдено' : 'Город не найден'}
                                                </div>
                                            )
                                        ) : isSearchingCities ? (
                                            <div className={s.loader}></div>
                                        ) : citySearchResults.length > 0 ? (
                                            <>
                                                {citySearchResults.map((city) => (
                                                    <div
                                                        key={city.id}
                                                        className={clsx(
                                                            s.cityItem,
                                                            Number(checkoutCity?.id) === Number(city.id) && s.cityItemSelected
                                                        )}
                                                        onClick={() => handleSelectCheckoutCity(city)}
                                                    >
                                                        {city.name}
                                                    </div>
                                                ))}
                                                {isLoadingMoreCities && <div className={s.loader}></div>}
                                            </>
                                        ) : (
                                            <div className={s.notFound}>
                                                {lang === 'ua' ? 'Місто не знайдено' : 'Город не найден'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={s.formSection}>
                    <h2 className={s.sectionTitle}>Оберіть спосіб доставки чи самовивозу</h2>
                    <div className={s.deliveryMethods}>
                        {deliveries.map(method => {
                            const isSelected = deliveryMethod === method.id;
                            const isMethodCourier = method.type === 'courier';
                            const isMethodShop = method.driver === 'shop';
                            const isMethodNP = method.driver === 'nova-poshta-postal';
                            const showNpIcon = isMethodNP || method.name?.toLowerCase().includes('нова пошта') || method.type?.toLowerCase().includes('nova');

                            return (
                                <div key={method.id} className={s.methodContainer}>
                                    <label 
                                        className={clsx(s.methodItem, method.disabled && s.methodItemDisabled)}
                                        onClick={(e) => method.disabled && e.preventDefault()}
                                    >
                                        <input 
                                            type="radio" 
                                            name="deliveryMethod"
                                            value={method.id}
                                            checked={isSelected}
                                            disabled={method.disabled}
                                            onChange={() => !method.disabled && setDeliveryMethod(method.id)}
                                            className={s.hiddenRadio}
                                        />
                                        <span className={s.radioCircle} />
                                        <span className={s.methodLabel}>
                                            {method.name} 
                                            <span className={s.methodPrice}>
                                                ({method.deliveryCost === 0 ? 'Безкоштовно' : `${method.deliveryCost} ₴`})
                                            </span>
                                            {method.disabled && method.needForAvailable && (
                                                <span className={s.disabledNotice}>
                                                    ({lang === 'ua' ? `ще ${method.needForAvailable} ₴` : `еще ${method.needForAvailable} ₴`})
                                                </span>
                                            )}
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
                                    
                                    {(hydrated && isSelected && !method.disabled && isMethodCourier) && (
                                        <div className={s.nestedAddressRow}>
                                            <AddressRow 
                                                addresses={addresses}
                                                selectedAddressId={selectedAddressId}
                                                onSelect={setSelectedAddressId}
                                                onAddClick={() => setIsAddAddressModalOpen(true)}
                                            />
                                        </div>
                                    )}

                                    {(hydrated && isSelected && !method.disabled && isMethodShop) && (
                                        <div className={s.nestedAddressRow}>
                                            <PickupPointRow
                                                points={pickupPoints}
                                                shops={shops}
                                                selectedShopId={selectedShopId}
                                                onSelect={setSelectedShopId}
                                                onAddClick={() => setIsAddPickupModalOpen(true)}
                                                lang={lang}
                                            />
                                        </div>
                                    )}


                                    {(hydrated && isSelected && !method.disabled && isMethodNP) && (
                                        <div className={s.nestedSelectRow} ref={npSelectRef} onFocusCapture={() => setIsOpenNPDropdown(true)}>
                                            <h4 className={s.nestedSelectTitle}>Введіть номер або адресу відділення Нової Пошти:</h4>
                                            <Search 
                                                value={npSearchQuery}
                                                onChange={(val) => {
                                                    setNpSearchQuery(val);
                                                    setSelectedNPRef('');
                                                    setIsOpenNPDropdown(true);
                                                }}
                                                placeholder="Пошук відділення (наприклад: 125 або Хрещатик)"
                                                showButton={false}
                                                className={s.nestedSearch}
                                            />
                                            {isOpenNPDropdown && (
                                                <>
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
                                                                        onClick={() => {
                                                                            setSelectedNPRef(wh.ref);
                                                                            setNpSearchQuery(wh.name);
                                                                            setIsOpenNPDropdown(false);
                                                                        }}
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
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {deliveries.length > 0 && deliveries.every(d => d?.disabled) && minOrderVal > 0 && (
                        <div className={s.minOrderWarning}>
                            {lang === 'ua' 
                                ? `Для можливості доставки у це місто додайте товарів ще на ${minOrderVal} ₴`
                                : `Для возможности доставки в этот город добавьте товаров еще на ${minOrderVal} ₴`}
                        </div>
                    )}
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
                                hideLabel={true}
                                minDate={new Date()}
                                leftIcon={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M7 8.4C7.13845 8.4 7.27379 8.35895 7.3889 8.28203C7.50401 8.20511 7.59373 8.09579 7.64672 7.96788C7.6997 7.83997 7.71356 7.69922 7.68655 7.56344C7.65954 7.42765 7.59287 7.30292 7.49497 7.20503C7.39708 7.10713 7.27235 7.04046 7.13656 7.01345C7.00078 6.98644 6.86003 7.0003 6.73212 7.05328C6.60421 7.10627 6.49489 7.19599 6.41797 7.3111C6.34105 7.42621 6.3 7.56155 6.3 7.7C6.3 7.88565 6.37375 8.0637 6.50503 8.19497C6.6363 8.32625 6.81435 8.4 7 8.4ZM10.5 8.4C10.6384 8.4 10.7738 8.35895 10.8889 8.28203C11.004 8.20511 11.0937 8.09579 11.1467 7.96788C11.1997 7.83997 11.2136 7.69922 11.1865 7.56344C11.1595 7.42765 11.0929 7.30292 10.995 7.20503C10.8971 7.10713 10.7724 7.04046 10.6366 7.01345C10.5008 6.98644 10.36 7.0003 10.2321 7.05328C10.1042 7.10627 9.99489 7.19599 9.91797 7.3111C9.84105 7.42621 9.8 7.56155 9.8 7.7C9.8 7.88565 9.87375 8.0637 10.005 8.19497C10.1363 8.32625 10.3143 8.4 10.5 8.4ZM7 11.2C7.13845 11.2 7.27379 11.1589 7.3889 11.082C7.50401 11.0051 7.59373 10.8958 7.64672 10.7679C7.6997 10.64 7.71356 10.4992 7.68655 10.3634C7.65954 10.2276 7.59287 10.1029 7.49497 10.005C7.39708 9.90713 7.27235 9.84046 7.13656 9.81345C7.00078 9.78644 6.86003 9.8003 6.73212 9.85328C6.60421 9.90627 6.49489 9.99599 6.41797 10.1111C6.34105 10.2262 6.3 10.3616 6.3 10.5C6.3 10.6857 6.37375 10.8637 6.50503 10.995C6.6363 11.1263 6.81435 11.2 7 11.2ZM10.5 11.2C10.6384 11.2 10.7738 11.1589 10.8889 11.082C11.004 11.0051 11.0937 10.8958 11.1467 10.7679C11.1997 10.64 11.2136 10.4992 11.1865 10.3634C11.1595 10.2276 11.0929 10.1029 10.995 10.005C10.8971 9.90713 10.7724 9.84046 10.6366 9.81345C10.5008 9.78644 10.36 9.8003 10.2321 9.85328C10.1042 9.90627 9.99489 9.99599 9.91797 10.1111C9.84105 10.2262 9.8 10.3616 9.8 10.5C9.8 10.6857 9.87375 10.8637 10.005 10.995C10.1363 11.1263 10.3143 11.2 10.5 11.2ZM3.5 8.4C3.63845 8.4 3.77378 8.35895 3.8889 8.28203C4.00401 8.20511 4.09373 8.09579 4.14672 7.96788C4.1997 7.83997 4.21356 7.69922 4.18655 7.56344C4.15954 7.42765 4.09287 7.30292 3.99497 7.20503C3.89708 7.10713 3.77235 7.04046 3.63656 7.01345C3.50078 6.98644 3.36003 7.0003 3.23212 7.05328C3.10421 7.10627 2.99489 7.19599 2.91797 7.3111C2.84105 7.42621 2.8 7.56155 2.8 7.7C2.8 7.88565 2.87375 8.0637 3.00503 8.19497C3.1363 8.32625 3.31435 8.4 3.5 8.4ZM11.9 1.4H11.2V0.7C11.2 0.514348 11.1263 0.336301 10.995 0.205025C10.8637 0.0737498 10.6857 0 10.5 0C10.3143 0 10.1363 0.0737498 10.005 0.205025C9.87375 0.336301 9.8 0.514348 9.8 0.7V1.4H4.2V0.7C4.2 0.514348 4.12625 0.336301 3.99497 0.205025C3.8637 0.0737498 3.68565 0 3.5 0C3.31435 0 3.1363 0.0737498 3.00503 0.205025C2.87375 0.336301 2.8 0.514348 2.8 0.7V1.4H2.1C1.54305 1.4 1.0089 1.62125 0.615076 2.01508C0.221249 2.4089 0 2.94305 0 3.5V11.9C0 12.457 0.221249 12.9911 0.615076 13.3849C1.0089 13.7788 1.54305 14 2.1 14H11.9C12.457 14 12.9911 13.7788 13.3849 13.3849C13.7788 12.9911 14 12.457 14 11.9V3.5C14 2.94305 13.7788 2.4089 13.3849 2.01508C12.9911 1.62125 12.457 1.4 11.9 1.4ZM12.6 11.9C12.6 12.0857 12.5263 12.2637 12.395 12.395C12.2637 12.5263 12.0857 12.6 11.9 12.6H2.1C1.91435 12.6 1.7363 12.5263 1.60503 12.395C1.47375 12.2637 1.4 12.0857 1.4 11.9V5.6H12.6V11.9ZM12.6 4.2H1.4V3.5C1.4 3.31435 1.47375 3.1363 1.60503 3.00503C1.7363 2.87375 1.91435 2.8 2.1 2.8H11.9C12.0857 2.8 12.2637 2.87375 12.395 3.00503C12.5263 3.1363 12.6 3.31435 12.6 3.5V4.2ZM3.5 11.2C3.63845 11.2 3.77378 11.1589 3.8889 11.082C4.00401 11.0051 4.09373 10.8958 4.14672 10.7679C4.1997 10.64 4.21356 10.4992 4.18655 10.3634C4.15954 10.2276 4.09287 10.1029 3.99497 10.005C3.89708 9.90713 3.77235 9.84046 3.63656 9.81345C3.50078 9.78644 3.36003 9.8003 3.23212 9.85328C3.10421 9.90627 2.99489 9.99599 2.91797 10.1111C2.84105 10.2262 2.8 10.3616 2.8 10.5C2.8 10.6857 2.87375 10.8637 3.00503 10.995C3.1363 11.1263 3.31435 11.2 3.5 11.2Z" fill="#E3051B"/>
                                    </svg>
                                }
                                arrowVariant="right"
                                lang={lang}
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
                    </>
                )}
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
            <AddPickupModal 
                isOpen={isAddPickupModalOpen}
                onClose={() => setIsAddPickupModalOpen(false)}
                onAdd={handleAddPickupPoint}
                lang={lang}
                existingShopIds={existingShopIds}
            />
        </div>
    );
}

