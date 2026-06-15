'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { Locale } from '@/i18n/config';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import PersonalContentBlock from '@/app/components/Personal/Shared/PersonalContentBlock';
import PersonalPageHeader from '@/app/components/Personal/Shared/PersonalPageHeader';
import { personalDict } from '@/app/components/Personal/Shared/PersonalShared';
import { logout } from '@/store/slices/authSlice';
import { logoutApi } from '@/lib/graphql/queries/auth';
import { clearAuthCookies, getAccessToken } from '@/app/actions/authActions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/app/components/ui/Button/Button';
import ShoppingListCard from './ShoppingListCard/ShoppingListCard';
import { 
    getShoppingListsApi, 
    deleteShoppingListApi, 
    addShoppingListToCartApi,
    ShoppingList 
} from '@/lib/graphql/queries/pages/shoppingList';
import { getProductsByIdsApi, resolveProductImageUrl } from '@/lib/graphql/queries/products';
import { fetchCartAsync } from '@/store/slices/cartSlice';
import Spinner from '@/app/components/ui/Spinner/Spinner';
import CartModal from '@/app/components/CartModal/CartModal';
import DeleteShoppingListModal from './DeleteShoppingListModal/DeleteShoppingListModal';
import s from './ShoppingListClient.module.scss';

const shoppingListDict = {
    ua: {
        title: "СПИСОК ПОКУПОК",
        createBtn: "СТВОРИТИ НОВИЙ СПИСОК",
        sumLabel: "Сума списку",
    },
    ru: {
        title: "СПИСОК ПОКУПОК",
        createBtn: "СОЗДАТЬ НОВЫЙ СПИСОК",
        sumLabel: "Сумма списка",
    }
};

interface ShoppingListClientProps {
    lang: Locale;
}

export default function ShoppingListClient({ lang }: ShoppingListClientProps) {
    const hydrated = useIsHydrated();
    const dict = shoppingListDict[lang] || shoppingListDict.ua;
    const pDict = personalDict[lang] || personalDict.ua;
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);

    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [listToDelete, setListToDelete] = useState<string | null>(null);
    const todayDate = new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uk-UA');

    const loadLists = async () => {
        try {
            setIsLoading(true);
            const token = await getAccessToken();
            if (token) {
                const res = await getShoppingListsApi(100, 1, token, lang);
                const fetchedLists = res.data || [];

                const allProductIds = Array.from(new Set(
                    fetchedLists.flatMap(list => (list.products || []).map(p => p.productId))
                ));

                let detailsMap: Record<number, string> = {};
                if (allProductIds.length > 0) {
                    try {
                        const details = await getProductsByIdsApi(allProductIds, lang);
                        details.forEach(prod => {
                            detailsMap[Number(prod.id)] = resolveProductImageUrl(prod);
                        });
                    } catch (e) {
                        console.error("Failed to fetch product details for images:", e);
                    }
                }

                const updatedLists = fetchedLists.map(list => ({
                    ...list,
                    products: (list.products || []).map(p => {
                        const resolvedImgUrl = detailsMap[p.productId];
                        if (resolvedImgUrl) {
                            return {
                                ...p,
                                image: {
                                    grid2x: resolvedImgUrl
                                }
                            };
                        }
                        return p;
                    })
                }));

                setLists(updatedLists);
            }
        } catch (error) {
            console.error('Failed to load shopping lists:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (hydrated) {
            loadLists();
        }
    }, [hydrated]);

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

    const handleDeleteClick = (id: string) => {
        setListToDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!listToDelete) return;
        try {
            const token = await getAccessToken();
            if (token) {
                const success = await deleteShoppingListApi(listToDelete, token, lang);
                if (success) {
                    setLists((prev) => prev.filter((item) => item.id !== listToDelete));
                }
            }
        } catch (error) {
            console.error('Failed to delete shopping list:', error);
        } finally {
            setListToDelete(null);
        }
    };

    const handleAddToCart = async (id: string) => {
        try {
            const token = await getAccessToken();
            if (token) {
                const success = await addShoppingListToCartApi(id, token, lang);
                if (success) {
                    dispatch(fetchCartAsync());
                    setIsCartModalOpen(true);
                }
            }
        } catch (error) {
            console.error('Failed to add shopping list to cart:', error);
        }
    };

    if (!hydrated) {
        return null;
    }

    return (
        <div className={s.shoppingListPage}>
            <PersonalContentBlock className={s.shoppingBlock}>
                <PersonalPageHeader 
                    title={dict.title}
                    logoutLabel={pDict.navigation.logout}
                    onLogout={handleLogout}
                    user={user}
                    navDict={pDict.navigation}
                />

                <Button 
                    variant="black" 
                    className={s.createBtn} 
                    href={`/${lang}/personal/shopping-list/create`}
                >
                    {dict.createBtn}
                </Button>

                {isLoading ? (
                    <Spinner />
                ) : (
                    <div className={s.listsGrid}>
                        {lists.map((item) => (
                            <ShoppingListCard
                                key={item.id}
                                name={item.name || ''}
                                date={todayDate}
                                products={item.products || []}
                                totalSum={item.total || 0}
                                sumLabel={dict.sumLabel}
                                onEdit={() => router.push(`/${lang}/personal/shopping-list/create?id=${item.id}`)}
                                onAddToCart={() => handleAddToCart(item.id)}
                                onDelete={() => handleDeleteClick(item.id)}
                            />
                        ))}
                    </div>
                )}
            </PersonalContentBlock>
            <CartModal isOpen={isCartModalOpen} onClose={() => setIsCartModalOpen(false)} />
            <DeleteShoppingListModal
                isOpen={listToDelete !== null}
                onClose={() => setListToDelete(null)}
                onConfirm={handleConfirmDelete}
                lang={lang}
            />
        </div>
    );
}

