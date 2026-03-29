import React from 'react';
import s from './PolicySections.module.scss';
import { DeliveryPageDict } from '@/i18n/types';
import Image from 'next/image';

interface PolicySectionsProps {
    dict: DeliveryPageDict['policies'];
}

export default function PolicySections({ dict }: PolicySectionsProps) {
    return (
        <section className={s.policySection}>
            <div className={s.container}>
                <div className={s.grid}>
                    {/* Returns Terms */}
                    <div className={s.column}>
                        <div className={s.iconTitle}>
                            <div className={s.iconWrapper}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#E30613" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 8V12L15 15" stroke="#E30613" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3 className={s.title}>{dict.returns.title}</h3>
                        </div>
                        <div className={s.content}>
                            <p>{dict.returns.text}</p>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className={s.column}>
                        <div className={s.iconTitle}>
                            <div className={s.iconWrapper}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke="#E30613" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M1 10H23" stroke="#E30613" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3 className={s.title}>{dict.payment.title}</h3>
                        </div>
                        <div className={s.content}>
                            <ul className={s.list}>
                                {dict.payment.items.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                            <div className={s.paymentIcons}>
                                <Image src="/icons/visa.png" alt="Visa" width={44} height={28} />
                                <Image src="/icons/MC.png" alt="Mastercard" width={44} height={28} />
                            </div>
                        </div>
                    </div>

                    {/* Returnable Categories */}
                    <div className={s.column}>
                        <div className={s.iconTitle}>
                            <div className={s.iconWrapper}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#E30613" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2 17L12 22L22 17" stroke="#E30613" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2 12L12 17L22 12" stroke="#E30613" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3 className={s.title}>{dict.returnableCategories.title}</h3>
                        </div>
                        <div className={s.content}>
                            <p>{dict.returnableCategories.text}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
