'use client';

import { useState } from "react";

export default function ToggleMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <button className="mobile-menu" onClick={toggleMenu} aria-label="Меню">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="0.7" y="0.7" width="6.7" height="6.7" rx="1.3" stroke="white" strokeWidth="1.4" />
                <rect x="10.6004" y="0.7" width="6.7" height="6.7" rx="1.3" stroke="white" strokeWidth="1.4" />
                <rect x="0.7" y="10.5999" width="6.7" height="6.7" rx="1.3" stroke="white" strokeWidth="1.4" />
                <rect x="10.6004" y="10.5999" width="6.7" height="6.7" rx="1.3" stroke="white" strokeWidth="1.4" />
            </svg>
        </button>
    );
}