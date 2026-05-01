'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppSelector } from '@/store/hooks';
import clsx from 'clsx';
import s from './AuthButton.module.scss';
import AuthModal from '@/app/components/AuthModal';
import { useIsHydrated } from '@/hooks/useIsHydrated';

export default function AuthButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const { user, isAuthenticated, isGuest } = useAppSelector((state) => state.auth);
    const hydrated = useIsHydrated();

    const isReallyLoggedIn = hydrated && isAuthenticated && !isGuest;
    const firstLetter = user?.email?.charAt(0)?.toUpperCase() || '?';

    const handleAuthClick = () => {
        if (isReallyLoggedIn) {
            router.push('/personal/profile/');
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <button
                className={clsx(s.authBtn, isReallyLoggedIn && s.loggedIn)}
                onClick={handleAuthClick}
                aria-label={isReallyLoggedIn ? 'Профіль' : 'Вхід'}
            >
                {isReallyLoggedIn ? (
                    <Image src="/icons/icon-profile.svg" alt="Profile" width={20} height={20} className={s.icon} />
                ) : (
                    <>
                        <span className={s.label}>
                            {isReallyLoggedIn ? firstLetter : 'Вхід'}
                        </span>
                        <Image src="/icons/icon-profile.svg" alt="Profile" width={20} height={20} className={s.icon} />
                    </>
                )}
            </button>

            <AuthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
