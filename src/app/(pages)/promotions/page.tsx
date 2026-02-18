"use client";

import { useState } from "react";
import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import s from "./promotions.module.scss";
import promoData from "@/content/pages/promotions.json";

export default function PromotionsPage() {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <>
            <Header />
            <main>
                {/* Hero Banner */}
                <section className={s.hero}>
                    <div className={s.heroOverlay}>
                        <h1 className={s.heroTitle}>{promoData.hero.title}</h1>
                        <div className={s.heroDots}>
                            <span /><span /><span />
                        </div>
                    </div>
                    <div className={s.heroDecor}>
                        <span className={s.heroPercent}>%</span>
                        <span className={s.heroLogo}>
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)">
                                <path d="M12 2C8.5 2 6 4.5 6 7.5c0 2 1 3.5 2.5 4.5L10 21h4l1.5-9C17 11 18 9.5 18 7.5 18 4.5 15.5 2 12 2z" />
                            </svg>
                        </span>
                        <span className={s.heroChevrons}>&raquo;</span>
                    </div>
                </section>

                {/* Breadcrumbs */}
                <nav className={s.breadcrumbs}>
                    {promoData.breadcrumbs.map((crumb, i) => (
                        <span key={i}>
                            {i > 0 && <span className={s.breadcrumbSep}>→</span>}
                            <a href={crumb.href} className={s.breadcrumbLink}>{crumb.label}</a>
                        </span>
                    ))}
                </nav>

                {/* Filter Tabs */}
                <div className={s.tabs}>
                    {promoData.tabs.map((tab, i) => (
                        <button
                            key={i}
                            className={`${s.tab} ${activeTab === i ? s.tabActive : ""}`}
                            onClick={() => setActiveTab(i)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Promo Grid */}
                <section className={s.promoGrid}>
                    {promoData.items.map((item) => (
                        <article key={item.id} className={s.promoCard}>
                            <div className={s.promoImageWrap}>
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className={s.promoImage}
                                />
                            </div>
                            <div className={s.promoMeta}>
                                <span className={s.promoDate}>
                                    Акція діє до: <strong>{item.date}</strong>
                                </span>
                            </div>
                            <h3 className={s.promoTitle}>{item.title}</h3>
                        </article>
                    ))}
                </section>

                {/* Show More */}
                <div className={s.showMore}>
                    <button className={s.showMoreBtn}>
                        ПОКАЗАТИ ЩЕ
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </main>
            <Footer />
        </>
    );
}
