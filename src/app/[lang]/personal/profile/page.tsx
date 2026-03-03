'use client';

import { useAppSelector } from '@/store/hooks';
import s from './Profile.module.scss';

export default function ProfilePage() {
    const { user } = useAppSelector((state) => state.auth);

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
