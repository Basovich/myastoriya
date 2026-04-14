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
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="15" 
                                height="17" 
                                viewBox="0 0 15 17" 
                                fill="none"
                                className={s.logoutIcon}
                            >
                                <path 
                                    d="M7.47253 0.10452C10.0062 0.104559 11.989 2.14286 11.989 4.621C11.9889 7.09901 10.0061 9.13744 7.47253 9.13748C4.99192 9.13748 3.01012 7.09819 3.00997 4.621C3.00997 2.14368 4.99183 0.10452 7.47253 0.10452ZM7.47253 1.22754C5.64561 1.22754 4.07907 2.7424 4.07907 4.621C4.07923 6.49947 5.6457 8.01446 7.47253 8.01446C9.3521 8.01442 10.8658 6.50048 10.866 4.621C10.866 2.74138 9.35219 1.22757 7.47253 1.22754Z" 
                                    fill="black" 
                                    stroke="black" 
                                    strokeWidth="0.2"
                                />
                                <path 
                                    d="M4.16452 9.42586C4.28725 9.38496 4.4283 9.38298 4.56632 9.48181L4.90811 9.66796C5.71592 10.0725 6.59505 10.2742 7.47355 10.2742C7.66098 10.2743 7.81003 10.3419 7.91198 10.4502C8.01257 10.5571 8.06144 10.6976 8.06151 10.8357C8.06151 10.9739 8.01263 11.1153 7.91198 11.2223C7.81003 11.3304 7.66084 11.3971 7.47355 11.3972C6.40096 11.3972 5.27568 11.1132 4.30286 10.6058C2.56236 11.6502 1.42876 13.4402 1.23898 15.4407H13.761C13.5676 13.3172 12.311 11.4592 10.4377 10.4706V10.4695C10.2791 10.3893 10.1843 10.2655 10.1499 10.1257C10.1161 9.98802 10.1418 9.8439 10.2058 9.72391C10.2699 9.60383 10.3756 9.5014 10.509 9.44926C10.6447 9.39622 10.8035 9.39866 10.9637 9.47876H10.9657C13.3676 10.7343 14.8952 13.2455 14.8952 15.9748C14.8952 16.3013 14.6338 16.5637 14.3073 16.5637H0.69273C0.374199 16.5637 0.104774 16.3091 0.104774 16.0287C0.104785 13.3582 1.51951 10.904 3.86139 9.59269C3.93666 9.5425 4.04711 9.465 4.16452 9.42586Z" 
                                    fill="black" 
                                    stroke="black" 
                                    strokeWidth="0.2"
                                />
                            </svg>
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
