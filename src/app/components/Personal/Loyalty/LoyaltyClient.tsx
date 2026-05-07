'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
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
import s from './LoyaltyClient.module.scss';

const loyaltyDict = {
    ua: {
        title: "ПРОГРАМА ЛОЯЛЬНОСТІ",
        balanceLabel: "Ваш бальний рахунок",
        pointsSuffix: "Б",
        conversionLabel: "1 Б = 1 ₴",
        progressText: "Для отримання більшого кешбеку, у розмірі +4% нарахувань балами, необхідно зробити замовлень на суму:",
        progressTarget: "16 000 ГРН",
        cashbackPromo: "+3% Ваш кешбек балами від замовлення",
        stepsTitle: "Етапи накопичення балами",
        termsTitle: "Умови програми лояльності",
        showMore: "ПОКАЗАТИ ЩЕ",
        steps: [
            { id: "01", range: "Від 1 грн до 8000 грн", percent: "1%" },
            { id: "02", range: "Від 8001 грн до 16000 грн", percent: "2%" },
            { id: "03", range: "Від 16001 грн до 30000 грн", percent: "3%" },
            { id: "04", range: "Від 30001 грн та більше", percent: "4%" }
        ],
        terms: "Товариство з обмеженою відповідальністю «М’ЯСТОРІЯ» (надалі – Організатор), що діє на підставі Статуту, з однієї сторони та будь-яка дієздатна фізична особа, яка прийняла (акцептувала) дану пропозицію (надалі - Учасник) з іншого боку, надалі разом – Сторони. Дані Правила Програми лояльності (надалі - Програма), розроблені у відповідності до Конституції України, Цивільного та Господарського кодексів України, Закону України «Про захист прав споживачів», Закону України «Про захист персональних даних», інших нормативно-правових актів України та Статуту Організатора.\n\nПравила Програми лояльності є документом, що регламентує взаємовідносини Організатора та Учасників Програми при здійсненні ними купівлі товарів в фірмових магазинах-кафе «М’ЯСТОРІЯ» у м. Києві та Київській обл., на веб-сайті www.myastoriya.com.ua чи в мобільному застосунку «М’ЯСТОРІЯ» в межах дії Програми. Правила Програми є обов’язковими для виконання Організатором та Учасниками Програми. Правила Програми лояльності є публічною пропозицією (офертою) для участі в Програмі фізичних осіб, які бажають стать Учасниками Програми на підставі цих Правил Програми лояльності та прийняття на себе обов'язку їх дотримання."
    },
    ru: {
        title: "ЛОЯЛЬНОСТЬ И БОНУСЫ",
        balanceLabel: "Ваш балльный счет",
        pointsSuffix: "Б",
        conversionLabel: "1 Б = 1 ₴",
        progressText: "Для получения большего кэшбэка в размере +4% начислений баллами, необходимо совершить заказов на сумму:",
        progressTarget: "16 000 ГРН",
        cashbackPromo: "+3% Ваш кэшбэк баллами от заказа",
        stepsTitle: "Этапы накопления баллами",
        termsTitle: "Условия программы лояльности",
        showMore: "ПОКАЗАТЬ ЕЩЕ",
        steps: [
            { id: "01", range: "От 1 грн до 8000 грн", percent: "1%" },
            { id: "02", range: "От 8001 грн до 16000 грн", percent: "2%" },
            { id: "03", range: "От 16001 грн до 30000 грн", percent: "3%" },
            { id: "04", range: "От 30001 грн и более", percent: "4%" }
        ],
        terms: "Общество с ограниченной ответственностью «МЯСТОРИЯ» (далее – Организатор)..."
    }
};

