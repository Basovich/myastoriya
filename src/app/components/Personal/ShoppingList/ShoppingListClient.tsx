'use client';

import React from 'react';
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
import Button from '@/app/components/ui/Button/Button';
import ShoppingListCard from './ShoppingListCard/ShoppingListCard';
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

const mockShoppingLists = [
    {
        id: "1",
        name: "НАЗВА СПИСКУ ПОКУПОК",
        date: "12.08.2025",
        products: ["/images/product-ribeye.jpg", "/images/product-meatballs.jpg", "/images/product-sausages.jpg", "/images/product-shashlik.jpg", "/images/product-ribeye.jpg", "/images/product-meatballs.jpg", "/images/product-sausages.jpg", "/images/product-shashlik.jpg", "/images/product-ribeye.jpg", "/images/product-meatballs.jpg", "/images/product-sausages.jpg"],
        totalSum: 12050
    },
    {
        id: "2",
        name: "НАЗВА СПИСКУ ПОКУПОК",
        date: "12.08.2025",
        products: ["/images/product-ribeye.jpg", "/images/product-meatballs.jpg", "/images/product-sausages.jpg", "/images/product-shashlik.jpg"],
        totalSum: 12050
    },
    {
        id: "3",
        name: "НАЗВА СПИСКУ ПОКУПОК",
        date: "12.08.2025",
        products: ["/images/product-ribeye.jpg", "/images/product-meatballs.jpg", "/images/product-sausages.jpg"],
        totalSum: 12050
    },
    {
        id: "4",
        name: "НАЗВА СПИСКУ ПОКУПОК",
        date: "12.08.2025",
        products: ["/images/product-shashlik.jpg"],
        totalSum: 12050
    }
];

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

                <Button variant="black" className={s.createBtn} onClick={() => console.log('Create new list')}>
                    {dict.createBtn}
                </Button>

                <div className={s.listsGrid}>
                    {mockShoppingLists.map((item) => (
                        <ShoppingListCard
                            key={item.id}
                            name={item.name}
                            date={item.date}
                            products={item.products}
                            totalSum={item.totalSum}
                            onEdit={() => console.log('Edit list', item.id)}
                            onAddToCart={() => console.log('Add list to cart', item.id)}
                            onDelete={() => console.log('Delete list', item.id)}
                        />
                    ))}
                </div>
            </PersonalContentBlock>
        </div>
    );
}
