'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import s from './ShoppingListCreateClient.module.scss';

const createDict = {
    ua: {
        title: "СТВОРЕННЯ СПИСКУ ПОКУПОК",
        namePlaceholder: "Назва списку покупок",
        searchPlaceholder: "Знайти товар за назвою",
        categoryPlaceholder: "Обрати категорію",
        searchBtn: "ПОШУК",
        yourListTitle: "Ваш список",
        sumLabel: "Сума списку",
        addToCartBtn: "ДОДАТИ СПИСОК У КОШИК",
        saveBtn: "ЗБЕРЕГТИ СПИСОК",
    },
    ru: {
        title: "СОЗДАНИЕ СПИСКА ПОКУПОК",
        namePlaceholder: "Название списка покупок",
        searchPlaceholder: "Найти товар по названию",
        categoryPlaceholder: "Выбрать категорию",
        searchBtn: "ПОИСК",
        yourListTitle: "Ваш список",
        sumLabel: "Сумма списка",
        addToCartBtn: "ДОБАВИТЬ СПИСОК В КОРЗИНУ",
        saveBtn: "СОХРАНИТЬ СПИСОК",
    }
};

const mockSearchResults = [
    { id: "s1", name: "Салат с креветками под ореховым соусом", price: 2500, weight: "270 г", image: "/images/product-ribeye.jpg" },
    { id: "s2", name: "Салат с креветками под ореховым соусом", price: 2500, weight: "270 г", image: "/images/product-meatballs.jpg" },
    { id: "s3", name: "Салат с креветками под ореховым соусом", price: 2500, weight: "270 г", image: "/images/product-sausages.jpg" },
];

const mockAddedItems = [
    { id: "a1", name: "Чизбургер з біфштексом із фермерської яловичини", price: 2500, unitPrice: "179 грн / шт", weight: "330г / 340г / 200г", image: "/images/product-meatballs.jpg" },
    { id: "a2", name: "Чизбургер з біфштексом із фермерської яловичини", price: 870, unitPrice: "179 грн / шт", weight: "330г / 340г / 200г", image: "/images/product-sausages.jpg" },
    { id: "a3", name: "Чизбургер з біфштексом із фермерської яловичини", price: 2500, unitPrice: "179 грн / шт", weight: "330г / 340г / 200г", image: "/images/product-shashlik.jpg" },
    { id: "a4", name: "Чизбургер з біфштексом із фермерської яловичини", price: 870, unitPrice: "179 грн / шт", weight: "330г / 340г / 200г", image: "/images/product-ribeye.jpg" },
    { id: "a5", name: "Чизбургер з біфштексом із фермерської яловичини", price: 2500, unitPrice: "179 грн / шт", weight: "330г / 340г / 200г", image: "/images/product-meatballs.jpg" },
    { id: "a6", name: "Чизбургер з біфштексом із фермерської яловичини", price: 870, unitPrice: "179 грн / шт", weight: "330г / 340г / 200г", image: "/images/product-sausages.jpg" },
    { id: "a7", name: "Чизбургер з біфштексом із фермерської яловичини", price: 2500, unitPrice: "179 грн / шт", weight: "330г / 340г / 200г", image: "/images/product-shashlik.jpg" },
    { id: "a8", name: "Чизбургер з біфштексом із фермерської яловичини", price: 870, unitPrice: "179 грн / шт", weight: "330г / 340г / 200г", image: "/images/product-ribeye.jpg" },
];

