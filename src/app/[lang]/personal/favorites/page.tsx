'use client';

import { useAppSelector } from '@/store/hooks';

export default function FavoritesPage() {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const wishlistItems = useAppSelector((state) => state.wishlist.items);

    if (!isAuthenticated) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <h1>Обране</h1>
                <p>Будь ласка, увійдіть, щоб переглянути список обраного.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '60px 20px' }}>
            <h1>Обране</h1>
            {wishlistItems.length === 0 ? (
                <p>Ви ще не додали жодного товару до обраного.</p>
            ) : (
                <ul>
                    {wishlistItems.map((id) => (
                        <li key={id}>Товар ID: {id}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}
