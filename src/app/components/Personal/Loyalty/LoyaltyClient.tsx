'use client';

import React, { useState, useEffect } from 'react';
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
import { getUserDiscountInfoApi, UserDiscountInfo } from '@/lib/graphql';
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

interface LoyaltyClientProps {
    lang: Locale;
    initialDiscountInfo?: UserDiscountInfo | null;
    initialTerms?: string | null;
}

export default function LoyaltyClient({ lang, initialDiscountInfo, initialTerms }: LoyaltyClientProps) {
    const hydrated = useIsHydrated();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const dict = loyaltyDict[lang] || loyaltyDict.ua;
    const pDict = personalDict[lang] || personalDict.ua;
    
    const [discountInfo, setDiscountInfo] = useState<UserDiscountInfo | null>(initialDiscountInfo || null);
    const [terms, setTerms] = useState<string>(initialTerms || dict.terms);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!discountInfo && isAuthenticated) {
            const fetchDiscountInfo = async () => {
                try {
                    const token = await getAccessToken();
                    if (token) {
                        const info = await getUserDiscountInfoApi(token, lang);
                        if (info) {
                            setDiscountInfo(info);
                        }
                    }
                } catch (error) {
                    console.error('Error loading loyalty data on client:', error);
                }
            };
            fetchDiscountInfo();
        }
    }, [discountInfo, isAuthenticated, lang]);

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
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="11" viewBox="0 0 12 11" fill="none"><path opacity="0.8" d="M11.9799 4.15892C11.942 4.05376 11.8732 3.9614 11.7817 3.89303C11.6903 3.82466 11.5801 3.78322 11.4646 3.77373L8.05521 3.29656L6.52729 0.324309C6.47823 0.22711 6.40162 0.145136 6.30625 0.0877784C6.21087 0.030421 6.10059 0 5.98803 0C5.87547 0 5.76518 0.030421 5.66981 0.0877784C5.57443 0.145136 5.49783 0.22711 5.44876 0.324309L3.92084 3.29081L0.511482 3.77373C0.400586 3.78886 0.296329 3.8335 0.210541 3.9026C0.124754 3.9717 0.060871 4.06249 0.0261423 4.16467C-0.00564746 4.26451 -0.00850021 4.37078 0.0178902 4.47207C0.0442806 4.57335 0.0989178 4.66583 0.175938 4.73957L2.65057 7.03919L2.05139 10.3046C2.02719 10.413 2.03614 10.5257 2.07714 10.6293C2.11814 10.7328 2.18946 10.8228 2.28251 10.8884C2.37556 10.954 2.48638 10.9924 2.60163 10.999C2.71689 11.0056 2.83168 10.9801 2.93219 10.9255L5.98803 9.39055L9.04387 10.9255C9.12796 10.9711 9.22294 10.9948 9.31949 10.9945C9.44642 10.995 9.5702 10.9567 9.67301 10.8853C9.76597 10.8214 9.83794 10.7333 9.88041 10.6314C9.92288 10.5296 9.93408 10.4182 9.91269 10.3104L9.3135 7.04494L11.7881 4.74532C11.8746 4.675 11.9386 4.58257 11.9725 4.47877C12.0065 4.37497 12.009 4.26406 11.9799 4.15892ZM8.29489 6.45854C8.22554 6.52316 8.17351 6.60292 8.14325 6.69102C8.11299 6.77912 8.1054 6.87293 8.12112 6.96445L8.55254 9.37905L6.2996 8.22924C6.21204 8.18768 6.11567 8.16606 6.01799 8.16606C5.9203 8.16606 5.82393 8.18768 5.73637 8.22924L3.48344 9.37905L3.91485 6.96445C3.93057 6.87293 3.92298 6.77912 3.89272 6.69102C3.86246 6.60292 3.81044 6.52316 3.74109 6.45854L1.94353 4.73382L4.4661 4.38313C4.56317 4.37018 4.65544 4.33458 4.73483 4.27945C4.81423 4.22432 4.87831 4.15135 4.92148 4.06694L5.98803 1.87655L7.11449 4.07268C7.15766 4.1571 7.22175 4.23007 7.30114 4.2852C7.38053 4.34033 7.47281 4.37593 7.56987 4.38888L10.0924 4.73957L8.29489 6.45854Z" fill="white"/></svg>
                                        {dict.balanceLabel}
                                    </span>
                                </div>
                                <div className={s.balanceBody}>
                                    <div className={s.balanceValue}>
                                        <span className={s.amount}>{user?.bonuses ?? 0}</span>
                                        <span className={s.currency}>Б</span>
                                    </div>
                                    <div className={s.conversionTag}>1 Б = 1 ₴</div>
                                </div>
                            </div>

                            <div className={s.progressCard}>
                                <div className={s.progressTextWrapper}>
                                    <p className={s.progressDesc}>
                                        {lang === 'ru' ? (
                                            <>
                                                Для получения большего <strong>кэшбэка</strong>,<br />
                                                в размере <span className={s.whiteHighlight}>+{discountInfo?.nextDiscount ?? 4}%</span> начислений баллами,<br />
                                                необходимо совершить заказов<br />
                                                на сумму:
                                            </>
                                        ) : (
                                            <>
                                                Для отримання більшого <strong>кешбеку</strong>,<br />
                                                у розмірі <span className={s.whiteHighlight}>+{discountInfo?.nextDiscount ?? 4}%</span> нарахувань балами,<br />
                                                необхідно зробити замовлень<br />
                                                на суму:
                                            </>
                                        )}
                                    </p>
                                    <div className={s.targetAmount}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                            <path d="M9.9 12.6011H4.50001C4.26131 12.6011 4.03239 12.6959 3.86361 12.8646C3.69483 13.0334 3.60001 13.2622 3.60001 13.5009C3.60001 13.7395 3.69483 13.9684 3.86361 14.1372C4.03239 14.3059 4.26131 14.4007 4.50001 14.4007H9.9C10.1387 14.4007 10.3676 14.3059 10.5364 14.1372C10.7052 13.9684 10.8 13.7395 10.8 13.5009C10.8 13.2622 10.7052 13.0334 10.5364 12.8646C10.3676 12.6011 10.1387 12.6011 9.9 12.6011ZM6.3 7.20215H8.1C8.3387 7.20215 8.56762 7.10734 8.7364 6.93859C8.90518 6.76984 9 6.54097 9 6.30232C9 6.06368 8.90518 5.8348 8.7364 5.66605C8.56762 5.49731 8.3387 5.4025 8.1 5.4025H6.3C6.06131 5.4025 5.83239 5.49731 5.66361 5.66605C5.49483 5.8348 5.40001 6.06368 5.40001 6.30232C5.40001 6.54097 5.49483 6.76984 5.66361 6.93859C5.83239 7.10734 6.06131 7.20215 6.3 7.20215ZM17.1 9.00179H14.4V0.903398C14.4006 0.74484 14.3593 0.588931 14.2803 0.451459C14.2013 0.313986 14.0873 0.199831 13.95 0.120553C13.8132 0.0415774 13.658 0 13.5 0C13.342 0 13.1868 0.0415774 13.05 0.120553L10.35 1.66825L7.65 0.120553C7.51319 0.0415774 7.35799 0 7.2 0C7.04202 0 6.88682 0.0415774 6.75 0.120553L4.05001 1.66825L1.35001 0.120553C1.21319 0.0415774 1.05799 0 0.900007 0C0.742024 0 0.586824 0.0415774 0.450007 0.120553C0.312663 0.199831 0.19871 0.313986 0.119687 0.451459C0.0406645 0.588931 -0.000622516 0.74484 7.09459e-06 0.903398V15.3005C7.09459e-06 16.0165 0.284471 16.7031 0.790819 17.2093C1.29717 17.7156 1.98392 18 2.70001 18H15.3C16.0161 18 16.7028 17.7156 17.2092 17.2093C17.7155 16.7031 18 16.0165 18 15.3005V9.90161C18 9.66296 17.9052 9.43409 17.7364 9.26534C17.5676 9.09659 17.3387 9.00179 17.1 9.00179ZM2.70001 16.2004C2.46131 16.2004 2.23239 16.1056 2.06361 15.9368C1.89483 15.7681 1.80001 15.5392 1.80001 15.3005V2.46009L3.60001 3.48588C3.73891 3.55842 3.8933 3.5963 4.05001 3.5963C4.20672 3.5963 4.3611 3.55842 4.50001 3.48588L7.2 1.93819L9.9 3.48588C10.0389 3.55842 10.1933 3.5963 10.35 3.5963C10.5067 3.5963 10.6611 3.55842 10.8 3.48588L12.6 2.46009V15.3005C12.6024 15.6075 12.6572 15.9118 12.762 16.2004H2.70001ZM16.2 15.3005C16.2 15.5392 16.1052 15.7681 15.9364 15.9368C15.7676 16.1056 15.5387 16.2004 15.3 16.2004C15.0613 16.2004 14.8324 16.1056 14.6636 15.9368C14.4948 15.7681 14.4 15.5392 14.4 15.3005V10.8014H16.2V15.3005ZM9.9 9.00179H4.50001C4.26131 9.00179 4.03239 9.09659 3.86361 9.26534C3.69483 9.43409 3.60001 9.66296 3.60001 9.90161C3.60001 10.1403 3.69483 10.3691 3.86361 10.5379C4.03239 10.7066 4.26131 10.8014 4.50001 10.8014H9.9C10.1387 10.8014 10.3676 10.7066 10.5364 10.5379C10.7052 10.3691 10.8 10.1403 10.8 9.90161C10.8 9.66296 10.7052 9.43409 10.5364 9.26534C10.3676 9.09659 10.1387 9.00179 9.9 9.00179Z" fill="white"/>
                                        </svg>
                                        {discountInfo?.leftUntilNextStep !== undefined && discountInfo?.leftUntilNextStep !== null
                                            ? `${discountInfo.leftUntilNextStep.toLocaleString('uk-UA')} ${lang === 'ru' ? 'грн' : 'грн'}`
                                            : (lang === 'ru' ? '16 000 грн' : '16 000 грн')}
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
                                                        {isLast && <> до</>} — <span className={s.redText}>{step.percent}</span> балами <br/> від суми чеку на рахунок клієнта;
                                                    </div>
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
                    <div 
                        className={`${s.termsText} ${isExpanded ? s.expanded : ''}`}
                        dangerouslySetInnerHTML={{ __html: terms }}
                    />
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
