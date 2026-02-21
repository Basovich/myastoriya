'use client';

import { useState } from 'react';
import Modal from 'react-modal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import s from './AuthModal.module.scss';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ModalView = 'login' | 'register';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [view, setView] = useState<ModalView>('login');

    const handleClose = () => {
        onClose();
        // Reset to login view after short delay so transition looks clean
        setTimeout(() => setView('login'), 300);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            className={s.modal}
            overlayClassName={s.overlay}
            ariaHideApp={false}
            closeTimeoutMS={200}
        >
            <button className={s.closeBtn} onClick={handleClose} aria-label="Закрити">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            {view === 'login' ? (
                <LoginForm
                    onSwitchToRegister={() => setView('register')}
                    onSuccess={handleClose}
                />
            ) : (
                <RegisterForm
                    onSwitchToLogin={() => setView('login')}
                    onSuccess={handleClose}
                />
            )}
        </Modal>
    );
}
