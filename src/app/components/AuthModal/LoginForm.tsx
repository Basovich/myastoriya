'use client';

import { useState, FormEvent } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import s from './AuthModal.module.scss';

// Stub API function — ready for real API integration
async function loginAPI(phone: string, password: string) {
    // TODO: Replace with actual API call
    // Example: const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) });
    return new Promise<{ email: string; phone: string; name: string }>((resolve, reject) => {
        setTimeout(() => {
            // Stub: accept any credentials for now
            if (phone && password) {
                resolve({
                    email: `${phone.replace(/\D/g, '').slice(-4)}@myastoriya.ua`,
                    phone,
                    name: 'Користувач',
                });
            } else {
                reject(new Error('Невірний телефон або пароль'));
            }
        }, 500);
    });
}

interface LoginFormProps {
    onSwitchToRegister: () => void;
    onSuccess: () => void;
}

export default function LoginForm({ onSwitchToRegister, onSuccess }: LoginFormProps) {
    const dispatch = useAppDispatch();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await loginAPI(phone, password);
            dispatch(login(user));
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Помилка входу');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h2 className={s.title}>Вхід до кабінету</h2>
            <form className={s.form} onSubmit={handleSubmit}>
                <div className={s.field}>
                    <input
                        type="tel"
                        className={s.input}
                        placeholder="Телефон"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                    <label className={s.inputLabel}>Телефон*</label>
                </div>

                <div className={s.field}>
                    <input
                        type="password"
                        className={s.input}
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label className={s.inputLabel}>Пароль*</label>
                </div>

                <a href="#" className={s.forgotLink}>Забули пароль?</a>

                {error && <div className={s.error}>{error}</div>}

                <button type="submit" className={s.submitBtn} disabled={loading}>
                    {loading ? 'Зачекайте...' : 'УВІЙТИ'}
                </button>

                <div className={s.switchText}>
                    <button type="button" className={s.switchLink} onClick={onSwitchToRegister}>
                        Пройти реєстрацію
                    </button>
                </div>

                <div className={s.divider}>або</div>

                <button type="button" className={s.googleBtn}>
                    <span className={s.googleIcon}>G</span>
                    УВІЙТИ ЧЕРЕЗ GOOGLE
                </button>
            </form>
        </>
    );
}
