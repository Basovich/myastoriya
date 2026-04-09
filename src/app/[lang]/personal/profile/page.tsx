'use client';

import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { logoutApi } from '@/lib/graphql/queries/auth';
import { clearAuthCookies, getAccessToken } from '@/app/actions/authActions';
import { useRouter, useParams } from 'next/navigation';
import personalData from '@/content/personal.json';
import { Locale } from '@/i18n/config';

import BonusCard from '@/app/components/Personal/BonusCard/BonusCard';
import RecentOrderCard from '@/app/components/Personal/RecentOrderCard/RecentOrderCard';
import PersonalNav from '@/app/components/Personal/PersonalNav/PersonalNav';
import ProfileForm from '@/app/components/Personal/ProfileForm/ProfileForm';
import ProductCard from '@/app/components/ui/ProductCard/ProductCard';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import RecentlyViewedSlider from '@/app/components/Personal/RecentlyViewedSlider/RecentlyViewedSlider';
import SectionHeader from '@/app/components/ui/SectionHeader/SectionHeader';
import uaData from '@/content/ua.json';
import ruData from '@/content/ru.json';

import s from './Profile.module.scss';

export default function ProfilePage() {
    const { user, isGuest, isAuthenticated } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const params = useParams();
    const router = useRouter();
    const lang = (params?.lang as Locale) || 'ua';
    const dict = personalData[lang as keyof typeof personalData];
    const { items: wishlistIds } = useAppSelector((state) => state.wishlist);
    const mainDict = lang === 'ua' ? uaData : ruData;
    const allProducts = mainDict.home.products.items;

    // Filter products that are in the wishlist
    const wishlistProducts = allProducts.filter(p => wishlistIds.includes(String(p.id)));

    React.useEffect(() => {
        if (!isAuthenticated || isGuest) {
            router.replace(`/${lang === 'ru' ? 'ru' : ''}`);
        }
    }, [isAuthenticated, isGuest, router, lang]);

    const handleLogout = async () => {
        try {
            const token = await getAccessToken();
            if (token) await logoutApi(token);
        } catch {
            // Ignore API errors on logout
        } finally {
            await clearAuthCookies();
            dispatch(logout());
            router.replace('/');
        }
    };

    const handleFormSubmit = (values: Record<string, string>) => {
        console.log('Update Profile:', values);
        // Here we would dispatch an updateProfile action
    };

    // Mock data for display
    const mockOrder = {
        status: lang === 'ua' ? 'В дорозі' : 'В пути',
        totalItems: 5,
        items: [
            '/images/products/product-sticks-cheese.png',
            '/images/products/product-teriyaki.png',
            '/images/products/product-tartar.png',
        ]
    };

    if (!isAuthenticated || isGuest) {
        return null;
    }

    return (
        <main className={s.pageWrapper}>
            <Header lang={lang} />
            <div className={s.profilePage}>
                <div className={s.unifiedBlock}>
                    <div className={s.blockHeader}>
                        <SectionHeader 
                            title={dict.title} 
                            withDots={true} 
                            classNameTitle={s.pageTitle}
                        />
                        <button className={s.logoutBtn} onClick={handleLogout}>
                            <span>{dict.navigation.logout}</span>
                            <img src="/icons/icon-profile.svg" alt="Logout" className={s.logoutIcon} />
                        </button>
                    </div>

                    <div className={s.layoutBody}>
                        <aside className={s.profileSidebar}>
                            <PersonalNav 
                                lang={lang} 
                                dict={dict.navigation} 
                                onLogout={handleLogout} 
                            />
                        </aside>

                        <div className={s.profileMain}>
                            <RecentOrderCard 
                                status={mockOrder.status}
                                items={mockOrder.items}
                                totalItems={mockOrder.totalItems}
                                dict={dict.recentOrder}
                            />

                            <BonusCard 
                                balance={1200} 
                                percent={3} 
                                dict={dict.bonusCard} 
                            />

                            <ProfileForm 
                                user={user} 
                                dict={dict.form} 
                                onSubmit={handleFormSubmit} 
                            />
                        </div>
                    </div>
                </div>

                <RecentlyViewedSlider 
                    title={dict.recommendations.title} 
                    products={wishlistProducts} 
                />
            </div>
            <Footer lang={lang} />
        </main>
    );
}
