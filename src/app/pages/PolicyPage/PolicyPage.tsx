import React from 'react';
import s from './PolicyPage.module.scss';
import { Locale } from '@/i18n/config';
import Header from '@/app/components/Header/Header';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs/Breadcrumbs';
import Footer from "@/app/components/Footer/Footer";
import { PolicyPageContentItem } from '@/i18n/types';

interface PolicyPageProps {
    title: string;
    breadcrumbs: { label: string; href?: string }[];
    content: PolicyPageContentItem[];
    lang: Locale;
}

export default function PolicyPage({ title, breadcrumbs, content, lang }: PolicyPageProps) {
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

                <h1 className={s.title}>{title}</h1>

                <div className={s.content}>
                    {content.map((item, index) => (
                        <React.Fragment key={index}>
                            {item.type === 'header' && typeof item.value === 'string' && (
                                <h2 className={s.sectionHeader}>{item.value}</h2>
                            )}
                            {item.type === 'text' && typeof item.value === 'string' && (
                                <p className={s.paragraph}>{renderTextWithLinks(item.value)}</p>
                            )}
                            {item.type === 'list' && Array.isArray(item.value) && (
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
