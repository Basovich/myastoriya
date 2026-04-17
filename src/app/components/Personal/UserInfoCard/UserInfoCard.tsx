import React, { useRef, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { updateUserAvatarApi } from '@/lib/graphql/queries/auth';
import { getAccessToken } from '@/app/actions/authActions';
import s from './UserInfoCard.module.scss';
import { AuthUser } from '@/store/slices/authSlice';

interface UserInfoCardProps {
    user: AuthUser | null;
}

export default function UserInfoCard({ user }: UserInfoCardProps) {
    const dispatch = useAppDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fullName = user ? `${user.surname || ''} ${user.name || ''} ${user.middleName || ''}`.trim() : 'Гість';
    const displayName = fullName || user?.email || 'Користувач';

    const avatarUrl = user?.avatar?.size2x || user?.avatar?.size1x || '/icons/icon-profile.svg';

    const handleEditClick = () => {
        if (!user) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.value ? event.target.files?.[0] : null;
        if (!file || !user) return;

        // Simple validation
        if (!file.type.startsWith('image/')) {
            alert('Будь ласка, оберіть зображення');
            return;
        }

        try {
            setIsUploading(true);
            const token = await getAccessToken();
            if (!token) throw new Error('Unauthorized');

            const updatedUser = await updateUserAvatarApi(file, token);
            
            // Merge updated avatar into current user state
            dispatch(setUser({
                ...user,
                avatar: updatedUser.avatar,
            }));
        } catch (error) {
            console.error('Failed to update avatar:', error);
            alert('Помилка при завантаженні фото');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className={s.userInfoCard}>
            <div className={s.avatarWrapper}>
                <div 
                    className={clsx(s.avatar, isUploading && s.loading)}
                    onClick={handleEditClick}
                    role="button"
                    tabIndex={0}
                    aria-label="Змінити фото"
                >
                    <Image 
                        src={avatarUrl} 
                        alt="User Avatar" 
                        width={88} 
                        height={88}
                        className={s.avatarImage}
                        unoptimized={!!user?.avatar}
                    />
                </div>
                {user && (
                    <button 
                        className={s.editPhoto} 
                        aria-label="Змінити фото" 
                        onClick={handleEditClick}
                        disabled={isUploading}
                    >
                        <img src="/icons/icon-plus.svg" alt="" />
                    </button>
                )}
                <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
            </div>
            <div className={s.info}>
                <h3 className={s.name}>{displayName}</h3>
            </div>
        </div>
    );
}
