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
                        <h3 className={s.title}>{dict.returns.title}</h3>
                        <div className={s.content}>
                            <p>{dict.returns.text}</p>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className={s.column}>
                        <div className={s.iconWrapper}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M3 10H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M7 15H11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className={s.cardBody}>
                            <h3 className={s.title}>{dict.payment.title}</h3>
                            <div className={s.content}>
                                <ul className={s.list}>
                                    {dict.payment.items.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                                <div className={s.paymentIcons}>
                                    <div className={s.paymentIconBox}>
                                        <Image src="/icons/visa.png" alt="Visa" width={44} height={28} />
                                    </div>
                                    <div className={s.paymentIconBox}>
                                        <Image src="/icons/MC.png" alt="Mastercard" width={44} height={28} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Returnable Categories */}
                    <div className={s.column}>
                        <div className={s.iconWrapper}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                                <path d="M12 16V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 8H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className={s.cardBody}>
                            <h3 className={s.title}>{dict.returnableCategories.title}</h3>
                            <div className={s.content}>
                                <p>{dict.returnableCategories.text}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
