'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAppSelector } from '@/store/hooks';
import s from './AuthButton.module.scss';
import AuthModal from '@/app/components/AuthModal';

export default function AuthButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);

    const firstLetter = user?.email?.charAt(0)?.toUpperCase() || '?';

    return (
        <>
            <button
                className={`${s.authBtn} ${isAuthenticated ? s.loggedIn : ''}`}
                onClick={() => setIsModalOpen(true)}
                aria-label={isAuthenticated ? 'Профіль' : 'Вхід'}
            >
                {isAuthenticated ? (
                    <span className={s.avatar}>{firstLetter}</span>
                ) : (
                    <>
                        <span className={s.label}>
                            {isAuthenticated ? firstLetter : 'Вхід'}
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
