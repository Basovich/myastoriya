'use client';

import { useState, useEffect, useRef } from 'react';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
    setSelectedCity,
    setPromptVisible,
    setManualSelectionOpen,
    setDetectionLoading,
    setPromptInteractionDone,
    setAllCities,
    setIsLoadingCities,
} from '@/store/slices/localitySlice';
import {
    autoDetectLocalityApi,
    getLocalitiesApi,
    Locality, 
    getSelectedLocalityApi,
    selectLocalityApi,
} from '@/lib/graphql';
import { selectLocalityAction } from '@/app/actions/authActions';
import { getOrCreateDeviceId } from '@/lib/utils/auth';
import s from './CitySelector.module.scss';
import loaderStyles from '@/app/[lang]/loading.module.scss';
import clsx from 'clsx';
import Image from 'next/image';

const translations = {
    ua: {
        label: "Ваше місто",
        searchPlaceholder: "Введіть назву",
        notFound: "Місто не знайдено",
        prompt: {
            title: "Ваше місто",
            yes: "Так",
            no: "Ні"
        }
    },
    ru: {
        label: "Ваш город",
        searchPlaceholder: "Введите название",
        notFound: "Город не найден",
        prompt: {
            title: "Ваш город",
            yes: "Да",
            no: "Нет"
        }
    }
} as const;

