'use client';

import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import s from './Profile.module.scss';

export default function ProfilePage() {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);

    if (!isAuthenticated) {
        return (
            <div className={s.profileContainer}>
                <div className={s.notAuthenticated}>
                    <h1 className={s.title}>Особистий кабінет</h1>
                    <p>Будь ласка, увійдіть, щоб переглянути свій профіль.</p>
                    <Link href="/" className={s.loginBtn}>
                        На головну
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={s.profileContainer}>
            <h1 className={s.title}>Особистий кабінет</h1>
            <div className={s.content}>
                <div className={s.userInfo}>
                    <div className={s.infoRow}>
                        <span className={s.label}>Ім&apos;я:</span>
                        <span className={s.value}>{user?.name || 'Не вказано'}</span>
                    </div>
                    <div className={s.infoRow}>
                        <span className={s.label}>Телефон:</span>
                        <span className={s.value}>{user?.phone}</span>
                    </div>
                    <div className={s.infoRow}>
                        <span className={s.label}>Email:</span>
                        <span className={s.value}>{user?.email}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
