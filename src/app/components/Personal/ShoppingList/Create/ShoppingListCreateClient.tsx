'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Locale } from '@/i18n/config';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { logoutApi } from '@/lib/graphql/queries/auth';
import { clearAuthCookies, getAccessToken } from '@/app/actions/authActions';
import { personalDict } from '@/app/components/Personal/Shared/PersonalShared';
import PersonalContentBlock from '@/app/components/Personal/Shared/PersonalContentBlock';
import PersonalPageHeader from '@/app/components/Personal/Shared/PersonalPageHeader';
import Button from '@/app/components/ui/Button/Button';
import Search from '@/app/components/ui/Search/Search';
import SearchProductCard from './SearchProductCard';
import AddedProductItem from './AddedProductItem';
import { 
    Product, 
    ProductCategory, 
    getCategoriesApi, 
    getCatalogTreeApi,
    getProductsApi, 
    resolveProductImageUrl 
} from '@/lib/graphql/queries/products';
import { 
    getShoppingListByIdApi, 
    createShoppingListApi, 
    renameShoppingListApi,
    addProductToShoppingListApi, 
    deleteProductFromShoppingListApi, 
    addShoppingListToCartApi,
    ShoppingListProduct
} from '@/lib/graphql/queries/pages/shoppingList';
import { fetchCartAsync } from '@/store/slices/cartSlice';
import Spinner from '@/app/components/ui/Spinner/Spinner';
import CustomSelect from '@/app/components/ui/CustomSelect';
import s from './ShoppingListCreateClient.module.scss';

const createDict = {
    ua: {
        title: "СТВОРЕННЯ СПИСКУ ПОКУПОК",
        editTitle: "РЕДАГУВАННЯ СПИСКУ ПОКУПОК",
        namePlaceholder: "Назва списку покупок",
        searchPlaceholder: "Знайти товар за назвою",
        categoryPlaceholder: "Обрати категорію",
        searchBtn: "ПОШУК",
        yourListTitle: "Ваш список",
        sumLabel: "Сума списку",
        addToCartBtn: "ДОДАТИ СПИСОК У КОШИК",
        saveBtn: "ЗБЕРЕГТИ СПИСОК",
        saving: "ЗБЕРЕЖЕННЯ...",
        searchRequiredError: "Будь ласка, введіть пошуковий запит",
        searchMinLengthError: "Пошуковий запит має містити щонайменше 2 символи",
    },
    ru: {
        title: "СОЗДАНИЕ СПИСКА ПОКУПОК",
        editTitle: "РЕДАКТИРОВАНИЕ СПИСКА ПОКУПОК",
        namePlaceholder: "Название списка покупок",
        searchPlaceholder: "Найти товар по названию",
        categoryPlaceholder: "Выбрать категорию",
        searchBtn: "ПОИСК",
        yourListTitle: "Ваш список",
        sumLabel: "Сумма списка",
        addToCartBtn: "ДОБАВИТЬ СПИСОК В КОРЗИНУ",
        saveBtn: "СОХРАНИТЬ СПИСОК",
        saving: "СОХРАНЕНИЕ...",
        searchRequiredError: "Пожалуйста, введите поисковый запрос",
        searchMinLengthError: "Поисковый запрос должен содержать не менее 2 символов",
    }
};

interface ClientAddedItem {
    id: string;
    productId: number;
    name: string;
    price: number;
    unit: string;
    image: string;
    costVariantId?: number | null;
}

