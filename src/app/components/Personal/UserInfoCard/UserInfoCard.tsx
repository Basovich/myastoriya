import React, { useRef, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { updateUserAvatarApi, resolveAvatarUrl } from '@/lib/graphql/queries/auth';
import { getAccessToken } from '@/app/actions/authActions';
import s from './UserInfoCard.module.scss';
import { AuthUser } from '@/store/slices/authSlice';
import * as Sentry from '@sentry/nextjs';

interface UserInfoCardProps {
    user: AuthUser | null;
}

export default function UserInfoCard({ user }: UserInfoCardProps) {
    const dispatch = useAppDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fullName = user ? `${user.surname || ''} ${user.name || ''} ${user.middleName || ''}`.trim() : 'Гість';
    const displayName = fullName || user?.email || 'Користувач';

    const avatarSrc = resolveAvatarUrl(user?.avatar) || '/icons/icon-profile.svg';

    const handleEditClick = () => {
        if (!user) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        // Size limit: 2 MB
        const MAX_SIZE = 2 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            alert('Максимальний розмір файлу — 2 МБ');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // Format validation
        if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.heic') && !file.name.toLowerCase().endsWith('.heif')) {
            alert('Будь ласка, оберіть зображення (JPG, PNG, WebP, HEIC)');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        try {
            setIsUploading(true);
            const token = await getAccessToken();
            if (!token) {
                const err = new Error('Unauthorized');
                Sentry.captureException(err, { tags: { category: 'profile', action: 'update_avatar_unauthorized' } });
                alert('Помилка при завантаженні фото: Неавторизовано');
                return;
            }

            const updatedUser = await updateUserAvatarApi(file, token);
            
            // Merge updated avatar into current user state
            dispatch(setUser({
                ...user,
                avatar: updatedUser.avatar,
            }));
        } catch (error) {
            console.error('Failed to update avatar:', error);
            Sentry.captureException(error, {
                tags: { category: 'profile', action: 'update_avatar' },
            });
            alert('Помилка при завантаженні фото');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className={s.wrapper}>
            <div className={s.avatarWrapper}>
                <div className={clsx(s.avatar, isUploading && s.avatarUploading)}>
                    <Image 
                        src={avatarSrc} 
                        alt={fullName} 
                        fill
                        sizes="92px"
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                </div>
                {user && (
                    <button 
                        className={s.editPhoto} 
                        aria-label="Змінити фото" 
                        onClick={handleEditClick}
                        disabled={isUploading}
                    >
                        <Image src="/icons/icon-plus.svg" alt="" width={16} height={16} />
                    </button>
                )}
            </div>
            <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.heic,.heif"
                style={{ display: 'none' }}
            />
            <div className={s.info}>
                <h3 className={s.name}>{displayName}</h3>
            </div>
        </div>
    );
}
