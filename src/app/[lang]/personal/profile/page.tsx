'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { useParams } from 'next/navigation';
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
    const params = useParams();
    const lang = (params?.lang as Locale) || 'ua';
    const dict = profileDict[lang as keyof typeof profileDict];
    
    const [viewedProducts, setViewedProducts] = React.useState<any[]>([]);

    React.useEffect(() => {
        getViewedProductsApi(12, lang).then(products => {
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
        }).catch(err => console.error(err));
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
