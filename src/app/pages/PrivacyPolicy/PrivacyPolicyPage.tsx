import React from 'react';
import s from './PrivacyPolicyPage.module.scss';
import { Dictionary } from '@/i18n/types';
import { Locale } from '@/i18n/config';
import Header from '@/app/components/Header/Header';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs/Breadcrumbs';
import Footer from "@/app/components/Footer/Footer";

interface PrivacyPolicyPageProps {
    dict: Dictionary;
    lang: Locale;
}

export default function PrivacyPolicyPage({ dict, lang }: PrivacyPolicyPageProps) {
    const { privacyPolicyPage } = dict.home as any;

    const breadcrumbs = [
        { label: privacyPolicyPage.breadcrumbs.home, href: lang === 'ua' ? '/' : `/${lang}` },
        { label: privacyPolicyPage.breadcrumbs.privacy }
    ];

    const renderTextWithLinks = (text: string) => {
        if (typeof text !== 'string') return text;
        const parts = text.split(/(\[\[.*?\]\])/g);
        return parts.map((part, index) => {
            if (part.startsWith('[[') && part.endsWith(']]')) {
                const inner = part.slice(2, -2);
                const [url, label] = inner.split('|');
                return (
                    <a 
                        key={index} 
                        href={url} 
                        className={s.redLink} 
                        target={url.startsWith('mailto:') ? undefined : "_blank"} 
                        rel="noopener noreferrer"
                    >
                        {label || url}
                    </a>
                );
            }
            return part;
        });
    };

    return (
        <>
            <Header lang={lang} />
            <main className={s.main}>
                <Breadcrumbs items={breadcrumbs} className={s.breadcrumbs} />

                <h1 className={s.title}>{privacyPolicyPage.title}</h1>

                <div className={s.content}>
                    {privacyPolicyPage.content.map((item: any, index: number) => (
                        <React.Fragment key={index}>
                            {item.type === 'header' && (
                                <h2 className={s.sectionHeader}>{item.value}</h2>
                            )}
                            {item.type === 'text' && (
                                <p className={s.paragraph}>{renderTextWithLinks(item.value)}</p>
                            )}
                            {item.type === 'list' && (
                                <ul className={s.list}>
                                    {item.value.map((li: string, liIndex: number) => (
                                        <li key={liIndex} className={s.listItem}>
                                            {renderTextWithLinks(li)}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </main>
            <Footer lang={lang} />
        </>
    );
}