export default function LoyaltyClient({ lang }: { lang: Locale }) {
    const hydrated = useIsHydrated();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const dict = loyaltyDict[lang] || loyaltyDict.ua;
    const pDict = personalDict[lang] || personalDict.ua;
    const [isExpanded, setIsExpanded] = useState(false);

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
        <div className={s.loyaltyPage}>
            <PersonalContentBlock className={s.dashboardBlock}>
                <div className={s.blockBg}>
                    <Image 
                        src="/images/loyalty_bg_desktop.webp" 
                        alt="Loyalty background" 
                        fill 
                        className={s.desktopBg}
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                    <Image 
                        src="/images/loyalty_bg_mobile.webp" 
                        alt="Loyalty background" 
                        fill 
                        className={s.mobileBg}
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                    <div className={s.overlay} />
                </div>

                <div className={s.blockContent}>
                    <div className={s.pageHeaderWrapper}>
                        <PersonalPageHeader 
                            title={dict.title}
                            logoutLabel={pDict.navigation.logout}
                            onLogout={handleLogout}
                            user={user}
                            navDict={pDict.navigation}
                            isDark={true}
                        />
                    </div>

                    <div className={s.dashboard}>
                        <div className={s.leftColumn}>
                            <div className={s.balanceCard}>
                                <div className={s.balanceHeader}>
                                    <span className={s.balanceLabel}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white" />
                                        </svg>
                                        {dict.balanceLabel}
                                    </span>
                                </div>
                                <div className={s.balanceBody}>
                                    <div className={s.balanceValue}>
                                        <span className={s.amount}>1500</span>
                                        <span className={s.currency}>б</span>
                                    </div>
                                    <div className={s.conversionTag}>1 Б = 1 ₴</div>
                                </div>
                            </div>

                            <div className={s.progressCard}>
                                <div className={s.progressTextWrapper}>
                                    <p className={s.progressDesc}>
                                        Для отримання більшого <strong>кешбеку</strong>,<br />
                                        у розмірі <span className={s.whiteHighlight}>+4%</span> нарахувань балами,<br />
                                        необхідно зробити замовлень<br />
                                        на суму:
                                    </p>
                                    <div className={s.targetAmount}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2"/>
                                            <path d="M7 8H17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                            <path d="M7 12H17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                            <path d="M7 16H13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                        16 000 грн
                                    </div>
                                </div>
                                <div className={s.progressGraphics}>
                                    <div className={s.giftBox}>
                                        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="25" y="45" width="70" height="55" rx="4" fill="#FFC700" />
                                            <rect x="20" y="35" width="80" height="15" rx="2" fill="#FFD600" />
                                            <rect x="55" y="35" width="10" height="65" fill="#FF6B00" />
                                            <path d="M60 35C60 35 40 15 30 25C20 35 50 35 60 35Z" fill="#FF6B00" />
                                            <path d="M60 35C60 35 80 15 90 25C100 35 70 35 60 35Z" fill="#FF6B00" />
                                            <rect x="20" y="35" width="80" height="4" fill="white" fillOpacity="0.3" />
                                        </svg>
                                    </div>
                                    <div className={s.percentSign}>
                                        %
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={s.stepsCard}>
                            <div className={s.promoBox}>
                                <div className={s.cashbackValue}>+3%</div>
                                <span className={s.cashbackLabel}>Ваш кешбек балами від замовлення</span>
                            </div>
                            
                            <div className={s.timelineWrapper}>
                                <div className={s.timelineLabel}>
                                    Етапи<br />накопичень<br />балами
                                </div>
                                <div className={s.timeline}>
                                    <div className={s.timelineLine} />
                                    {dict.steps.map((step) => {
                                        const isLast = step.id === "04";
                                        const rangeParts = step.range.includes(' до ') 
                                            ? step.range.split('Від ')[1].split(' до ')
                                            : [step.range.split('Від ')[1]];
                                        
                                        return (
                                            <div key={step.id} className={s.stepItem}>
                                                <div className={clsx(s.stepMarker, s[`marker${step.id}`])}>{step.id}</div>
                                                <div className={s.stepInfo}>
                                                    <div className={s.stepRange}>
                                                        Від <strong>{rangeParts[0]}</strong>
                                                        {rangeParts[1] && <> до <strong>{rangeParts[1]}</strong></>} 
                                                        {isLast && <> до</>} — <span className={s.redText}>{step.percent}</span> балами
                                                    </div>
                                                    <div className={s.stepDesc}>від суми чеку на рахунок клієнта;</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PersonalContentBlock>

            <PersonalContentBlock className={s.contentBlock}>
                <div className={s.termsSection}>
                    <h2 className={s.sectionTitle}>{dict.termsTitle}</h2>
                    <div className={`${s.termsText} ${isExpanded ? s.expanded : ''}`}>
                        {dict.terms}
                    </div>
                    {!isExpanded && (
                        <Button 
                            variant="outline-black" 
                            className={s.showMoreBtn}
                            onClick={() => setIsExpanded(true)}
                        >
                            {dict.showMore}
                        </Button>
                    )}
                </div>
            </PersonalContentBlock>
        </div>
    );
}
