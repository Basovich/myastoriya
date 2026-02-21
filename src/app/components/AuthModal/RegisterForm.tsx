'use client';

import { useState, useRef, FormEvent, KeyboardEvent } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import s from './AuthModal.module.scss';

const VERIFICATION_CODE = '7535'; // Stub code

// Stub API functions — ready for real API integration
async function registerAPI(data: { name: string; phone: string; password: string }) {
    // TODO: Replace with actual API call
    // Example: const res = await fetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            if (data.phone && data.password) {
                resolve();
            } else {
                reject(new Error('Заповніть усі поля'));
            }
        }, 500);
    });
}

async function sendVerificationCode(phone: string) {
    // TODO: Replace with actual API call
    // Example: const res = await fetch('/api/auth/send-code', { method: 'POST', body: JSON.stringify({ phone }) });
    return new Promise<void>((resolve) => {
        setTimeout(resolve, 300);
    });
}

async function verifyCode(phone: string, code: string) {
    // TODO: Replace with actual API call
    // Example: const res = await fetch('/api/auth/verify-code', { method: 'POST', body: JSON.stringify({ phone, code }) });
    return new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(code === VERIFICATION_CODE), 300);
    });
}

interface RegisterFormProps {
    onSwitchToLogin: () => void;
    onSuccess: () => void;
}

type Step = 'form' | 'verify';

export default function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
    const dispatch = useAppDispatch();
    const [step, setStep] = useState<Step>('form');

    // Form fields
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Verification code
    const [code, setCode] = useState(['', '', '', '']);
    const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Паролі не збігаються');
            return;
        }

        setLoading(true);

        try {
            await registerAPI({ name, phone, password });
            await sendVerificationCode(phone);
            setStep('verify');
        } catch (err: any) {
            setError(err.message || 'Помилка реєстрації');
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 3) {
            codeRefs.current[index + 1]?.focus();
        }
    };

    const handleCodeKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            codeRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        setError('');
        setLoading(true);
        const fullCode = code.join('');

        try {
            const isValid = await verifyCode(phone, fullCode);
            if (isValid) {
                dispatch(login({ email: `${phone.replace(/\D/g, '').slice(-4)}@myastoriya.ua`, phone, name }));
                onSuccess();
            } else {
                setError('Невірний код. Спробуйте ще раз.');
                setCode(['', '', '', '']);
                codeRefs.current[0]?.focus();
            }
        } catch (err: any) {
            setError(err.message || 'Помилка перевірки');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        await sendVerificationCode(phone);
        setCode(['', '', '', '']);
        codeRefs.current[0]?.focus();
    };

    if (step === 'verify') {
        return (
            <div className={s.verifySection}>
                <h2 className={s.title}>Підтвердження</h2>
                <p className={s.verifyText}>
                    Ми надіслали SMS-код на номер<br />
                    <strong>{phone}</strong>
                </p>

                <div className={s.codeInputGroup}>
                    {code.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => { codeRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className={s.codeInput}
                            value={digit}
                            onChange={(e) => handleCodeChange(i, e.target.value)}
                            onKeyDown={(e) => handleCodeKeyDown(i, e)}
                            autoFocus={i === 0}
                        />
                    ))}
                </div>

                {error && <div className={s.error}>{error}</div>}

                <button
                    type="button"
                    className={s.submitBtn}
                    onClick={handleVerify}
                    disabled={loading || code.some((d) => !d)}
                >
                    {loading ? 'Перевірка...' : 'ПІДТВЕРДИТИ'}
                </button>

                <button type="button" className={s.resendLink} onClick={handleResend}>
                    Надіслати код повторно
                </button>
            </div>
        );
    }

    return (
        <>
            <h2 className={s.title}>Реєстрація в кабінеті</h2>
            <form className={s.form} onSubmit={handleFormSubmit}>
                <div className={s.field}>
                    <input
                        type="text"
                        className={s.input}
                        placeholder="Ім'я"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <label className={s.inputLabel}>Ім&apos;я*</label>
                </div>

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

                <div className={s.field}>
                    <input
                        type="password"
                        className={s.input}
                        placeholder="Повторити пароль"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <label className={s.inputLabel}>Повторити пароль*</label>
                </div>

                {error && <div className={s.error}>{error}</div>}

                <button type="submit" className={s.submitBtn} disabled={loading}>
                    {loading ? 'Зачекайте...' : 'ЗАРЕЄСТРУВАТИСЬ'}
                </button>

                <div className={s.switchText}>
                    <button type="button" className={s.switchLink} onClick={onSwitchToLogin}>
                        Вхід
                    </button>
                </div>

                <button type="button" className={s.googleBtn}>
                    <span className={s.googleIcon}>G</span>
                    РЕЄСТРАЦІЯ ЧЕРЕЗ GOOGLE
                </button>
            </form>
        </>
    );
}
