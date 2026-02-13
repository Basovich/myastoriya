"use client";

import { useState, useEffect } from "react";
import styles from "./PasswordGate.module.scss";

const CORRECT_PASSWORD = "7535";
const STORAGE_KEY = "myastoriya_auth";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved === "true") {
            setIsAuthorized(true);
        }
        setIsChecking(false);
    }, []);

    const handleSubmit = () => {
        const input = prompt("Введіть пароль для доступу до сайту:");
        if (input === CORRECT_PASSWORD) {
            sessionStorage.setItem(STORAGE_KEY, "true");
            setIsAuthorized(true);
        } else if (input !== null) {
            alert("Невірний пароль!");
        }
    };

    if (isChecking) return null;

    if (!isAuthorized) {
        return (
            <div className={styles.gate}>
                <div className={styles.gateContent}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--color-accent)">
                        <path d="M12 2C8.5 2 6 4.5 6 7.5c0 2 1 3.5 2.5 4.5L10 21h4l1.5-9C17 11 18 9.5 18 7.5 18 4.5 15.5 2 12 2z" />
                    </svg>
                    <h1 className={styles.gateTitle}>М&apos;ЯСТОРІЯ</h1>
                    <p className={styles.gateText}>Для доступу до сайту введіть пароль</p>
                    <button className={styles.gateBtn} onClick={handleSubmit}>
                        ВВЕСТИ ПАРОЛЬ
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
