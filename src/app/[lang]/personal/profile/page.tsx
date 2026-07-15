'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { logoutApi, deleteUserApi } from '@/lib/graphql/queries/auth';
import { clearAuthCookies, getAccessToken } from '@/app/actions/authActions';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { Locale } from '@/i18n/config';
import BonusCard from '@/app/components/Personal/BonusCard/BonusCard';
import RecentOrderCard from '@/app/components/Personal/RecentOrderCard/RecentOrderCard';
import Button from '@/app/components/ui/Button/Button';
import ProfileForm, { ProfileFormValues } from '@/app/components/Personal/ProfileForm/ProfileForm';
import RecentlyViewedSlider, { RecentlyViewedProduct } from '@/app/components/Personal/RecentlyViewedSlider/RecentlyViewedSlider';
import { 
    getProductsByIdsApi, 
    Product as ApiProduct, 
    resolveProductImageUrl,
    getOrdersApi,
    getUserDiscountInfoApi,
    UserDiscountInfo,
    getProductWeight,
    getProductBadge,
} from '@/lib/graphql';
import { updateUserDataApi } from '@/lib/graphql/queries/auth';
import { setUser } from '@/store/slices/authSlice';
import { personalDict } from '@/app/components/Personal/Shared/PersonalShared';
import PersonalContentBlock from '@/app/components/Personal/Shared/PersonalContentBlock';
import PersonalPageHeader from '@/app/components/Personal/Shared/PersonalPageHeader';
import s from './Profile.module.scss';
import clsx from "clsx";

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
    const userId = user?.id;
    const localViewedIds = useAppSelector((state) => state.viewedProducts.items);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const params = useParams();
    const lang = (params?.lang as Locale) || 'ua';
    const dict = profileDict[lang as keyof typeof profileDict];
    
    const hydrated = useIsHydrated();
    const [viewedProducts, setViewedProducts] = React.useState<RecentlyViewedProduct[]>([]);
    const [submitStatus, setSubmitStatus] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [recentOrder, setRecentOrder] = React.useState<{
        id: string;
        status: string;
        totalItems: number;
        items: string[];
    } | null>(null);
    const [discountInfo, setDiscountInfo] = React.useState<UserDiscountInfo | null>(null);
    const [loading, setLoading] = React.useState(true);

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
        if (!hydrated) return;

        const fetchViewedProducts = async () => {
            try {
                if (!localViewedIds || localViewedIds.length === 0) {
                    setViewedProducts([]);
                    return;
                }
                
                const idsToFetch = localViewedIds.slice(0, 12).map(Number);
                const products = await getProductsByIdsApi(idsToFetch, lang);
                const mappedProducts = (products || []).map((p: ApiProduct) => ({
                    id: p.id,
                    slug: p.slug,
                    title: p.name,
                    price: p.cost,
                    oldPrice: p.oldCost ?? undefined,
                    unit: p.unit,
                    image: resolveProductImageUrl(p),
                    badge: getProductBadge(p, lang),
                    weight: getProductWeight(p),
                    hasCostVariants: p.hasCostVariants,
                    portionSize: p.portionSize
                }));
                setViewedProducts(mappedProducts);
            } catch (err) {
                console.error('Error fetching viewed products:', err);
            }
        };

        fetchViewedProducts();
    }, [lang, localViewedIds, hydrated]);

    React.useEffect(() => {
        if (!hydrated || !userId) {
            setLoading(false);
            return;
        }

        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const token = await getAccessToken();
                if (!token) {
                    setLoading(false);
                    return;
                }

                const [discountRes, ordersRes] = await Promise.all([
                    getUserDiscountInfoApi(token, lang),
                    getOrdersApi(token, { limit: 1 }, lang)
                ]);

                if (discountRes) {
                    setDiscountInfo(discountRes);
                }

                if (ordersRes && ordersRes.data && ordersRes.data.length > 0) {
                    const firstOrder = ordersRes.data[0];
                    const productIds = Array.from(new Set(
                        (firstOrder.items || [])
                            .map(item => Number(item.id))
                            .filter(id => !isNaN(id) && id > 0)
                    ));

                    const detailsMap: Record<number, string> = {};
                    if (productIds.length > 0) {
                        try {
                            const details = await getProductsByIdsApi(productIds, lang);
                            details.forEach(prod => {
                                detailsMap[Number(prod.id)] = resolveProductImageUrl(prod);
                            });
                        } catch (e) {
                            console.error("Failed to fetch product details for recent order images:", e);
                        }
                    }

                    const orderImages = (firstOrder.items || []).map(item => {
                        const productId = Number(item.id);
                        if (productId && detailsMap[productId]) {
                            return detailsMap[productId];
                        }
                        const url = item.image?.list1x || item.image?.grid1x || item.image?.main1x || null;
                        if (!url) return '/images/product-placeholder.svg';
                        if (url.startsWith('/images/')) return url;
                        if (url.startsWith('/')) return `https://dev-api.myastoriya.com.ua${url}`;
                        return url;
                    });

                    const totalProductsCount = firstOrder.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;

                    setRecentOrder({
                        id: firstOrder.id,
                        status: firstOrder.status?.name || (lang === 'ru' ? 'Новый заказ' : 'Нове замовлення'),
                        totalItems: totalProductsCount,
                        items: orderImages
                    });
                } else {
                    setRecentOrder(null);
                }
            } catch (err) {
                console.error("Error loading profile details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [hydrated, userId, lang]);

    const handleFormSubmit = async (values: ProfileFormValues) => {
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
                    patronymic: values.middleName,
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
                patronymic: updatedUser.patronymic,
                phone: updatedUser.phone,
                email: updatedUser.email,
                birthday: updatedUser.birthday,
                sex: updatedUser.sex,
                bonuses: updatedUser.bonuses,
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
    return (
        <>
            <PersonalContentBlock>
                <PersonalPageHeader 
                    title={dict.title}
                    logoutLabel={personalDict[lang].navigation.logout}
                    onLogout={handleLogout}
                    user={user}
                    navDict={personalDict[lang].navigation}
                />
                
                <div className={s.profileContainer}>
                    {loading ? (
                        <div className={s.topCardsRow}>
                            <div className={clsx(s.cardWrapper, s.cardWrapperRecentOrderCard)}>
                                <div className={clsx(s.skeletonCard, s.skeletonRecentOrder)} />
                            </div>
                            <div className={s.cardWrapper}>
                                <div className={clsx(s.skeletonCard, s.skeletonBonus)} />
                            </div>
                        </div>
                    ) : (
                        <div className={s.topCardsRow}>
                            <div className={clsx(s.cardWrapper, s.cardWrapperRecentOrderCard)}>
                                <RecentOrderCard 
                                    status={recentOrder?.status}
                                    items={recentOrder?.items}
                                    totalItems={recentOrder?.totalItems}
                                    onDetails={recentOrder ? () => router.push(`/${lang}/personal/orders/${recentOrder.id}`) : undefined}
                                />
                            </div>
                            <div className={s.cardWrapper}>
                                <BonusCard 
                                    balance={user?.bonuses || 0} 
                                    percent={discountInfo?.discount || 3} 
                                    dict={dict.bonusCard} 
                                />
                            </div>
                        </div>
                    )}

                    {hydrated ? (
                        <ProfileForm 
                            user={user} 
                            dict={dict.form} 
                            onSubmit={handleFormSubmit}
                            submitStatus={submitStatus}
                        />
                    ) : (
                        <div style={{ height: '400px' }} />
                    )}

                    <Button variant="outline-black" className={s.deleteBtn} onClick={handleDeleteAccount}>
                        {dict.deleteAccount.button}
                    </Button>
                </div>
            </PersonalContentBlock>

            {viewedProducts.length > 0 && (
                <PersonalContentBlock>
                    <RecentlyViewedSlider title={dict.recommendations.title} products={viewedProducts} />
                </PersonalContentBlock>
            )}
        </>
    );
}
