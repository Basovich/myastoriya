"use client";

import { useEffect, useState } from "react";
import s from "./CountdownTimer.module.scss";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface CountdownTimerProps {
    targetDate: string; // format: "DD.MM.YYYY"
    labelDays: string;
    labelHours: string;
    labelMinutes: string;
    labelSeconds: string;
    label: string;
}

function parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split(".").map(Number);
    // End of the target day (23:59:59)
    return new Date(year, month - 1, day, 23, 59, 59);
}

function getTimeLeft(targetDate: Date): TimeLeft {
    const now = Date.now();
    const diff = targetDate.getTime() - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
}

export default function CountdownTimer({
    targetDate,
    label,
    labelDays,
    labelHours,
    labelMinutes,
    labelSeconds,
}: CountdownTimerProps) {
    const parsed = parseDate(targetDate);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(parsed));

    useEffect(() => {
        const id = setInterval(() => {
            setTimeLeft(getTimeLeft(parsed));
        }, 1000);
        return () => clearInterval(id);
    }, [targetDate]);

    const pad = (n: number) => String(n).padStart(2, "0");

    return (
        <div className={s.wrapper}>
            <div className={s.label}>{label}</div>
            <div className={s.values}>
                <div className={s.item}>
                    <span className={s.number}>{pad(timeLeft.days)}</span>
                    <span className={s.unit}>{labelDays}</span>
                </div>
                <span className={s.separator}>:</span>
                <div className={s.item}>
                    <span className={s.number}>{pad(timeLeft.hours)}</span>
                    <span className={s.unit}>{labelHours}</span>
                </div>
                <span className={s.separator}>:</span>
                <div className={s.item}>
                    <span className={s.number}>{pad(timeLeft.minutes)}</span>
                    <span className={s.unit}>{labelMinutes}</span>
                </div>
                <span className={s.separator}>:</span>
                <div className={s.item}>
                    <span className={s.number}>{pad(timeLeft.seconds)}</span>
                    <span className={s.unit}>{labelSeconds}</span>
                </div>
            </div>
        </div>
    );
}
