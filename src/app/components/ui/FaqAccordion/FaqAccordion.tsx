'use client';

import React, { useState, useRef, useEffect } from 'react';
import anime from 'animejs';
import s from './FaqAccordion.module.scss';

interface FaqItem {
    question: string;
    answer: string;
}

interface FaqAccordionProps {
    items: FaqItem[];
    className?: string;
}

function FaqItemComponent({ item }: { item: FaqItem }) {
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (!contentRef.current) return;
        
        anime({
            targets: contentRef.current,
            height: isOpen ? contentRef.current.scrollHeight : 0,
            duration: 350,
            easing: 'easeInOutQuad'
        });
    }, [isOpen]);

    return (
        <div className={`${s.faqItem} ${isOpen ? s.isOpen : ''}`}>
            <button 
                className={s.faqQuestion} 
                onClick={toggleOpen}
                aria-expanded={isOpen}
            >
                <span>{item.question}</span>
                <span className={s.iconWrap}>
                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </span>
            </button>
            <div 
                ref={contentRef}
                className={s.faqAnswerWrap}
                style={{ height: 0, overflow: 'hidden' }}
            >
                <div className={s.faqAnswerInner}>
                    {item.answer}
                </div>
            </div>
        </div>
    );
}

export default function FaqAccordion({ items, className = '' }: FaqAccordionProps) {
    return (
        <div className={`${s.faqWrap} ${className}`}>
            {items.map((item, index) => (
                <FaqItemComponent key={index} item={item} />
            ))}
        </div>
    );
}