export default function ShoppingListCreateClient({ lang }: { lang: Locale }) {
    const hydrated = useIsHydrated();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const dict = createDict[lang] || createDict.ua;
    const pDict = personalDict[lang] || personalDict.ua;

    const [listName, setListName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

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

    if (!hydrated) return null;

    return (
        <div className={s.createPage}>
            <PersonalContentBlock className={s.contentBlock}>
                <PersonalPageHeader 
                    title={dict.title}
                    logoutLabel={pDict.navigation.logout}
                    onLogout={handleLogout}
                    user={user}
                    navDict={pDict.navigation}
                />

                <div className={s.formHeader}>
                    <input 
                        type="text" 
                        className={s.nameInput} 
                        placeholder={dict.namePlaceholder}
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                    />

                    <div className={s.searchRow}>
                        <Search 
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder={dict.searchPlaceholder}
                            buttonText={dict.searchBtn}
                            className={s.searchField}
                        />
                        <select className={s.categorySelect}>
                            <option value="">{dict.categoryPlaceholder}</option>
                            <option value="1">М'ясо</option>
                            <option value="2">Ковбаси</option>
                        </select>
                    </div>
                </div>

                <div className={s.mainGrid}>
                    <div className={s.searchResults}>
                        <div className={s.resultsGrid}>
                            {mockSearchResults.map(item => (
                                <SearchProductCard 
                                    key={item.id}
                                    {...item}
                                    onAdd={() => console.log('Add', item.id)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={s.activeList}>
                        <div className={s.listHeader}>
                            <h2 className={s.listTitle}>{dict.yourListTitle}</h2>
                            <div className={s.listDate}>
                                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                    <path d="M9.35 1.1H8.25V0.55C8.25 0.404131 8.19205 0.264236 8.08891 0.161091C7.98576 0.0579462 7.84587 0 7.7 0C7.55413 0 7.41424 0.0579462 7.31109 0.161091C7.20795 0.264236 7.15 0.404131 7.15 0.55V1.1H3.85V0.55C3.85 0.404131 3.79205 0.264236 3.68891 0.161091C3.58576 0.0579462 3.44587 0 3.3 0C3.15413 0 3.01424 0.0579462 2.91109 0.161091C2.80795 0.264236 2.75 0.404131 2.75 0.55V1.1H1.65C1.21239 1.1 0.792709 1.27384 0.483274 1.58327C0.173839 1.89271 0 2.31239 0 2.75V9.35C0 9.78761 0.173839 10.2073 0.483274 10.5167C0.792709 10.8262 1.21239 11 1.65 11H9.35C9.78761 11 10.2073 10.8262 10.5167 10.5167C10.8262 10.2073 11 9.78761 11 9.35V2.75C11 2.31239 10.8262 1.89271 10.5167 1.58327C10.2073 1.27384 9.78761 1.1 9.35 1.1ZM9.9 9.35C9.9 9.49587 9.84205 9.63576 9.73891 9.73891C9.63576 9.84205 9.49587 9.9 9.35 9.9H1.65C1.50413 9.9 1.36424 9.84205 1.26109 9.73891C1.15795 9.63576 1.1 9.49587 1.1 9.35V5.5H9.9V9.35ZM9.9 4.4H1.1V2.75C1.1 2.60413 1.15795 2.46424 1.26109 2.36109C1.36424 2.25795 1.50413 2.2 1.65 2.2H2.75V2.75C2.75 2.89587 2.80795 3.03576 2.91109 3.13891C3.01424 3.24205 3.15413 3.3 3.3 3.3C3.44587 3.3 3.58576 3.24205 3.68891 3.13891C3.79205 3.03576 3.85 2.89587 3.85 2.75V2.2H7.15V2.75C7.15 2.89587 7.20795 3.03576 7.31109 3.13891C7.41424 3.24205 7.55413 3.3 7.7 3.3C7.84587 3.3 7.98576 3.24205 8.08891 3.13891C8.19205 3.03576 8.25 2.89587 8.25 2.75V2.2H9.35C9.49587 2.2 9.63576 2.25795 9.73891 2.36109C9.84205 2.46424 9.9 2.60413 9.9 2.75V4.4Z" fill="black"/>
                                </svg>
                                12.08.2025
                            </div>
                        </div>

                        <div className={s.itemsList}>
                            {mockAddedItems.map(item => (
                                <AddedProductItem 
                                    key={item.id}
                                    {...item}
                                    onRemove={() => console.log('Remove', item.id)}
                                />
                            ))}
                        </div>

                        <div className={s.listFooter}>
                            <div className={s.footerActions}>
                                <Button variant="outline-black" className={s.footerBtn}>{dict.addToCartBtn}</Button>
                                <Button variant="red" className={s.footerBtn}>{dict.saveBtn}</Button>
                            </div>
                            <div className={s.sumBlock}>
                                <span className={s.sumLabel}>{dict.sumLabel}</span>
                                <span className={s.sumValue}>12 050 ₴</span>
                            </div>
                        </div>
                    </div>
                </div>
            </PersonalContentBlock>
        </div>
    );
}
