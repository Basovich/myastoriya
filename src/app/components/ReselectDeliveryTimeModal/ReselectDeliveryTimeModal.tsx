'use client';

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import useScrollLock from '@/hooks/useScrollLock';
import DatePicker from '@/app/components/ui/DatePicker/DatePicker';
import CustomSelect from '@/app/components/ui/CustomSelect/CustomSelect';
import Button from '@/app/components/ui/Button/Button';
import { getDeliveryTimesApi } from '@/lib/graphql';
import s from './ReselectDeliveryTimeModal.module.scss';

interface ReselectDeliveryTimeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (newDate: Date, newTime: string) => void;
    deliveryId: number;
    initialDate?: Date | null;
    lang?: 'ua' | 'ru';
}

function formatDeliveryTimesDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    
    const now = new Date();
    const isToday = date.getFullYear() === now.getFullYear() &&
                    date.getMonth() === now.getMonth() &&
                    date.getDate() === now.getDate();
                    
    if (isToday) {
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}.000000`;
    }

    return `${yyyy}-${mm}-${dd} 00:00:00.000000`;
}

function isSameDay(d1: Date | null, d2: Date | null): boolean {
    if (!d1 || !d2) return d1 === d2;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

const dict = {
    ua: {
        title: "Час доставки застарів",
        description: "Обраний раніше час доставки чи самовивозу вже не є актуальним. Будь ласка, оберіть нову дату та час.",
        dateLabel: "Дата доставки / самовивозу",
        timeLabel: "Час доставки / самовивозу",
        confirmBtn: "ЗБЕРЕГТИ ТА ПРОДОВЖИТИ",
        loadingTimes: "Завантаження часу...",
        noSlots: "На обрану дату немає доступних слотів",
    },
    ru: {
        title: "Время доставки устарело",
        description: "Выбранное ранее время доставки или самовывоза уже недействительно. Пожалуйста, выберите новую дату и время.",
        dateLabel: "Дата доставки / самовывоза",
        timeLabel: "Время доставки / самовывоза",
        confirmBtn: "СОХРАНИТЬ И ПРОДОЛЖИТЬ",
        loadingTimes: "Загрузка времени...",
        noSlots: "На выбранную дату нет доступных слотов",
    }
};

export default function ReselectDeliveryTimeModal({
    isOpen,
    onClose,
    onConfirm,
    deliveryId,
    initialDate,
    lang = 'ua',
}: ReselectDeliveryTimeModalProps) {
    const { disableScroll, enableScroll } = useScrollLock();
    const t = dict[lang];

    const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || new Date());
    const [deliveryTimes, setDeliveryTimes] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [isLoadingTimes, setIsLoadingTimes] = useState(false);

    useEffect(() => {
        if (isOpen) {
            disableScroll();
            return () => enableScroll();
        }
    }, [isOpen, disableScroll, enableScroll]);

    useEffect(() => {
        if (isOpen) {
            setSelectedDate(initialDate || new Date());
        }
    }, [isOpen, initialDate]);

    useEffect(() => {
        if (!isOpen || !deliveryId || !selectedDate) return;

        const fetchTimes = async () => {
            setIsLoadingTimes(true);
            try {
                const formattedDate = formatDeliveryTimesDate(selectedDate);
                const times = await getDeliveryTimesApi(deliveryId, formattedDate, lang);
                
                if (times.length > 0) {
                    setDeliveryTimes(times);
                    setSelectedTime(times[0]);
                } else {
                    setDeliveryTimes([]);
                    setSelectedTime('');
                    if (isSameDay(selectedDate, new Date())) {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setSelectedDate(tomorrow);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch delivery times in modal:', e);
                setDeliveryTimes([]);
                setSelectedTime('');
            } finally {
                setIsLoadingTimes(false);
            }
        };

        fetchTimes();
    }, [isOpen, deliveryId, selectedDate, lang]);

    const handleConfirm = () => {
        if (selectedDate && selectedTime) {
            onConfirm(selectedDate, selectedTime);
            onClose();
        }
    };

    const timeOptions = deliveryTimes.map(t => ({ value: t, label: t }));

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className={{
                base: s.modalWrapper,
                afterOpen: s.modalWrapperOpen,
                beforeClose: s.modalWrapperBeforeClose
            }}
            overlayClassName={{
                base: s.overlay,
                afterOpen: s.overlayAfterOpen,
                beforeClose: s.overlayBeforeClose
            }}
            ariaHideApp={false}
            closeTimeoutMS={200}
        >
            <div className={s.modal}>
                <button 
                    className={s.closeBtn} 
                    onClick={onClose} 
                    aria-label="Закрити"
                    type="button"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M11.7625 9.99893L19.6326 2.14129C19.8678 1.90606 20 1.58701 20 1.25434C20 0.921668 19.8678 0.602622 19.6326 0.367388C19.3974 0.132153 19.0783 0 18.7457 0C18.413 0 18.0939 0.132153 17.8587 0.367388L10.0011 8.23752L2.14342 0.367388C1.90819 0.132153 1.58914 2.95361e-07 1.25647 2.97839e-07C0.9238 3.00318e-07 0.604754 0.132153 0.369519 0.367388C0.134285 0.602622 0.00213223 0.921668 0.00213223 1.25434C0.00213223 1.58701 0.134285 1.90606 0.369519 2.14129L8.23966 9.99893L0.369519 17.8566C0.252431 17.9727 0.159496 18.1109 0.0960746 18.2631C0.0326529 18.4153 0 18.5786 0 18.7435C0 18.9084 0.0326529 19.0717 0.0960746 19.224C0.159496 19.3762 0.252431 19.5143 0.369519 19.6305C0.485651 19.7476 0.623817 19.8405 0.776047 19.9039C0.928277 19.9673 1.09156 20 1.25647 20C1.42138 20 1.58467 19.9673 1.7369 19.9039C1.88913 19.8405 2.02729 19.7476 2.14342 19.6305L10.0011 11.7603L17.8587 19.6305C17.9748 19.7476 18.113 19.8405 18.2652 19.9039C18.4175 19.9673 18.5807 20 18.7457 20C18.9106 20 19.0739 19.9673 19.2261 19.9039C19.3783 19.8405 19.5165 19.7476 19.6326 19.6305C19.7497 19.5143 19.8426 19.3762 19.9061 19.224C19.9695 19.0717 20.0021 18.9084 20.0021 18.7435C20.0021 18.5786 19.9695 18.4153 19.9061 18.2631C19.8426 18.1109 19.7497 17.9727 19.6326 17.8566L11.7625 9.99893Z" fill="currentColor" />
                    </svg>
                </button>

                <div className={s.header}>
                    <div className={s.iconWrapper}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E3051B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <h2 className={s.title}>{t.title}</h2>
                    <p className={s.description}>{t.description}</p>
                </div>

                <div className={s.formSection}>
                    <div className={s.fieldGroup}>
                        <label className={s.fieldLabel}>{t.dateLabel}</label>
                        <DatePicker 
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            minDate={new Date()}
                            hideLabel={true}
                            lang={lang}
                        />
                    </div>

                    <div className={s.fieldGroup}>
                        <label className={s.fieldLabel}>{t.timeLabel}</label>
                        {isLoadingTimes ? (
                            <div className={s.noSlotsWarning}>{t.loadingTimes}</div>
                        ) : timeOptions.length > 0 ? (
                            <CustomSelect 
                                options={timeOptions}
                                value={selectedTime}
                                onChange={setSelectedTime}
                                className={s.timeSelect}
                            />
                        ) : (
                            <div className={s.noSlotsWarning}>{t.noSlots}</div>
                        )}
                    </div>
                </div>

                <div className={s.actions}>
                    <Button
                        variant="red"
                        onClick={handleConfirm}
                        className={s.submitBtn}
                        disabled={isLoadingTimes || !selectedTime}
                    >
                        {t.confirmBtn}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