export default function ShoppingListCreateClient({ lang }: { lang: Locale }) {
    const hydrated = useIsHydrated();
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const dict = createDict[lang] || createDict.ua;
    const pDict = personalDict[lang] || personalDict.ua;

    const [listName, setListName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const [originalProducts, setOriginalProducts] = useState<ShoppingListProduct[]>([]);
    const [addedItems, setAddedItems] = useState<ClientAddedItem[]>([]);
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isFetchingNext, setIsFetchingNext] = useState(false);
    const [nameError, setNameError] = useState("");
    const [searchError, setSearchError] = useState("");
    const nameInputRef = useRef<HTMLInputElement>(null);
    const categoryOptions = React.useMemo(() => 
        categories.map(cat => ({
            label: cat.name,
            value: String(cat.id)
        }))
    , [categories]);

    useEffect(() => {
        if (!hydrated) return;

        const init = async () => {
            try {
                setIsLoading(true);
                const tree = await getCatalogTreeApi(lang, 768);
                const flattened: ProductCategory[] = [];
                const recurse = (items: ProductCategory[]) => {
                    for (const item of items) {
                        flattened.push(item);
                        if (item.children && item.children.length > 0) {
                            recurse(item.children);
                        }
                    }
                };
                if (tree) {
                    recurse(tree);
                }
                setCategories(flattened);

                if (editId) {
                    const token = await getAccessToken();
                    if (token) {
                        const list = await getShoppingListByIdApi(editId, token, lang);
                        if (list) {
                            setListName(list.name || "");
                            const prods = list.products || [];
                            setOriginalProducts(prods);
                            setAddedItems(prods.map(p => {
                                const imgUrl = p.image
                                    ? (p.image.grid2x || p.image.main2x || p.image.grid1x || p.image.main1x || p.image.big || '')
                                    : '';
                                const resolvedImg = imgUrl.startsWith('/')
                                    ? `https://dev-api.myastoriya.com.ua${imgUrl}`
                                    : imgUrl || '/images/no-image.jpg';
                                return {
                                    id: p.id,
                                    productId: p.productId,
                                    name: p.name || "",
                                    price: p.cost || 0,
                                    unit: p.unit || "шт",
                                    image: resolvedImg,
                                    costVariantId: p.costVariantId
                                };
                            }));
                        }
                    }
                }
            } catch (error) {
                console.error("Initialization failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, [hydrated, editId, lang]);

    const performSearch = async (query: string, catId: string) => {
        setHasSearched(true);
        setCurrentPage(1);
        try {
            setIsSearching(true);
            const res = await getProductsApi({
                search: query || undefined,
                categoryId: catId ? Number(catId) : undefined,
                limit: 20,
                page: 1
            }, lang);
            setSearchResults(res.data || []);
            setHasMore(res.has_more_pages);
        } catch (error) {
            console.error('Failed to search products:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const loadNextPage = async () => {
        try {
            setIsFetchingNext(true);
            const nextPage = currentPage + 1;
            const res = await getProductsApi({
                search: searchQuery || undefined,
                categoryId: selectedCategory ? Number(selectedCategory) : undefined,
                limit: 20,
                page: nextPage
            }, lang);
            
            if (res.data && res.data.length > 0) {
                setSearchResults(prev => [...prev, ...res.data]);
                setCurrentPage(nextPage);
                setHasMore(res.has_more_pages);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load next page:', error);
        } finally {
            setIsFetchingNext(false);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 150;
        if (isNearBottom && hasMore && !isFetchingNext) {
            void loadNextPage();
        }
    };

    const handleSearchSubmit = () => {
        const query = searchQuery.trim();
        if (!query) {
            setSearchError(dict.searchRequiredError);
            return;
        }
        if (query.length < 2) {
            setSearchError(dict.searchMinLengthError);
            return;
        }
        setSearchError("");
        void performSearch(query, selectedCategory);
    };

    const handleCategoryChange = (catId: string) => {
        setSelectedCategory(catId);
        void performSearch(searchQuery, catId);
    };

    const handleAddProductToList = (prod: Product) => {
        const tempId = `new_${Date.now()}_${Math.random()}`;
        const imgUrl = resolveProductImageUrl(prod) || '/images/no-image.jpg';
        const newItem: ClientAddedItem = {
            id: tempId,
            productId: Number(prod.id),
            name: prod.name,
            price: prod.cost || 0,
            unit: prod.unit || 'шт',
            image: imgUrl,
            costVariantId: null
        };
        setAddedItems((prev) => [...prev, newItem]);
    };

    const handleRemoveItem = (id: string) => {
        setAddedItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handleSaveList = async () => {
        if (!listName.trim()) {
            setNameError(lang === 'ua' ? 'Будь ласка, введіть назву списку' : 'Пожалуйста, введите название списка');
            nameInputRef.current?.focus();
            nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (addedItems.length === 0) {
            alert(lang === 'ua' ? 'Будь ласка, додайте товари до списку' : 'Пожалуйста, добавьте товары в список');
            return;
        }

        try {
            setIsSaving(true);
            const token = await getAccessToken();
            if (!token) return;

            if (editId) {
                const currentList = await getShoppingListByIdApi(editId, token, lang);
                if (currentList && currentList.name !== listName) {
                    await renameShoppingListApi(editId, listName, token, lang);
                }

                const deletedItems = originalProducts.filter(
                    (orig) => !addedItems.some((item) => String(item.id) === String(orig.id))
                );

                const newAddedItems = addedItems.filter((item) => String(item.id).startsWith('new_'));

                for (const item of deletedItems) {
                    await deleteProductFromShoppingListApi(item.id, token, lang);
                }

                for (const item of newAddedItems) {
                    await addProductToShoppingListApi(editId, item.productId, item.costVariantId, token, lang);
                }
            } else {
                const newList = await createShoppingListApi(listName, token, lang);
                for (const item of addedItems) {
                    await addProductToShoppingListApi(newList.id, item.productId, item.costVariantId, token, lang);
                }
            }

            alert(lang === 'ua' ? 'Список покупок успішно збережено!' : 'Список покупок успешно сохранен!');
            router.push(`/${lang}/personal/shopping-list`);
        } catch (error) {
            console.error('Failed to save shopping list:', error);
            alert(lang === 'ua' ? 'Помилка при збереженні списку покупок' : 'Ошибка при сохранении списка покупок');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddListToCart = async () => {
        try {
            const token = await getAccessToken();
            if (!token) return;

            let activeId = editId;
            if (!activeId) {
                if (!listName.trim()) {
                    setNameError(lang === 'ua' ? 'Будь ласка, введіть назву списку' : 'Пожалуйста, введите название списка');
                    nameInputRef.current?.focus();
                    nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return;
                }
                if (addedItems.length === 0) {
                    alert(lang === 'ua' ? 'Будь ласка, додайте товари до списку' : 'Пожалуйста, добавьте товары в список');
                    return;
                }
                setIsSaving(true);
                const newList = await createShoppingListApi(listName, token, lang);
                activeId = newList.id;
                for (const item of addedItems) {
                    await addProductToShoppingListApi(newList.id, item.productId, item.costVariantId, token, lang);
                }
            }

            const success = await addShoppingListToCartApi(activeId, token, lang);
            if (success) {
                dispatch(fetchCartAsync());
                alert(lang === 'ua' ? 'Товари успішно додано до кошика!' : 'Товары успешно добавлены в корзину!');
                router.push(`/${lang}/personal/shopping-list`);
            }
        } catch (error) {
            console.error('Failed to add list to cart:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            const token = await getAccessToken();
            if (token) await logoutApi(token);
        } catch {
            // Ignore
        } finally {
            await clearAuthCookies();
            dispatch(logout());
            router.replace('/');
        }
    };

    if (!hydrated || isLoading) {
        return (
            <div className={s.createPage}>
                <PersonalContentBlock className={s.contentBlock}>
                    <Spinner />
                </PersonalContentBlock>
            </div>
        );
    }

    const totalSum = addedItems.reduce((acc, item) => acc + item.price, 0);
    const titleText = editId ? dict.editTitle : dict.title;


    return (
        <div className={s.createPage}>
            <PersonalContentBlock className={s.contentBlock}>
                <PersonalPageHeader 
                    title={titleText}
                    logoutLabel={pDict.navigation.logout}
                    onLogout={handleLogout}
                    user={user}
                    navDict={pDict.navigation}
                />

                <div className={s.formHeader}>
                    <div className={s.nameInputContainer}>
                        <input 
                            ref={nameInputRef}
                            type="text" 
                            className={`${s.nameInput} ${nameError ? s.errorInput : ''}`} 
                            placeholder={dict.namePlaceholder}
                            value={listName}
                            onChange={(e) => {
                                setListName(e.target.value);
                                if (nameError) setNameError("");
                            }}
                            disabled={isSaving}
                        />
                        {nameError && (
                            <span className={s.errorMessage}>{nameError}</span>
                        )}
                    </div>

                    <div className={s.searchRow}>
                        <div className={s.searchFieldContainer}>
                            <Search 
                                value={searchQuery}
                                onChange={(val) => {
                                    setSearchQuery(val);
                                    if (searchError) setSearchError("");
                                }}
                                placeholder={dict.searchPlaceholder}
                                buttonText={dict.searchBtn}
                                className={`${s.searchField} ${searchError ? s.errorInput : ''}`}
                                onSubmit={handleSearchSubmit}
                                disabled={isSaving}
                            />
                            {searchError && (
                                <span className={s.errorMessage}>{searchError}</span>
                            )}
                        </div>
                        <CustomSelect 
                            options={categoryOptions}
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            placeholder={dict.categoryPlaceholder}
                            className={s.categorySelect}
                        />
                    </div>
                </div>

                <div className={s.mainGrid}>
                    <div className={s.searchResults}>
                        {isSearching ? (
                            <Spinner />
                        ) : !hasSearched ? (
                            <div className={s.noResultsState}>
                                {lang === 'ua' 
                                    ? 'Скористайтеся формою пошуку або оберіть категорію, щоб знайти товари' 
                                    : 'Воспользуйтесь формой поиска или выберите категорию, чтобы найти товары'}
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className={s.noResultsState}>
                                {lang === 'ua' ? 'Нічого не знайдено' : 'Ничего не найдено'}
                            </div>
                        ) : (
                            <div className={s.resultsGrid} onScroll={handleScroll}>
                                {searchResults.map(prod => {
                                    const price = prod.cost || 0;
                                    const imgUrl = resolveProductImageUrl(prod) || '/images/no-image.jpg';
                                    const weightSpec = prod.specifications?.find(
                                        s => s.name.toLowerCase().includes('вага') || s.name.toLowerCase().includes('вес')
                                    );
                                    const weightVal = weightSpec?.values?.[0] || '';

                                    return (
                                        <SearchProductCard 
                                            key={prod.id}
                                            name={prod.name}
                                            price={price}
                                            weight={weightVal}
                                            image={imgUrl}
                                            onAdd={() => handleAddProductToList(prod)}
                                        />
                                    );
                                })}
                                {isFetchingNext && (
                                    <div className={s.nextPageLoader}>
                                        <Spinner />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {addedItems.length > 0 && (
                        <div className={s.activeList}>
                            <div className={s.listHeader}>
                                <h2 className={s.listTitle}>{dict.yourListTitle}</h2>
                                <div className={s.listDate}>
                                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                        <path d="M9.35 1.1H8.25V0.55C8.25 0.404131 8.19205 0.264236 8.08891 0.161091C7.98576 0.0579462 7.84587 0 7.7 0C7.55413 0 7.41424 0.0579462 7.31109 0.161091C7.20795 0.264236 7.15 0.404131 7.15 0.55V1.1H3.85V0.55C3.85 0.404131 3.79205 0.264236 3.68891 0.161091C3.58576 0.0579462 3.44587 0 3.3 0C3.15413 0 3.01424 0.0579462 2.91109 0.161091C2.80795 0.264236 2.75 0.404131 2.75 0.55V1.1H1.65C1.21239 1.1 0.792709 1.27384 0.483274 1.58327C0.173839 1.89271 0 2.31239 0 2.75V9.35C0 9.78761 0.173839 10.2073 0.483274 10.5167C0.792709 10.8262 1.21239 11 1.65 11H9.35C9.78761 11 10.2073 10.8262 10.5167 10.5167C10.8262 10.2073 11 9.78761 11 9.35V2.75C11 2.31239 10.8262 1.89271 10.5167 1.58327C10.2073 1.27384 9.78761 1.1 9.35 1.1ZM9.9 9.35C9.9 9.49587 9.84205 9.63576 9.73891 9.73891C9.63576 9.84205 9.49587 9.9 9.35 9.9H1.65C1.50413 9.9 1.36424 9.84205 1.26109 9.73891C1.15795 9.63576 1.1 9.49587 1.1 9.35V5.5H9.9V9.35ZM9.9 4.4H1.1V2.75C1.1 2.60413 1.15795 2.46424 1.26109 2.36109C1.36424 2.25795 1.50413 2.2 1.65 2.2H2.75V2.75C2.75 2.89587 2.80795 3.03576 2.91109 3.13891C3.01424 3.24205 3.15413 3.3 3.3 3.3C3.44587 3.3 3.58576 3.24205 3.68891 3.13891C3.79205 3.03576 3.85 2.89587 3.85 2.75V2.2H7.15V2.75C7.15 2.89587 7.20795 3.03576 7.31109 3.13891C7.41424 3.24205 7.55413 3.3 7.7 3.3C7.84587 3.3 7.98576 3.24205 8.08891 3.13891C8.19205 3.03576 8.25 2.89587 8.25 2.75V2.2H9.35C9.49587 2.2 9.63576 2.25795 9.73891 2.36109C9.84205 2.46424 9.9 2.60413 9.9 2.75V4.4Z" fill="black"/>
                                    </svg>
                                    —
                                </div>
                            </div>

                            <div className={s.itemsList}>
                                {addedItems.map(item => (
                                    <AddedProductItem 
                                        key={item.id}
                                        name={item.name}
                                        price={item.price}
                                        unitPrice={`${item.price} грн / ${item.unit}`}
                                        weight=""
                                        image={item.image}
                                        onRemove={() => handleRemoveItem(item.id)}
                                    />
                                ))}
                            </div>

                            <div className={s.listFooter}>
                                <div className={s.footerActions}>
                                    <Button 
                                        variant="outline-black" 
                                        className={s.footerBtn}
                                        onClick={handleAddListToCart}
                                        disabled={isSaving}
                                    >
                                        {dict.addToCartBtn}
                                    </Button>
                                    <Button 
                                        variant="red" 
                                        className={s.footerBtn}
                                        onClick={handleSaveList}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? dict.saving : dict.saveBtn}
                                    </Button>
                                </div>
                                <div className={s.sumBlock}>
                                    <span className={s.sumLabel}>{dict.sumLabel}</span>
                                    <span className={s.sumValue}>{totalSum.toLocaleString()} ₴</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </PersonalContentBlock>
        </div>
    );
}
