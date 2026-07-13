'use client';

import React, { useState } from "react";
import Image from "next/image";
import s from "./Thanks.module.scss";
import { type Locale } from "@/i18n/config";
import Button from "@/app/components/ui/Button/Button";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs/Breadcrumbs";

const translations = {
    ua: {
        breadcrumbsHome: "Головна",
        breadcrumbsThanks: "Оформлення замовлення",
        thankYou: "ДЯКУЄМО ЗА ВАШЕ ЗАМОВЛЕННЯ!",
        managerNotice: "Ваше замовлення вже у нас - менеджер зв'яжеться тільки в разі необхідності уточнення.",
        orderLabel: "Замовлення",
        backToHome: "ПОВЕРНУТИСЬ НА ГОЛОВНУ",
        trackOrder: "СЛІДКУВАТИ ЗА ЗАМОВЛЕННЯМ",
        promoCopied: "Промокод скопійовано у буфер обміну!",
        promoCodeValue: "DF32FA#fd",
    },
    ru: {
        breadcrumbsHome: "Главная",
        breadcrumbsThanks: "Оформление заказа",
        thankYou: "СПАСИБО ЗА ВАШ ЗАКАЗ!",
        managerNotice: "Ваш заказ уже у нас - менеджер свяжется только в случае необходимости уточнения.",
        orderLabel: "Заказ",
        backToHome: "ВЕРНУТЬСЯ НА ГЛАВНУЮ",
        trackOrder: "СЛЕДИТЬ ЗА ЗАКАЗОМ",
        promoCopied: "Промокод скопирован в буфер обмена!",
        promoCodeValue: "DF32FA#fd",
    }
};

interface ThanksPageProps {
    lang: Locale;
    orderId?: string;
}