const deduplicateLocality = (list: Locality[]): Locality[] => {
    const seen = new Set<number | string>();
    return list.filter(item => {
        if (!item || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
    });
};

const PAGE_SIZE = 50;

interface CitySelectorProps {
    lang: 'ua' | 'ru';
    renderPrompt?: boolean;
    renderSelector?: boolean;
    renderGlobalUI?: boolean;
}

export default function CitySelector({ 
    lang = 'ua',
    renderPrompt = true, 
    renderSelector = true,
    renderGlobalUI = false
}: CitySelectorProps) {
    const dispatch = useAppDispatch();
    const t = translations[lang] || translations.ua;

    const hydrated = useIsHydrated();
    
    // Redux State
    const { 
        selectedCity, 
        isPromptVisible, 
        isManualSelectionOpen,
        isPromptInteractionDone,
        allCities,
        isLoadingCities,
    } = useAppSelector((state) => state.locality);

    // Component Local State
    const [allCitiesPage, setAllCitiesPage] = useState(1);
    const [hasMoreAll, setHasMoreAll] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Locality[]>([]);
    const [searchPage, setSearchPage] = useState(1);
    const [hasMoreSearch, setHasMoreSearch] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isReloading, setIsReloading] = useState(false);
    
    const wrapperRef = useRef<HTMLDivElement>(null);
    const hasDetectedRef = useRef(false);

    // 1. UI state reset on hydration
    useEffect(() => {
        if (!hydrated) return;
        // Reset UI states on mount to avoid persistence after reload
        dispatch(setManualSelectionOpen(false));
        dispatch(setPromptVisible(false));
        // Clear any stale city list that may have been persisted before the blacklist fix
        dispatch(setAllCities([]));
    }, [dispatch, hydrated]);

    // 2. Initial city detection logic (Centralized in Global UI instance)
    useEffect(() => {
        if (!hydrated || !renderGlobalUI || hasDetectedRef.current || isPromptInteractionDone) return;
        
        const detectCity = async () => {
            hasDetectedRef.current = true;
            
            // Only detect if we don't have a city yet
            if (selectedCity) return;

            dispatch(setDetectionLoading(true));
            try {
                const savedCity = localStorage.getItem('mya_selected_city');
                let cityToSet: Locality | null = null;
                if (savedCity) {
                    try {
                        cityToSet = JSON.parse(savedCity);
                    } catch {}
                }

                if (!cityToSet) {
                    const existing = await getSelectedLocalityApi(lang);
                    if (existing) {
                        cityToSet = existing;
                    } else {
                        const detected = await autoDetectLocalityApi(undefined, undefined, lang);
                        if (detected) {
                            cityToSet = detected;
                        } else {
                            const fallbackTitle = lang === 'ua' ? 'м. Київ' : 'г. Киев';
                            cityToSet = { id: 2581, name: fallbackTitle };
                        }
                    }
                }

                if (cityToSet) {
                    dispatch(setSelectedCity(cityToSet));
                    if (cityToSet.id === 2581) {
                        selectLocalityApi(cityToSet.id, lang).catch(() => {});
                    }
                }
            } catch (error) {
                console.warn('[CitySelector] Detection failed:', error);
                const fallbackTitle = lang === 'ua' ? 'м. Київ' : 'г. Киев';
                const fallback = { id: 2581, name: fallbackTitle };
                dispatch(setSelectedCity(fallback));
                selectLocalityApi(fallback.id, lang).catch(() => {});
            } finally {
                dispatch(setDetectionLoading(false));
            }
        };

        detectCity();
    }, [hydrated, renderGlobalUI, isPromptInteractionDone, selectedCity, dispatch, lang]);

    // 3. Prompt Visibility Trigger (Observer pattern)
    // This ensures the prompt shows up whenever we have a city but no interaction yet
    useEffect(() => {
        if (hydrated && renderGlobalUI && selectedCity && !isPromptInteractionDone && !isPromptVisible) {
            dispatch(setPromptVisible(true));
        }
    }, [hydrated, renderGlobalUI, selectedCity, isPromptInteractionDone, isPromptVisible, dispatch]);

    // 3. Initial cities fetch for dropdown
    useEffect(() => {
        // Redux already has cities or is loading? Skip.
        if (!hydrated || !isManualSelectionOpen || allCities.length > 0 || isLoadingCities) return;

        const fetchInitialCities = async () => {
            dispatch(setIsLoadingCities(true));
            try {
                const res = await getLocalitiesApi(undefined, PAGE_SIZE, 1, lang);
                dispatch(setAllCities(deduplicateLocality(res.data)));
                setHasMoreAll(res.has_more_pages);
                setAllCitiesPage(1);
            } catch (error) {
                console.error('Failed to fetch initial cities:', error);
            } finally {
                dispatch(setIsLoadingCities(false));
            }
        };
        fetchInitialCities();
    }, [hydrated, isManualSelectionOpen, allCities.length, isLoadingCities, lang, dispatch]);

    // 4. Search logic with debounce
    useEffect(() => {
        if (!hydrated) return;

        if (searchQuery.length >= 2) {
            const searchCities = async () => {
                setIsSearching(true);
                try {
                    const res = await getLocalitiesApi(searchQuery, PAGE_SIZE, 1, lang);
                    setSearchResults(deduplicateLocality(res.data));
                    setHasMoreSearch(res.has_more_pages);
                    setSearchPage(1);
                } catch (error) {
                    console.error('City search failed:', error);
                } finally {
                    setIsSearching(false);
                }
            };
            const timer = setTimeout(searchCities, 300);
            return () => clearTimeout(timer);
        } else {
            setSearchResults([]);
        }
    }, [hydrated, searchQuery, lang]);

    // 5. Click outside handler (Global instance only)
    useEffect(() => {
        if (!hydrated || !renderGlobalUI) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (target.closest(`.${s.wrapper}`)) return;
            dispatch(setManualSelectionOpen(false));
        };

        document.addEventListener('click', handleClickOutside, true);
        return () => document.removeEventListener('click', handleClickOutside, true);
    }, [hydrated, renderGlobalUI, dispatch]);

    const handleLoadMore = async () => {
        if (isLoadingMore) return;

        if (searchQuery.length >= 2 && hasMoreSearch) {
            setIsLoadingMore(true);
            try {
                const nextPage = searchPage + 1;
                const res = await getLocalitiesApi(searchQuery, PAGE_SIZE, nextPage, lang);
                setSearchResults(prev => deduplicateLocality([...prev, ...res.data]));
                setHasMoreSearch(res.has_more_pages);
                setSearchPage(nextPage);
            } catch (error) {
                console.error('Load more error:', error);
            } finally {
                setIsLoadingMore(false);
            }
        } else if (searchQuery.length < 2 && hasMoreAll) {
            setIsLoadingMore(true);
            try {
                const nextPage = allCitiesPage + 1;
                const res = await getLocalitiesApi(undefined, PAGE_SIZE, nextPage, lang);
                dispatch(setAllCities(deduplicateLocality([...allCities, ...res.data])));
                setHasMoreAll(res.has_more_pages);
                setAllCitiesPage(nextPage);
            } catch (error) {
                console.error('Load more error:', error);
            } finally {
                setIsLoadingMore(false);
            }
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const reachedBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
        if (reachedBottom) handleLoadMore();
    };

    const handleSelectCity = async (city: Locality) => {
        setIsReloading(true);
        dispatch(setSelectedCity(city));
        dispatch(setPromptVisible(false));
        dispatch(setPromptInteractionDone(true));
        dispatch(setManualSelectionOpen(false));

        // Sync with server via Server Action
        try {
            const deviceId = getOrCreateDeviceId();
            await selectLocalityAction(city.id, lang, deviceId);
            window.location.reload();
        } catch (error) {
            console.warn('[CitySelector] Failed to sync city with server:', error);
            // Reload even if request failed, to make sure SSR syncs
            window.location.reload();
        }
    };

    const handleConfirmYes = async () => {
        if (selectedCity) {
            setIsReloading(true);
        }
        dispatch(setPromptVisible(false));
        dispatch(setPromptInteractionDone(true));
        
        // Sync detected city with server
        if (selectedCity) {
            try {
                const deviceId = getOrCreateDeviceId();
                await selectLocalityAction(selectedCity.id, lang, deviceId);
                window.location.reload();
            } catch (error) {
                console.warn('[CitySelector] Failed to sync confirmed city with server:', error);
                window.location.reload();
            }
        }
    };

    const handleConfirmNo = () => {
        dispatch(setPromptVisible(false));
        dispatch(setPromptInteractionDone(true));
        dispatch(setManualSelectionOpen(true));
    };

    const toggleDropdown = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        const nextState = !isManualSelectionOpen;
        dispatch(setManualSelectionOpen(nextState));
        
        if (isPromptVisible) {
            dispatch(setPromptVisible(false));
            dispatch(setPromptInteractionDone(true));
        }
    };

    const handleCloseManualSelection = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        dispatch(setManualSelectionOpen(false));
    };

    const renderPromptContent = (isGlobal: boolean) => (
        <div className={clsx(s.prompt, isGlobal ? s.mobileOnlyPopup : s.desktopOnlyPopup)}>
            <div className={s.promptContent}>
                <p className={s.promptText}>
                    {t.prompt.title} {selectedCity?.name}?
                </p>
                <div className={s.promptButtons}>
                    <button className={s.btnYes} onClick={handleConfirmYes}>
                        {t.prompt.yes}
                    </button>
                    <button className={s.btnNo} onClick={handleConfirmNo}>
                        {t.prompt.no}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderDropdownContent = (isGlobal: boolean) => (
        <>
            <div className={clsx(s.overlay, !isGlobal && s.desktopOnlyPopup)} onClick={handleCloseManualSelection} />
            <div 
                className={clsx(s.dropdown, isGlobal ? s.mobileOnlyPopup : s.desktopOnlyPopup)} 
                onClick={(e) => e.stopPropagation()}
            >
                <button className={s.closeDropdown} onClick={handleCloseManualSelection}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M12.3477 9.99858L19.5075 2.85447C19.821 2.54089 19.9972 2.11558 19.9972 1.67211C19.9972 1.22864 19.821 0.80333 19.5075 0.489749C19.1939 0.176168 18.7687 0 18.3253 0C17.8819 0 17.4566 0.176168 17.1431 0.489749L10 7.65052L2.8569 0.489749C2.54337 0.176168 2.11812 -3.30411e-09 1.67471 0C1.2313 3.30411e-09 0.806058 0.176168 0.492521 0.489749C0.178985 0.80333 0.00284159 1.22864 0.00284159 1.67211C0.00284158 2.11558 0.178985 2.54089 0.492521 2.85447L7.65227 9.99858L0.492521 17.1427C0.336458 17.2975 0.212588 17.4817 0.128055 17.6846C0.0435221 17.8875 0 18.1052 0 18.3251C0 18.5449 0.0435221 18.7626 0.128055 18.9655C0.212588 19.1684 0.336458 19.3526 0.492521 19.5074C0.64731 19.6635 0.831467 19.7874 1.03437 19.8719C1.23727 19.9565 1.4549 20 1.67471 20C1.89452 20 2.11215 19.9565 2.31505 19.8719C2.51796 19.7874 2.70211 19.6635 2.8569 19.5074L10 12.3466L17.1431 19.5074C17.2979 19.6635 17.482 19.7874 17.6849 19.8719C17.8878 19.9565 18.1055 20 18.3253 20C18.5451 20 18.7627 19.9565 18.9656 19.8719C19.1685 19.7874 19.3527 19.6635 19.5075 19.5074C19.6635 19.3526 19.7874 19.1684 19.8719 18.9655C19.9565 18.7626 20 18.5449 20 18.3251C20 18.1052 19.9565 17.8875 19.8719 17.6846C19.7874 17.4817 19.6635 17.2975 19.5075 17.1427L12.3477 9.99858Z" fill="currentColor"/>
                    </svg>
                </button>
                <div className={s.searchWrapper}>
                    <div className={s.searchIcon}>
                        <Image src="/icons/icon-search.svg" alt="Search" width={16} height={16} />
                    </div>
                    <input
                        type="text"
                        className={s.searchInput}
                        placeholder={t.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className={s.cityList} onScroll={handleScroll}>
                    {searchQuery.length < 2 ? (
                        isLoadingCities ? (
                            <div className={s.loader}></div>
                        ) : allCities.length > 0 ? (
                            <>
                                {allCities.map((city) => (
                                    <div key={city.id} className={s.cityItem} onClick={() => handleSelectCity(city)}>
                                        <span className={clsx(s.cityName, (Number(selectedCity?.id) === Number(city.id)) && s.active)}>
                                            {city.name}
                                        </span>
                                    </div>
                                ))}
                                {isLoadingMore && <div className={s.loader}></div>}
                            </>
                        ) : (
                            <div className={s.notFound}>{t.notFound}</div>
                        )
                    ) : isSearching ? (
                        <div className={s.loader}></div>
                    ) : searchResults.length > 0 ? (
                        <>
                            {searchResults.map((city) => (
                                <div key={city.id} className={s.cityItem} onClick={() => handleSelectCity(city)}>
                                    <span className={clsx(s.cityName, (Number(selectedCity?.id) === Number(city.id)) && s.active)}>
                                        {city.name}
                                    </span>
                                </div>
                            ))}
                            {isLoadingMore && <div className={s.loader}></div>}
                        </>
                    ) : (
                        <div className={s.notFound}>{t.notFound}</div>
                    )}
                </div>
            </div>
        </>
    );

    if (isReloading) {
        return (
            <div className={loaderStyles.loaderWrapper}>
                <div className={loaderStyles.logoContainer}>
                    <svg width="120" height="120" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={loaderStyles.animatedLogo}>
                        <g clipPath="url(#clip0_2137_1145_city)">
                            <rect width="512" height="512" fill="transparent"/>
                            <path d="M17 144.739C19.3037 123.796 22.2594 113.245 29.1718 101.282C41.5602 79.8425 60.775 65.1309 95.8598 50.2237C148.553 27.8345 225.596 8.98177 292.217 2.17445C302.49 1.1246 319.266 -0.125038 331.002 -0.715942C332.882 -0.810805 334.762 -0.905137 336.642 -1C344.07 -1 351.499 -1 358.927 -1C364.602 -0.602531 369.975 -0.23474 374.527 0.0742262C412.861 2.67367 440.959 11.5939 459.556 27.0693C476.388 41.0755 488.671 65.1415 492.947 92.4895C500.114 138.333 488.454 200.767 458.942 274.579C438.368 326.035 408.996 383.889 385.547 419.149C348.603 474.698 312.006 504.845 273.764 511.229C272.225 511.486 270.687 511.743 269.148 512C263.629 512 258.111 512 252.592 512C237.513 509.638 230.942 507.832 219.581 502.924C189.731 490.031 159.737 464.684 128.728 426.147C94.0387 383.035 66.1688 334.028 46.3001 281.203C29.6647 236.974 20.7733 200.79 17.3489 163.386C17.2324 162.117 17.1165 160.847 17 159.577C17 154.631 17 149.685 17 144.739ZM440.641 107.377C438.947 90.3749 435.744 78.8446 429.865 68.5899C421.69 54.3272 402.419 46.5564 368.871 43.9951C352.871 42.7735 321.904 43.8637 298.437 46.4737C241.025 52.8597 166.042 70.2222 128.801 85.7532C95.4173 99.6757 80.6768 110.88 74.0153 127.396C68.9876 139.861 69.2073 154.178 74.9398 187.665C79.5893 214.827 86.687 239.344 98.9473 270.604C113.229 307.015 127.756 335.852 144.202 360.432C168.455 396.68 194.589 427.291 217.515 446.306C228.15 455.126 235.783 460.081 244.034 463.518C255.513 468.299 263.74 468.445 274.008 464.047C280.783 461.146 285.906 457.716 294.106 450.594C304.277 441.76 315.208 429.351 327.063 413.183C333.168 404.857 345.073 386.63 344.302 386.79C343.969 386.859 340.969 388.444 337.634 390.313C317.078 401.833 295.17 406.679 271.376 404.968C240.012 402.713 215.327 393.229 194.605 375.473C161.473 347.084 142.556 299.104 138.632 233.507C137.742 218.63 137.776 113.003 138.672 108.931C140.095 102.465 145.638 96.2681 152.624 93.3332C171.584 85.3668 202.97 96.1526 234.355 121.42C238.519 124.772 244.083 129.661 246.72 132.285C249.358 134.908 251.71 137.12 251.947 137.201C252.184 137.201 253.782 135.851 255.498 134.021C257.215 132.192 262.492 127.464 267.227 123.514C308.618 88.9827 349.452 80.6454 363.269 103.904C364.05 105.22 364.832 106.536 365.613 107.851C365.669 137.617 365.725 167.383 365.781 197.149C365.887 253.73 365.721 287.474 365.327 289.251C363.84 295.946 358.401 301.805 350.813 304.886C346.711 306.551 346.171 306.633 339.189 306.637C332.296 306.641 331.619 306.543 327.649 304.978C322.654 303.008 319.016 300.404 316.252 296.819C311.846 291.105 312.161 296.659 311.809 218.403C311.703 194.82 311.597 171.237 311.49 147.653C309.307 149.489 307.123 151.324 304.94 153.16C293.616 162.677 287.1 170.888 283.219 180.532C280.469 187.366 279.404 193.305 278.44 207.184C277.622 218.967 277.528 219.492 275.647 222.838C273.171 227.243 269.273 230.482 263.702 232.765C259.442 234.511 259.071 234.567 251.652 234.567C244.68 234.567 243.672 234.44 240.356 233.146C233.303 230.395 227.557 224.401 225.969 218.138C225.599 216.681 225.145 211.553 224.959 206.744C224.063 183.514 217.062 168.963 199.539 153.907C195.705 150.613 192.293 147.918 191.959 147.918C191.573 147.918 191.459 164.229 191.648 192.302C191.963 238.961 192.148 242.488 195.31 262.367C199.26 287.198 207.245 310.342 217.076 325.455C223.367 335.126 232.7 344.635 241.131 349.964C246.676 353.469 256.779 357.501 263.417 358.857C271.09 360.425 283.077 360.797 290.621 359.7C312.093 356.58 332.232 346.969 353.424 329.729C372.947 313.847 385.713 299.129 396.75 279.776C419.173 240.458 436.468 184.026 440.406 137.319C441.002 130.254 441.141 112.403 440.641 107.377Z" fill="#E6030F"/>
                        </g>
                        <defs>
                            <clipPath id="clip0_2137_1145_city">
                                <rect width="512" height="512" fill="white"/>
                            </clipPath>
                        </defs>
                    </svg>
                </div>
            </div>
        );
    }

    if (!hydrated) {
        return (
            <div className={s.wrapper}>
                {renderSelector && (
                    <div className={s.citySelector}>
                        <span className={s.cityLabel}>{t.label}</span>
                        <span className={s.cityValue}>
                            ...
                            <svg className={s.icon} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={s.wrapper} ref={wrapperRef}>
            {renderSelector && (
                <>
                    <div className={s.citySelector} onClick={toggleDropdown}>
                        <span className={s.cityLabel}>{t.label}</span>
                        <span className={s.cityValue}>
                            <span className={s.cityValueName} title={selectedCity?.name || '...'}>{selectedCity?.name || '...'}</span>
                            <svg
                                className={clsx(s.icon, isManualSelectionOpen && s.iconOpen)}
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </span>
                    </div>
                    {isManualSelectionOpen && renderDropdownContent(false)}
                    {renderPrompt && isPromptVisible && selectedCity && renderPromptContent(false)}
                </>
            )}

            {renderGlobalUI && renderPrompt && isPromptVisible && selectedCity && renderPromptContent(true)}

            {renderGlobalUI && isManualSelectionOpen && renderDropdownContent(true)}
        </div>
    );
}
