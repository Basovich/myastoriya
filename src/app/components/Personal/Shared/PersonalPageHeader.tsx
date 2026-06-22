'use client';

import React from 'react';
import SectionHeader from '@/app/components/ui/SectionHeader/SectionHeader';
import Button from '@/app/components/ui/Button/Button';
import PersonalNav from '../PersonalNav/PersonalNav';
import { AuthUser } from '@/store/slices/authSlice';
import s from '@/app/[lang]/personal/PersonalLayout.module.scss';
import clsx from 'clsx';

interface PersonalPageHeaderProps {
    title: React.ReactNode;
    logoutLabel: string;
    onLogout: () => void;
    user: AuthUser | null;
    navDict: any;
    isDark?: boolean;
    withDots?: boolean;
}

export default function PersonalPageHeader({ 
    title, 
    logoutLabel, 
    onLogout, 
    user,
    navDict,
    isDark = false,
    withDots = true
}: PersonalPageHeaderProps) {
    const LogoutIcon = () => (
        <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.17676 0.100586C8.26956 0.100693 9.9072 1.78414 9.90723 3.83105C9.90723 5.878 8.26958 7.56239 6.17676 7.5625C4.12732 7.5625 2.49023 5.87725 2.49023 3.83105C2.49026 1.78488 4.12734 0.100586 6.17676 0.100586ZM6.17676 1.05273C4.68119 1.05273 3.39847 2.29325 3.39844 3.83105C3.39844 5.36889 4.68117 6.60938 6.17676 6.60938C7.71553 6.60927 8.95508 5.36982 8.95508 3.83105C8.95505 2.29232 7.71552 1.05284 6.17676 1.05273Z" fill={isDark ? "white" : "black"} stroke={isDark ? "white" : "black"} strokeWidth="0.2"/>
            <path d="M3.4502 7.77148C3.55397 7.73694 3.67352 7.73604 3.79102 7.81934L3.79199 7.81836C4.52907 8.25193 5.3531 8.46869 6.17676 8.46875C6.3348 8.46875 6.46194 8.52585 6.54883 8.61816C6.63434 8.70904 6.67576 8.82836 6.67578 8.94531C6.67578 9.06226 6.6343 9.18157 6.54883 9.27246C6.46194 9.36477 6.3348 9.42188 6.17676 9.42188C5.29484 9.42182 4.37023 9.20478 3.56934 8.77246C2.14936 9.62724 1.22354 11.0871 1.06348 12.7197H11.335C11.1714 10.984 10.1428 9.46603 8.61035 8.65723V8.65625C8.47628 8.58849 8.39558 8.48359 8.36621 8.36426C8.33744 8.24704 8.35902 8.12481 8.41309 8.02344C8.46719 7.92204 8.55675 7.83531 8.66992 7.79102C8.78549 7.74587 8.92034 7.74779 9.05566 7.81543L9.05762 7.81641C11.0387 8.85207 12.2987 10.9228 12.2988 13.1738C12.2988 13.4504 12.0774 13.6728 11.8008 13.6729H0.597656C0.328898 13.6728 0.0998578 13.4583 0.0996094 13.2188C0.0996094 11.0159 1.26713 8.99171 3.19922 7.91016C3.26041 7.86936 3.35137 7.80443 3.4502 7.77148Z" fill={isDark ? "white" : "black"} stroke={isDark ? "white" : "black"} strokeWidth="0.2"/>
        </svg>
    );

    return (
        <>
            <div className={s.mobilePageHeader}>
                <div className={s.mobileTitleRow}>
                    <SectionHeader title={title} isDark={isDark} withDots={withDots} />
                    <Button variant="outline-black" className={clsx(s.logoutBtn, isDark && s.dark)} onClick={onLogout}>
                        <span>{logoutLabel}</span>
                        <LogoutIcon />
                    </Button>
                </div>
            </div>
            
            <div className={s.mobileNavTrigger}>
                <PersonalNav
                    dict={navDict} 
                    onLogout={onLogout} 
                    user={user}
                    isMobileOnly={true}
                />
            </div>

            <div className={s.desktopPageHeader}>
                <div className={s.desktopTitleRow}>
                    <SectionHeader title={title} isDark={isDark} withDots={withDots} />
                    <Button variant="outline-black" className={clsx(s.logoutBtn, isDark && s.dark)} onClick={onLogout}>
                        <span>{logoutLabel}</span>
                        <LogoutIcon />
                    </Button>
                </div>
            </div>
        </>
    );
}
