import React from 'react';
import Image from 'next/image';
import s from './UserInfoCard.module.scss';
import { AuthUser } from '@/store/slices/authSlice';

interface UserInfoCardProps {
    user: AuthUser | null;
}

export default function UserInfoCard({ user }: UserInfoCardProps) {
    const fullName = user ? `${user.surname || ''} ${user.name || ''} ${user.middleName || ''}`.trim() : 'Гість';
    const displayName = fullName || user?.email || 'Користувач';

    return (
        <div className={s.userInfoCard}>
            <div className={s.avatarWrapper}>
                <div className={s.avatar}>
                    <Image 
                        src="/icons/icon-profile.svg" 
                        alt="User Avatar" 
                        width={48} 
                        height={48}
                        className={s.avatarPlaceholder}
                    />
                </div>
                <button className={s.editPhoto} aria-label="Змінити фото">
                    <img src="/icons/icon-plus.svg" alt="" />
                </button>
            </div>
            <div className={s.info}>
                <h3 className={s.name}>{displayName}</h3>
            </div>
        </div>
    );
}
