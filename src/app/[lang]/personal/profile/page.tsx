'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { logoutApi, deleteUserApi } from '@/lib/graphql/queries/auth';
import { clearAuthCookies, getAccessToken } from '@/app/actions/authActions';
import { Locale } from '@/i18n/config';

import BonusCard from '@/app/components/Personal/BonusCard/BonusCard';
import RecentOrderCard from '@/app/components/Personal/RecentOrderCard/RecentOrderCard';
import Button from '@/app/components/ui/Button/Button';
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
    deleteAccount: {
      button: "Видалити акаунт",
      confirm: "Ви впевнені, що хочете видалити свій акаунт? Ця дія є незворотною."
    },
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
    deleteAccount: {
      button: "Удалить аккаунт",
      confirm: "Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо."
    },
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

    const handleDeleteAccount = async () => {
        if (!window.confirm(dict.deleteAccount.confirm)) {
            return;
        }

        try {
            const token = await getAccessToken();
            if (token) {
                const success = await deleteUserApi(token);
                if (success) {
                    await clearAuthCookies();
                    dispatch(logout());
                    router.push(`/${lang === 'ua' ? '' : lang}`);
                }
            }
        } catch (error) {
            console.error('Delete account error:', error);
            alert('Сталася помилка при видаленні акаунта. Спробуйте пізніше.');
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
                    <div className={s.headerActions}>
                        <Button variant="outline-black" className={s.deleteBtn} onClick={handleDeleteAccount}>
                            {dict.deleteAccount.button}
                        </Button>
                        <Button variant="outline-black" className={s.logoutBtn} onClick={handleLogout}>
                            <span>{dict.logout}</span>
                            <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.17676 0.100586C8.26956 0.100693 9.9072 1.78414 9.90723 3.83105C9.90723 5.878 8.26958 7.56239 6.17676 7.5625C4.12732 7.5625 2.49023 5.87725 2.49023 3.83105C2.49026 1.78488 4.12734 0.100586 6.17676 0.100586ZM6.17676 1.05273C4.68119 1.05273 3.39847 2.29325 3.39844 3.83105C3.39844 5.36889 4.68117 6.60938 6.17676 6.60938C7.71553 6.60927 8.95508 5.36982 8.95508 3.83105C8.95505 2.29232 7.71552 1.05284 6.17676 1.05273Z" fill="black" stroke="black" strokeWidth="0.2"/>
                                <path d="M3.4502 7.77148C3.55397 7.73694 3.67352 7.73604 3.79102 7.81934L3.79199 7.81836C4.52907 8.25193 5.3531 8.46869 6.17676 8.46875C6.3348 8.46875 6.46194 8.52585 6.54883 8.61816C6.63434 8.70904 6.67576 8.82836 6.67578 8.94531C6.67578 9.06226 6.6343 9.18157 6.54883 9.27246C6.46194 9.36477 6.3348 9.42188 6.17676 9.42188C5.29484 9.42182 4.37023 9.20478 3.56934 8.77246C2.14936 9.62724 1.22354 11.0871 1.06348 12.7197H11.335C11.1714 10.984 10.1428 9.46603 8.61035 8.65723V8.65625C8.47628 8.58849 8.39558 8.48359 8.36621 8.36426C8.33744 8.24704 8.35902 8.12481 8.41309 8.02344C8.46719 7.92204 8.55675 7.83531 8.66992 7.79102C8.78549 7.74587 8.92034 7.74779 9.05566 7.81543L9.05762 7.81641C11.0387 8.85207 12.2987 10.9228 12.2988 13.1738C12.2988 13.4504 12.0774 13.6728 11.8008 13.6729H0.597656C0.328898 13.6728 0.0998578 13.4583 0.0996094 13.2188C0.0996094 11.0159 1.26713 8.99171 3.19922 7.91016C3.26041 7.86936 3.35137 7.80443 3.4502 7.77148Z" fill="black" stroke="black" strokeWidth="0.2"/>
                            </svg>
                        </Button>
                    </div>
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
                <RecentlyViewedSlider lang={lang} products={viewedProducts} />
            </div>
        </div>
    );
}
