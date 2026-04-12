'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
    setSelectedCity,
    setPromptVisible,
    setManualSelectionOpen,
    setDetectionLoading,
    setPromptInteractionDone,
} from '@/store/slices/localitySlice';
import {
    autoDetectLocalityApi,
    getLocalitiesApi,
    Locality, 
    getSelectedLocalityApi,
} from '@/lib/graphql';
import s from './CitySelector.module.scss';
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

    const [mounted, setMounted] = useState(false);
    
    // Redux State
    const { 
        selectedCity, 
        isPromptVisible, 
        isManualSelectionOpen,
        isPromptInteractionDone
    } = useAppSelector((state) => state.locality);

    // Component Local State
    const [allCities, setAllCities] = useState<Locality[]>([]);
    const [allCitiesPage, setAllCitiesPage] = useState(1);
    const [hasMoreAll, setHasMoreAll] = useState(true);
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Locality[]>([]);
    const [searchPage, setSearchPage] = useState(1);
    const [hasMoreSearch, setHasMoreSearch] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    const wrapperRef = useRef<HTMLDivElement>(null);
    const hasDetectedRef = useRef(false);

    // 1. Mount stabilization and UI state reset
    useEffect(() => {
        setMounted(true);
        // Reset UI states on mount to avoid persistence after reload
        dispatch(setManualSelectionOpen(false));
        dispatch(setPromptVisible(false));
    }, [dispatch]);

    // 2. Initial city detection logic (Centralized in Global UI instance)
    useEffect(() => {
        if (!mounted || !renderGlobalUI || hasDetectedRef.current || isPromptInteractionDone) return;
        
        const detectCity = async () => {
            hasDetectedRef.current = true;
            
            // Only detect if we don't have a city yet
            if (selectedCity) return;

            dispatch(setDetectionLoading(true));
            try {
                const existing = await getSelectedLocalityApi(lang);
                if (existing) {
                    dispatch(setSelectedCity(existing));
                } else {
                    const detected = await autoDetectLocalityApi(undefined, undefined, lang);
                    if (detected) {
                        dispatch(setSelectedCity(detected));
                    } else {
                        const fallbackTitle = lang === 'ua' ? 'м. Київ' : 'г. Киев';
                        const fallback = { id: 2581, name: fallbackTitle };
                        dispatch(setSelectedCity(fallback));
                    }
                }
            } catch (error) {
                console.warn('[CitySelector] Detection failed:', error);
                const fallbackTitle = lang === 'ua' ? 'м. Київ' : 'г. Киев';
                const fallback = { id: 2581, name: fallbackTitle };
                dispatch(setSelectedCity(fallback));
            } finally {
                dispatch(setDetectionLoading(false));
            }
        };

        detectCity();
    }, [mounted, renderGlobalUI, isPromptInteractionDone, selectedCity, dispatch, lang]);

    // 3. Prompt Visibility Trigger (Observer pattern)
    // This ensures the prompt shows up whenever we have a city but no interaction yet
    useEffect(() => {
        if (mounted && renderGlobalUI && selectedCity && !isPromptInteractionDone && !isPromptVisible) {
            dispatch(setPromptVisible(true));
        }
    }, [mounted, renderGlobalUI, selectedCity, isPromptInteractionDone, isPromptVisible, dispatch]);

    // 3. Initial cities fetch for dropdown
    useEffect(() => {
        if (!mounted || !isManualSelectionOpen || allCities.length > 0) return;

        const fetchInitialCities = async () => {
            setIsLoadingInitial(true);
            try {
                const res = await getLocalitiesApi(undefined, PAGE_SIZE, 1, lang);
                setAllCities(res.data);
                setHasMoreAll(res.has_more_pages);
                setAllCitiesPage(1);
            } catch (error) {
                console.error('Failed to fetch initial cities:', error);
            } finally {
                setIsLoadingInitial(false);
            }
        };
        fetchInitialCities();
    }, [mounted, isManualSelectionOpen, allCities.length, lang]);

    // 4. Search logic with debounce
    useEffect(() => {
        if (!mounted) return;

        if (searchQuery.length >= 2) {
            const searchCities = async () => {
                setIsSearching(true);
                try {
                    const res = await getLocalitiesApi(searchQuery, PAGE_SIZE, 1, lang);
                    setSearchResults(res.data);
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
    }, [mounted, searchQuery, lang]);

    // 5. Click outside handler (Global instance only)
    useEffect(() => {
        if (!mounted || !renderGlobalUI) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (target.closest(`.${s.wrapper}`)) return;
            dispatch(setManualSelectionOpen(false));
        };

        document.addEventListener('click', handleClickOutside, true);
        return () => document.removeEventListener('click', handleClickOutside, true);
    }, [mounted, renderGlobalUI, dispatch]);

    const handleLoadMore = async () => {
        if (isLoadingMore) return;

        if (searchQuery.length >= 2 && hasMoreSearch) {
            setIsLoadingMore(true);
            try {
                const nextPage = searchPage + 1;
                const res = await getLocalitiesApi(searchQuery, PAGE_SIZE, nextPage, lang);
                setSearchResults(prev => [...prev, ...res.data]);
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
                setAllCities(prev => [...prev, ...res.data]);
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
        dispatch(setSelectedCity(city));
        dispatch(setPromptVisible(false));
        dispatch(setPromptInteractionDone(true));
        dispatch(setManualSelectionOpen(false));
    };

    const handleConfirmYes = () => {
        dispatch(setPromptVisible(false));
        dispatch(setPromptInteractionDone(true));
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
                        isLoadingInitial ? (
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

    if (!mounted) {
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
        <div className={s.wrapper} ref={wrapperRef} suppressHydrationWarning>
            {renderSelector && (
                <>
                    <div className={s.citySelector} onClick={toggleDropdown}>
                        <span className={s.cityLabel}>{t.label}</span>
                        <span className={s.cityValue}>
                            {selectedCity?.name || '...'}
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
