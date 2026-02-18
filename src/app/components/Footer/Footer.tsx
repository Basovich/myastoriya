import s from "./Footer.module.scss";
import siteData from "@/content/site.json";
import homeData from "@/content/pages/home.json";
import Link from "next/link";
import { type Locale } from "@/i18n/config";
import { getLocalizedHref } from "@/utils/i18n-helpers";

interface FooterProps {
    lang: Locale;
}

export default function Footer({ lang }: FooterProps) {
    const { footer, contact, socialLinks } = siteData;
    const { seoText } = homeData;

    /* Split site links: first 8 = site, rest = legal */
    const siteLinks = footer.siteLinks.slice(0, 8);
    const legalLinks = footer.siteLinks.slice(8);

    return (
        <footer className={s.footer} id="footer">
            {/* SEO Text */}
            <div className={s.seoSection}>
                <h3 className={s.seoTitle}>{seoText.title}</h3>
                <p className={s.seoText}>{seoText.content}</p>
            </div>

            {/* ===== Top Row: App | Social | Logo ===== */}
            <div className={s.topRow}>
                <div className={s.appSection}>
                    <h3 className={s.appTitle}>Завантажуйте наш застосунок</h3>
                    <div className={s.appButtons}>
                        <a href={footer.appLinks.googlePlay} className={s.storeBtn}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.53 12.9 20.18 13.18L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" /></svg>
                            <div>
                                <span className={s.storeSub}>Скачати в</span>
                                <span className={s.storeName}>Google Play</span>
                            </div>
                        </a>
                        <a href={footer.appLinks.appStore} className={s.storeBtn}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                            <div>
                                <span className={s.storeSub}>Скачати в</span>
                                <span className={s.storeName}>Apple Store</span>
                            </div>
                        </a>
                    </div>
                </div>

                <div className={s.socialSection}>
                    <h3 className={s.socialTitle}>Завантажуйте наш застосунок</h3>
                    <div className={s.socialIcons}>
                        {socialLinks.map((link, i) => (
                            <a key={i} href={link.url} className={s.socialIcon} aria-label={link.platform}>
                                {link.icon === "facebook" && (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                                )}
                                {link.icon === "youtube" && (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
                                )}
                                {link.icon === "instagram" && (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                )}
                            </a>
                        ))}
                    </div>
                </div>

                <Link href={getLocalizedHref("/", lang)} className={s.footerLogo}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-accent)">
                        <path d="M12 2C8.5 2 6 4.5 6 7.5c0 2 1 3.5 2.5 4.5L10 21h4l1.5-9C17 11 18 9.5 18 7.5 18 4.5 15.5 2 12 2z" />
                    </svg>
                    <span>М&apos;ЯСТОРІЯ</span>
                </Link>
            </div>

            {/* ===== Links Row: site links | legal links | red banner ===== */}
            <div className={s.linksRow}>
                <div className={s.linksCol}>
                    <h3 className={s.linksTitle}>Розділи сайту</h3>
                    <nav className={s.linksList}>
                        {siteLinks.map((link, i) => (
                            <Link key={i} href={getLocalizedHref(link.href, lang)} className={s.link}>{link.label}</Link>
                        ))}
                    </nav>
                </div>

                <div className={s.linksCol}>
                    <nav className={s.linksList}>
                        {legalLinks.map((link, i) => (
                            <Link key={i} href={getLocalizedHref(link.href, lang)} className={s.link}>{link.label}</Link>
                        ))}
                    </nav>
                </div>

                <div className={s.reviewBanner}>
                    <div className={s.reviewContent}>
                        <p className={s.reviewText}>МИ БУДЕМО ВДЯЧНІ ЗА ВАШ ВІДГУК ЧИ РЕКОМЕНДАЦІЮ!</p>
                    </div>
                </div>
            </div>

            {/* ===== Bottom Row: contacts | payment ===== */}
            <div className={s.bottomRow}>
                <div className={s.contactSection}>
                    <h3 className={s.contactTitle}>Наші контакти</h3>
                    <p className={s.contactItem}>{contact.phone}</p>
                    <p className={s.contactItem}>{contact.email}</p>
                    <p className={s.contactItem}>Час роботи: {contact.workingHours}</p>
                    <a href="#" className={s.addressBtn}>
                        АДРЕСИ РЕСТОРАНІВ
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>

                <div className={s.paymentSection}>
                    <h3 className={s.paymentTitle}>Методи оплати</h3>
                    <div className={s.paymentIcons}>
                        <div className={s.paymentCard}>
                            <svg width="50" height="32" viewBox="0 0 50 32" fill="none">
                                <rect width="50" height="32" rx="4" fill="#1A1F71" />
                                <text x="25" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">VISA</text>
                            </svg>
                        </div>
                        <div className={s.paymentCard}>
                            <svg width="50" height="32" viewBox="0 0 50 32" fill="none">
                                <rect width="50" height="32" rx="4" fill="#EB001B" />
                                <circle cx="20" cy="16" r="9" fill="#EB001B" />
                                <circle cx="30" cy="16" r="9" fill="#F79E1B" />
                                <circle cx="25" cy="16" r="6" fill="#FF5F00" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

        </footer>
    );
}
