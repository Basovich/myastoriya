import React from 'react';
import s from './PolicySections.module.scss';
import Image from 'next/image';
import { OrderingInfoBlock } from '@/lib/graphql/index';

interface PolicySectionsProps {
    blocks: OrderingInfoBlock[];
}

export default function PolicySections({ blocks }: PolicySectionsProps) {
    if (!blocks || blocks.length === 0) return null;

    return (
        <section className={s.policySection}>
            <div className={s.container}>
                <div className={s.grid}>
                    {blocks.map((block, index) => {
                        const isPaymentMethod = block.name === "Спосіб оплати" || block.name === "Способы оплаты" || index === 1;

                        return (
                            <div className={s.column} key={block.id}>
                                {block.icon && (
                                    <div className={s.iconWrapper}>
                                        {/* Using standard img for external API URLs to avoid next/image domain configs */}
                                        <img src={block.icon} alt="" width="28" height="28" style={{ objectFit: 'contain' }} />
                                    </div>
                                )}
                                <div className={s.cardBody}>
                                    <h3 className={s.title}>{block.name}</h3>
                                    <div className={s.content}>
                                        {block.text && block.text.length > 1 ? (
                                            <ul className={s.list}>
                                                {block.text.map((item, idx) => (
                                                    <li key={idx}>{item}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>{block.text?.[0] || ""}</p>
                                        )}

                                        {isPaymentMethod && (
                                            <div className={s.paymentIcons}>
                                                <div className={s.paymentIconBox}>
                                                    <Image src="/icons/visa.png" alt="Visa" width={44} height={28} />
                                                </div>
                                                <div className={s.paymentIconBox}>
                                                    <Image src="/icons/MC.png" alt="Mastercard" width={44} height={28} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
