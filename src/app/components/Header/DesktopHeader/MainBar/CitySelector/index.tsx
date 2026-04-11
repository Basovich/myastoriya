'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
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
    selectLocalityApi,
    Locality, getSelectedLocalityApi,
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
    renderPrompt?: boolean;
    renderSelector?: boolean;
}

export default function CitySelector({ 
    renderPrompt = true, 
    renderSelector = true 
}: CitySelectorProps) {
    const dispatch = useAppDispatch();
    const params = useParams();
    const lang = (params?.lang as 'ua' | 'ru') || 'ua';
    const t = translations[lang] || translations.ua;

    const { 
        selectedCity, 
        isPromptVisible, 
        isDetectionLoading, 
        isManualSelectionOpen,
        isPromptInteractionDone
    } = useAppSelector((state) => state.locality);
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    // Initial cities list
    const [allCities, setAllCities] = useState<Locality[]>([]);
    const [allCitiesPage, setAllCitiesPage] = useState(1);
    const [hasMoreAll, setHasMoreAll] = useState(true);
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);

    // Search results
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Locality[]>([]);
    const [searchPage, setSearchPage] = useState(1);
    const [hasMoreSearch, setHasMoreSearch] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Handle initial auto-detection - Always run logic regardless of props to sync state
    useEffect(() => {
        const detectCity = async () => {
            // Only detect if no city is selected AND we haven't interacted with prompt before
            if (!selectedCity && !isDetectionLoading && !isPromptInteractionDone && isAuthenticated) {
                dispatch(setDetectionLoading(true));
                try {
                    const existing = await getSelectedLocalityApi(lang);
                    
                    if (existing) {
                        dispatch(setSelectedCity(existing));
                        dispatch(setPromptVisible(true));
                    } else {
                        const detected = await autoDetectLocalityApi(undefined, undefined, lang);
                        
                        if (detected) {
                            dispatch(setSelectedCity(detected));
                            dispatch(setPromptVisible(true));
                        } else {
                            const fallback = { id: 1, name: lang === 'ua' ? 'Київ' : 'Киев' };
                            dispatch(setSelectedCity(fallback));
                            dispatch(setPromptVisible(true));
                        }
                    }
                } catch (error) {
                    console.warn('[CitySelector] Failed to determine locality:', error);
                    const fallback = { id: 1, name: lang === 'ua' ? 'Київ' : 'Киев' };
                    dispatch(setSelectedCity(fallback));
                    dispatch(setPromptVisible(true));
                } finally {
                    dispatch(setDetectionLoading(false));
                }
            }
        };

        detectCity();
    }, [selectedCity, isDetectionLoading, isPromptInteractionDone, isAuthenticated, dispatch, lang]);

    // Fetch initial cities for the dropdown
    useEffect(() => {
        const fetchInitialCities = async () => {
            if (isManualSelectionOpen && allCities.length === 0) {
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
            }
        };
        fetchInitialCities();
    }, [isManualSelectionOpen, lang, allCities.length]);

    // Handle search
    useEffect(() => {
        const searchCities = async () => {
            if (searchQuery.length >= 2) {
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
            } else {
                setSearchResults([]);
                setSearchPage(1);
                setHasMoreSearch(false);
            }
        };

        const timer = setTimeout(searchCities, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, lang]);

    // Load more handler
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
                console.error('Load more search failed:', error);
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
                console.error('Load more cities failed:', error);
            } finally {
                setIsLoadingMore(false);
            }
        }
    };

    // Scroll listener for infinite scroll
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const reachedBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
        
        if (reachedBottom) {
            handleLoadMore();
        }
    };

    // Click outside handler - Only for manual selection dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                dispatch(setManualSelectionOpen(false));
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dispatch]);

    const handleSelectCity = async (city: Locality) => {
        try {
            await selectLocalityApi(city.id, lang);
            dispatch(setSelectedCity(city));
            dispatch(setManualSelectionOpen(false));
            dispatch(setPromptVisible(false));
            dispatch(setPromptInteractionDone(true));
            setSearchQuery('');
        } catch (error) {
            console.error('Failed to select city:', error);
        }
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

    const toggleDropdown = () => {
        dispatch(setManualSelectionOpen(!isManualSelectionOpen));
        if (isPromptVisible) {
            dispatch(setPromptVisible(false));
        }
    };

    return (
        <div className={clsx(renderSelector && s.wrapper)} ref={wrapperRef}>
            {renderSelector && (
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
            )}

            {renderPrompt && isPromptVisible && selectedCity && (
                <div className={s.prompt}>
                    <div className={s.promptContent}>
                        <p className={s.promptText}>
                            {t.prompt.title} {selectedCity.name}?
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
            )}

            {renderSelector && isManualSelectionOpen && (
                <div className={s.dropdown}>
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
                    <div className={s.cityList} onScroll={handleScroll} ref={listRef}>
                        {searchQuery.length < 2 ? (
                            isLoadingInitial ? (
                                <div className={s.loader}>...</div>
                            ) : allCities.length > 0 ? (
                                <>
                                    {allCities.map((city) => (
                                        <div key={city.id} className={s.cityItem} onClick={() => handleSelectCity(city)}>
                                            <span className={clsx(s.cityName, selectedCity?.id === city.id && s.active)}>
                                                {city.name}
                                            </span>
                                        </div>
                                    ))}
                                    {isLoadingMore && <div className={s.loader}>...</div>}
                                </>
                            ) : (
                                <div className={s.notFound}>{t.notFound}</div>
                            )
                        ) : isSearching ? (
                            <div className={s.loader}>...</div>
                        ) : searchResults.length > 0 ? (
                            <>
                                {searchResults.map((city) => (
                                    <div key={city.id} className={s.cityItem} onClick={() => handleSelectCity(city)}>
                                        <span className={clsx(s.cityName, selectedCity?.id === city.id && s.active)}>
                                            {city.name}
                                        </span>
                                    </div>
                                ))}
                                {isLoadingMore && <div className={s.loader}>...</div>}
                            </>
                        ) : (
                            <div className={s.notFound}>{t.notFound}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
