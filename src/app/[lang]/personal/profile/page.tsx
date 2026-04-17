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
import { updateUserDataApi } from '@/lib/graphql/queries/auth';
import { setUser } from '@/store/slices/authSlice';
import s from './Profile.module.scss';

const profileDict = {
  ua: {
    title: "Особистий кабінет клієнта",
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
      firstName: "Ім'я",
      lastName: "Прізвище",
      middleName: "По батькові",
      phone: "Телефон",
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
      firstName: "Имя",
      lastName: "Фамилия",
      middleName: "Отчество",
      phone: "Телефон",
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
    const [submitStatus, setSubmitStatus] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

    React.useEffect(() => {
        if (submitStatus) {
            const timer = setTimeout(() => {
                setSubmitStatus(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [submitStatus]);

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

    const handleFormSubmit = async (values: any) => {
        try {
            const token = await getAccessToken();
            if (!token) {
                setSubmitStatus({
                    type: 'error',
                    message: lang === 'ua' ? 'Помилка авторизації. Будь ласка, увійдіть знову.' : 'Ошибка авторизации. Пожалуйста, войдите снова.'
                });
                return;
            }

            const updatedUser = await updateUserDataApi(
                {
                    name: values.name,
                    surname: values.surname,
                    phone: values.phone,
                    email: values.email || '',
                    birthday: values.birthday || '',
                    sex: values.gender,
                },
                token,
                lang
            );

            dispatch(setUser({
                id: updatedUser.id,
                name: updatedUser.name,
                surname: updatedUser.surname,
                phone: updatedUser.phone,
                email: updatedUser.email,
                birthday: updatedUser.birthday,
                sex: updatedUser.sex,
            }));

            setSubmitStatus({
                type: 'success',
                message: lang === 'ua' ? 'Зміни успішно збережено!' : 'Изменения успешно сохранены!'
            });
        } catch (error) {
            console.error('Update profile error:', error);
            setSubmitStatus({
                type: 'error',
                message: lang === 'ua' ? 'Помилка при збереженні змін.' : 'Ошибка при сохранении изменений.'
            });
        }
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
                submitStatus={submitStatus}
            />

            <div className={s.sliderWrapper}>
                <RecentlyViewedSlider title={dict.recommendations.title} products={viewedProducts} />
            </div>
            <Button variant="outline-black" className={s.deleteBtn} onClick={handleDeleteAccount}>
                {dict.deleteAccount.button}
            </Button>
        </div>
    );
}
