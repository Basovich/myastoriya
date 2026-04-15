'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { logoutApi } from '@/lib/graphql/queries/auth';
import { clearAuthCookies, getAccessToken } from '@/app/actions/authActions';
import { Locale } from '@/i18n/config';

import BonusCard from '@/app/components/Personal/BonusCard/BonusCard';
import RecentOrderCard from '@/app/components/Personal/RecentOrderCard/RecentOrderCard';
import ProfileForm from '@/app/components/Personal/ProfileForm/ProfileForm';
import RecentlyViewedSlider from '@/app/components/Personal/RecentlyViewedSlider/RecentlyViewedSlider';
import SectionHeader from '@/app/components/ui/SectionHeader/SectionHeader';
import { getViewedProductsApi, Product as ApiProduct } from '@/lib/graphql/queries/products';
import s from './Profile.module.scss';

const profileDict = {
  ua: {
    title: "ОСОБИСТИЙ КАБІНЕТ КЛІЄНТА",
    bonusCard: {
      balanceLabel: "Ваші бали",
      cashbackLabel: "Кешбек балами",
      exchangeRate: "1 Б = 1 ₴",
      howToUse: "ЯК ВИКОРИСТОВУВАТИ?",
      orderPercent: "Від замовлення"
    },
    logout: "Вийти",
    recentOrder: {
      title: "Останнє / Активне замовлення",
      statusLabel: "Статус:",
      detailsButton: "ДЕТАЛІ",
      moreItems: "+{count}"
    },
    form: {
      personalDataTitle: "Особисті дані",
      firstName: "Ім'я*",
      lastName: "Прізвище*",
      middleName: "По батькові*",
      phone: "Телефон*",
      email: "E-mail",
      birthday: "День народження",
      gender: {
        title: "Стать",
        male: "Чоловіча",
        female: "Жіноча"
      },
      googleAuth: "Зв'язати аккаунт Google",
      saveButton: "ЗБЕРЕГТИ ЗМІНИ"
    },
    recommendations: {
      title: "Товари що ви дивилися"
    }
  },
  ru: {
    title: "ЛИЧНЫЙ КАБИНЕТ КЛИЕНТА",
    bonusCard: {
      balanceLabel: "Ваши баллы",
      cashbackLabel: "Кэшбэк баллами",
      exchangeRate: "1 Б = 1 ₴",
      howToUse: "КАК ИСПОЛЬЗОВАТЬ?",
      orderPercent: "От заказа"
    },
    logout: "Выйти",
    recentOrder: {
      title: "Последний / Активный заказ",
      statusLabel: "Статус:",
      detailsButton: "ДЕТАЛИ",
      moreItems: "+{count}"
    },
    form: {
      personalDataTitle: "Личные данные",
      firstName: "Имя*",
      lastName: "Фамилия*",
      middleName: "Отчество*",
      phone: "Телефон*",
      email: "E-mail",
      birthday: "День рождения",
      gender: {
        title: "Пол",
        male: "Мужской",
        female: "Женский"
      },
      googleAuth: "Связать аккаунт Google",
      saveButton: "СОХРАНИТЬ ИЗМЕНЕНИЯ"
    },
    recommendations: {
      title: "Товары которые вы смотрели"
    }
  }
};

export default function ProfilePage() {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const params = useParams();
    const lang = (params?.lang as Locale) || 'ua';
    const dict = profileDict[lang as keyof typeof profileDict];
    
    const [viewedProducts, setViewedProducts] = React.useState<any[]>([]);

    const handleLogout = async () => {
        try {
            const token = await getAccessToken();
            if (token) {
                await logoutApi(token);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            await clearAuthCookies();
            dispatch(logout());
            router.push(`/${lang === 'ua' ? '' : lang}`);
        }
    };

    React.useEffect(() => {
        const fetchViewedProducts = async () => {
            try {
                const { getAccessToken } = await import('@/app/actions/authActions');
                const token = await getAccessToken();
                
                const products = await getViewedProductsApi(12, lang, token || undefined);
                const mappedProducts = products.map((p: ApiProduct) => ({
                    id: p.id,
                    title: p.name,
                    price: p.cost,
                    unit: p.unit,
                    image: p.image?.url.grid2x || '',
                    badge: p.is_new ? "NEW" : null,
                    weight: p.specifications?.find((s: any) => 
                        s.name.toLowerCase().includes('важ') || 
                        s.name.toLowerCase().includes('вес')
                    )?.values[0] || p.multiplier?.toString() || ""
                }));
                setViewedProducts(mappedProducts);
            } catch (err) {
                console.error('Error fetching viewed products:', err);
            }
        };

        fetchViewedProducts();
    }, [lang]);

    const handleFormSubmit = (values: Record<string, string>) => {
        console.log('Update Profile:', values);
    };

    const mockOrder = {
        status: lang === 'ua' ? 'Видано кур\'єру' : 'Выдано курьеру',
        totalItems: 5,
        items: [
            '/images/products/product-sticks-cheese.png',
            '/images/products/product-teriyaki.png',
            '/images/products/product-tartar.png',
        ]
    };

    return (
        <div className={s.profileContainer}>
            <div className={s.unifiedBlock}>
                <div className={s.blockHeader}>
                    <div className={s.titleGroup}>
                        <SectionHeader 
                            title={dict.title} 
                            withDots={false} 
                            classNameTitle={s.pageTitle}
                        />
                        <div className={s.brandDots}>
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                    <button className={s.logoutBtn} onClick={handleLogout}>
                        <span>{dict.logout}</span>
                        <svg className={s.logoutIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C13.66 4 15 5.34 15 7C15 8.66 13.66 10 12 10C10.34 10 9 8.66 9 7C9 5.34 10.34 4 12 4ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>

                <div className={s.topCardsRow}>
                    <div className={s.cardWrapper}>
                        <RecentOrderCard 
                            status={mockOrder.status}
                            items={mockOrder.items}
                            totalItems={mockOrder.totalItems}
                            dict={dict.recentOrder}
                        />
                    </div>
                    <div className={s.cardWrapper}>
                        <BonusCard 
                            balance={1200} 
                            percent={3} 
                            dict={dict.bonusCard} 
                        />
                    </div>
                </div>

                <ProfileForm 
                    user={user} 
                    dict={dict.form} 
                    onSubmit={handleFormSubmit} 
                />
            </div>

            <div className={s.sliderWrapper}>
                <RecentlyViewedSlider 
                    title={dict.recommendations.title} 
                    products={viewedProducts} 
                />
            </div>
        </div>
    );
}
