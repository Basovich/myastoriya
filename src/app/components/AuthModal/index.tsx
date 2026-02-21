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
        setTimeout(() => setView('login'), 300);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            className={s.modalWrapper}
            overlayClassName={s.overlay}
            ariaHideApp={false}
            closeTimeoutMS={200}
        >
            {/* Close button — positioned OUTSIDE the white card */}
            <button className={s.closeBtn} onClick={handleClose} aria-label="Закрити">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            {/* Modal card */}
            <div className={s.modal}>
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
            </div>
        </Modal>
    );
}