export default function ThanksPage({ lang, orderId }: ThanksPageProps) {
    const t = translations[lang] || translations.ua;
    const [copied, setCopied] = useState(false);

    const handleCopyPromo = async () => {
        try {
            await navigator.clipboard.writeText(t.promoCodeValue);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            console.error("Failed to copy promo code:", err);
        }
    };

    const homeUrl = "/";
    const ordersUrl = orderId 
        ? `/personal/orders/${orderId}` 
        : `/personal/orders`;

    const breadcrumbs = [
        { label: t.breadcrumbsHome, href: "/" },
        { label: t.breadcrumbsThanks },
    ];

    return (
        <main className={s.wrapper} id="thanks-page">
            <div className={s.inner}>
                <Breadcrumbs items={breadcrumbs} className={s.breadcrumbs} />

                {/* Верхня ілюстрація */}
                <div className={s.imageBlock}>
                    <Image 
                        src="/images/thanks/tahnks_img.svg" 
                        alt="Thanks illustration" 
                        width={280} 
                        height={180} 
                        priority
                        className={s.thanksImage}
                    />
                </div>

                {/* Текстовий блок */}
                <h1 className={s.title}>{t.thankYou}</h1>
                <p className={s.notice}>{t.managerNotice}</p>

                {/* Номер замовлення */}
                {orderId && (
                    <div className={s.orderNumberBlock}>
                        <span className={s.orderLabel}>{t.orderLabel}</span>
                        <span className={s.orderNumber}>№ {orderId}</span>
                    </div>
                )}

                {/* Кнопки дій */}
                <div className={s.actionsBlock}>
                    <Button 
                        variant="outline-black" 
                        href={homeUrl}
                        className={s.btn}
                    >
                        {t.backToHome}
                    </Button>
                    <Button 
                        variant="red" 
                        href={ordersUrl}
                        className={s.btn}
                    >
                        {t.trackOrder}
                    </Button>
                </div>

                {/* Банер першого замовлення */}
                <div className={s.bannerContainer}>
                    <picture className={s.bannerBg}>
                        <source media="(min-width: 768px)" srcSet="/images/thanks/thanks_banner_desktop.webp" />
                        <img 
                            src="/images/thanks/thanks_banner_mobile.webp" 
                            alt="Promo banner background" 
                            className={s.bannerBgImage} 
                        />
                    </picture>
                    <div className={s.bannerContent}>
                        <p className={s.bannerText}>
                            {lang === "ua" ? (
                                <>
                                    ЦЕ ВАШЕ ПЕРШЕ ЗАМОВЛЕННЯ, ТОМУ МИ ВАМ <span className={s.highlight}>ДАРУЄМО</span> <span className={s.highlight}>ПРОМОКОД ЗІ ЗНИЖКОЮ 15%</span> НА ВАШЕ НАСТУПНЕ ЗАМОВЛЕННЯ!
                                </>
                            ) : (
                                <>
                                    ЭТО ВАШ ПЕРВЫЙ ЗАКАЗ, ПОЭТОМУ МЫ ВАМ <span className={s.highlight}>ДАРИМ</span> <span className={s.highlight}>ПРОМОКОД СО СКИДКОЙ 15%</span> НА ВАШ СЛЕДУЮЩИЙ ЗАКАЗ!
                                </>
                            )}
                        </p>
                        <div className={s.promoBlock} onClick={handleCopyPromo} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleCopyPromo()}>
                            <span className={s.promoCode}>{t.promoCodeValue}</span>
                            <button className={s.copyBtn} aria-label="Copy promo code" type="button">
                                <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 4.511C11.9931 4.45129 11.9796 4.39246 11.96 4.3355V4.277C11.9279 4.21017 11.8852 4.14873 11.8333 4.095L7.83333 0.195C7.77822 0.144441 7.71521 0.102753 7.64667 0.0714999C7.62677 0.068744 7.60657 0.068744 7.58667 0.0714999C7.51894 0.0336318 7.44415 0.00932373 7.36667 0H4.66667C4.13623 0 3.62753 0.205446 3.25245 0.571142C2.87738 0.936838 2.66667 1.43283 2.66667 1.95V2.6H2C1.46957 2.6 0.960859 2.80545 0.585787 3.17114C0.210714 3.53684 0 4.03283 0 4.55V11.05C0 11.5672 0.210714 12.0632 0.585787 12.4289C0.960859 12.7946 1.46957 13 2 13H7.33333C7.86377 13 8.37247 12.7946 8.74755 12.4289C9.12262 12.0632 9.33333 11.5672 9.33333 11.05V10.4H10C10.5304 10.4 11.0391 10.1946 11.4142 9.82886C11.7893 9.46316 12 8.96717 12 8.45V4.55C12 4.55 12 4.55 12 4.511ZM8 2.2165L9.72667 3.9H8.66667C8.48986 3.9 8.32029 3.83152 8.19526 3.70962C8.07024 3.58772 8 3.42239 8 3.25V2.2165ZM8 11.05C8 11.2224 7.92976 11.3877 7.80474 11.5096C7.67971 11.6315 7.51014 11.7 7.33333 11.7H2C1.82319 11.7 1.65362 11.6315 1.5286 11.5096C1.40357 11.3877 1.33333 11.2224 1.33333 11.05V4.55C1.33333 4.37761 1.40357 4.21228 1.5286 4.09038C1.65362 3.96848 1.82319 3.9 2 3.9H2.66667V8.45C2.66667 8.96717 2.87738 9.46316 3.25245 9.82886C3.62753 10.1946 4.13623 10.4 4.66667 10.4H8V11.05ZM10.6667 8.45C10.6667 8.62239 10.5964 8.78772 10.4714 8.90962C10.3464 9.03152 10.1768 9.1 10 9.1H4.66667C4.48986 9.1 4.32029 9.03152 4.19526 8.90962C4.07024 8.78772 4 8.62239 4 8.45V1.95C4 1.77761 4.07024 1.61228 4.19526 1.49038C4.32029 1.36848 4.48986 1.3 4.66667 1.3H6.66667V3.25C6.66667 3.76717 6.87738 4.26316 7.25245 4.62886C7.62753 4.99455 8.13623 5.2 8.66667 5.2H10.6667V8.45Z" fill="white"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Тост сповіщення */}
                {copied && (
                    <div className={s.toast}>
                        {t.promoCopied}
                    </div>
                )}
            </div>
        </main>
    );
}
