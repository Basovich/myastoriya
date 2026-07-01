'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useAppSelector } from '@/store/hooks';
import clsx from 'clsx';
import s from './AuthButton.module.scss';
import AuthModal from '@/app/components/AuthModal';
import { useIsHydrated } from '@/hooks/useIsHydrated';

function AuthButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const lang = params?.lang as string || 'ua';

    const { user, isAuthenticated, isGuest } = useAppSelector((state) => state.auth);
    const hydrated = useIsHydrated();

    const isReallyLoggedIn = hydrated && isAuthenticated && !isGuest;



    const handleAuthClick = () => {
        if (isReallyLoggedIn) {
            const prefix = lang === 'ua' ? '' : `/${lang}`;
            router.push(`${prefix}/personal/profile/`);
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <button
                className={clsx(s.authBtn, isReallyLoggedIn && s.loggedIn)}
                onClick={handleAuthClick}
                aria-label={isReallyLoggedIn ? (lang === 'ru' ? 'Профиль' : 'Профіль') : (lang === 'ru' ? 'Вход' : 'Вхід')}
            >
                {isReallyLoggedIn ? (
                    <Image src="/icons/icon-profile.svg" alt="Profile" width={20} height={20} className={s.icon} />
                ) : (
                    <>
                        <span className={s.label}>
                            {lang === 'ru' ? 'Вход' : 'Вхід'}
                        </span>
                        <Image src="/icons/icon-profile.svg" alt="Profile" width={20} height={20} className={s.icon} />
                    </>
                )}
            </button>

            <AuthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    const prefix = lang === 'ua' ? '' : `/${lang}`;
                    router.push(`${prefix}/personal/profile/`);
                }}
            />
        </>
    );
}

export default AuthButton;
