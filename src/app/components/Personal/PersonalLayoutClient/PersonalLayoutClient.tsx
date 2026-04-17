'use client';

import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { logoutApi } from '@/lib/graphql/queries/auth';
import { clearAuthCookies, getAccessToken } from '@/app/actions/authActions';
import { useRouter, usePathname } from 'next/navigation';
import { Locale } from '@/i18n/config';
import Header from '@/app/components/Header/Header';
import Footer from '@/app/components/Footer/Footer';
import PersonalNav from '@/app/components/Personal/PersonalNav/PersonalNav';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs/Breadcrumbs';
import s from '@/app/[lang]/personal/PersonalLayout.module.scss';

const personalDict = {
  ua: {
    title: "Особистий кабінет клієнта",
    navigation: {
      personalData: "Особисті дані",
      orderHistory: "Мої замовлення",
      myReviews: "Мої відгуки",
      loyalty: "Лояльність та бонуси",
      wishlist: "Список бажань",
      shoppingList: "Список покупок",
      deliveryAddresses: "Адреси доставки",
      bankCards: "Банківські картки",
      pickupPoints: "Точки самовивозу",
      changePassword: "Зміна паролю",
      logout: "Вийти"
    }
  },
  ru: {
    title: "ЛИЧНЫЙ КАБИНЕТ КЛИЕНТА",
    navigation: {
      personalData: "Личные данные",
      orderHistory: "Мои заказы",
      myReviews: "Мои отзывы",
      loyalty: "Лояльность и бонусы",
      wishlist: "Список желаний",
      shoppingList: "Список покупок",
      deliveryAddresses: "Адреса доставки",
      bankCards: "Банковские карты",
      pickupPoints: "Точки самовывоза",
      changePassword: "Смена пароля",
      logout: "Выйти"
    }
  }
};

interface PersonalLayoutClientProps {
    children: React.ReactNode;
    lang: Locale;
}

export default function PersonalLayoutClient({ children, lang }: PersonalLayoutClientProps) {
    const { user, isGuest, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const dict = personalDict[lang as keyof typeof personalDict];

    const breadcrumbItems = [
        { label: lang === 'ua' ? 'Головна' : 'Главная', href: `/${lang === 'ua' ? '' : 'ru'}` },
        { label: dict.title, href: '#' }
    ];

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

    if (isInitialized && (!isAuthenticated || isGuest)) {
        return null; // layout.tsx server check should handle this, but for extra safety
    }

    return (
        <main className={s.pageWrapper}>
            <Header lang={lang} />
            <div className={s.personalPage}>
                <div className={s.breadcrumbsWrapper}>
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                <div className={s.layoutBody}>
                    <aside className={s.sidebar}>
                        <PersonalNav
                            dict={dict.navigation} 
                            onLogout={handleLogout} 
                            user={user}
                        />
                    </aside>

                    <div className={s.mainContent}>
                        {children}
                    </div>
                </div>
            </div>
            <Footer lang={lang} />
        </main>
    );
}
