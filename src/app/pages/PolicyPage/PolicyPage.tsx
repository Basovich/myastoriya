import React from 'react';
import s from './PolicyPage.module.scss';
import { Locale } from '@/i18n/config';
import Breadcrumbs from '@/app/components/ui/Breadcrumbs/Breadcrumbs';
import { PolicyPageContentItem } from '@/i18n/types';

interface PolicyPageProps {
    breadcrumbs: { label: string; href?: string }[];
    content: PolicyPageContentItem[];
    lang: Locale;
    h1?: string;
}

export default function PolicyPage({ breadcrumbs, content, h1 }: PolicyPageProps) {
    const renderTextWithLinks = (text: string) => {
        if (typeof text !== 'string') return text;
        const parts = text.split(/(\[\[.*?]])/g);
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
            <main className={s.main}>
                <Breadcrumbs items={breadcrumbs} className={s.breadcrumbs} />
                {h1 && <h1 className={s.title}>{h1}</h1>}
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
                            {item.type === 'html' && typeof item.value === 'string' && (
                                <div 
                                    className={s.htmlContent} 
                                    dangerouslySetInnerHTML={{ __html: item.value.replace(/<h1([\s>])/gi, '<h2$1').replace(/<\/h1>/gi, '</h2>') }} 
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </main>
        </>
    );
}
