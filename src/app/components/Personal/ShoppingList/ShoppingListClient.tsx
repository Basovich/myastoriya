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
import { fetchCartAsync } from '@/store/slices/cartSlice';
import Spinner from '@/app/components/ui/Spinner/Spinner';
import s from './ShoppingListClient.module.scss';

const shoppingListDict = {
    ua: {
        title: "СПИСОК ПОКУПОК",
        createBtn: "СТВОРИТИ НОВИЙ СПИСОК",
    },
    ru: {
        title: "СПИСОК ПОКУПОК",
        createBtn: "СОЗДАТЬ НОВЫЙ СПИСОК",
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

    const loadLists = async () => {
        try {
            setIsLoading(true);
            const token = await getAccessToken();
            if (token) {
                const res = await getShoppingListsApi(100, 1, token, lang);
                setLists(res.data || []);
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

    const handleDelete = async (id: string) => {
        if (!confirm(lang === 'ua' ? 'Ви впевнені, що хочете видалити цей список покупок?' : 'Вы уверены, что хотите удалить этот список покупок?')) {
            return;
        }
        try {
            const token = await getAccessToken();
            if (token) {
                const success = await deleteShoppingListApi(id, token, lang);
                if (success) {
                    setLists((prev) => prev.filter((item) => item.id !== id));
                }
            }
        } catch (error) {
            console.error('Failed to delete shopping list:', error);
        }
    };

    const handleAddToCart = async (id: string) => {
        try {
            const token = await getAccessToken();
            if (token) {
                const success = await addShoppingListToCartApi(id, token, lang);
                if (success) {
                    dispatch(fetchCartAsync());
                    alert(lang === 'ua' ? 'Товари успішно додано до кошика!' : 'Товары успешно добавлены в корзину!');
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

                <Link href={`/${lang}/personal/shopping-list/create`} className={s.createLink}>
                    <Button variant="black" className={s.createBtn}>
                        {dict.createBtn}
                    </Button>
                </Link>

                {isLoading ? (
                    <Spinner />
                ) : (
                    <div className={s.listsGrid}>
                        {lists.map((item) => (
                            <ShoppingListCard
                                key={item.id}
                                name={item.name || ''}
                                date="—"
                                products={item.products || []}
                                totalSum={item.total || 0}
                                onEdit={() => router.push(`/${lang}/personal/shopping-list/create?id=${item.id}`)}
                                onAddToCart={() => handleAddToCart(item.id)}
                                onDelete={() => handleDelete(item.id)}
                            />
                        ))}
                    </div>
                )}
            </PersonalContentBlock>
        </div>
    );
}
