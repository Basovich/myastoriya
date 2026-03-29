'use client';

import React, { useState, useRef, useEffect } from 'react';
import anime from 'animejs';
import s from './DeliveryAccordion.module.scss';
import clsx from 'clsx';

interface DeliveryItem {
    icon: React.ReactNode;
    title: string;
    content: React.ReactNode;
}

interface DeliveryAccordionProps {
    items: DeliveryItem[];
    className?: string;
}

function DeliveryItemComponent({ item }: { item: DeliveryItem }) {
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
        <div className={clsx(s.deliveryItem, isOpen && s.isOpen)}>
            <button 
                className={s.deliveryTitle} 
                onClick={toggleOpen}
                aria-expanded={isOpen}
            >
                <div className={s.titleContent}>
                    <div className={s.iconBox}>
                        {item.icon}
                    </div>
                    <span>{item.title}</span>
                </div>
                <span className={s.arrowWrap}>
                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </span>
            </button>
            <div 
                ref={contentRef}
                className={s.contentWrap}
                style={{ height: 0, overflow: 'hidden' }}
            >
                <div className={s.contentInner}>
                    {item.content}
                </div>
            </div>
        </div>
    );
}

export default function DeliveryAccordion({ items, className = '' }: DeliveryAccordionProps) {
    return (
        <div className={clsx(s.accordionWrap, className)}>
            {items.map((item, index) => (
                <DeliveryItemComponent key={index} item={item} />
            ))}
        </div>
    );
}
