"use client";

import { useState } from "react";
import clsx from "clsx";
import s from "./Reviews.module.scss";
import SectionHeader from "../../../components/ui/SectionHeader/SectionHeader";
import Button from "../../../components/ui/Button/Button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";

export default function Reviews({ dict }: { dict: any }) {
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    const toggleExpand = (id: number) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <section className={s.section} id="reviews">
            <div className={s.headerWrap}>
                <SectionHeader title={dict.sectionTitle} align="left" />
                <div className={s.sliderNav}>
                    <button className={clsx(s.navBtn, 'reviews-prev')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: "rotate(180deg)" }}>
                            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                        </svg>
                    </button>
                    <button className={clsx(s.navBtn, 'reviews-next')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className={s.carousel}>
                <Swiper
                    modules={[Navigation]}
                    navigation={{
                        prevEl: ".reviews-prev",
                        nextEl: ".reviews-next",
                    }}
                    spaceBetween={16}
                    slidesPerView={"auto"}
                    breakpoints={{
                        1024: {
                            slidesPerView: 3,
                            spaceBetween: 24,
                        },
                    }}
                >
                    {dict.items.map((review: any) => (
                        <SwiperSlide key={review.id} style={{ height: "auto" }}>
                            <div className={s.card}>
                                <div className={s.cardHeader}>
                                    <div className={s.avatar}>
                                        <img src={review.avatar} alt={review.name} className={s.avatarImg} />
                                    </div>
                                    <div className={s.author}>
                                        <div className={s.nameRow}>
                                            <span className={s.name}>{review.name}</span>
                                            <div className={s.stars}>
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <svg key={i} className={i < review.rating ? s.starFilled : s.starEmpty} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M10 1.66667L12.575 6.89167L18.3333 7.73333L14.1667 11.7917L15.15 17.5333L10 14.825L4.85 17.5333L5.83333 11.7917L1.66667 7.73333L7.425 6.89167L10 1.66667Z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </div>
                                        <span className={s.date}>{review.date}</span>
                                    </div>
                                </div>

                                {(() => {
                                    const isLong = review.text.length > 80;
                                    const isExpanded = expanded[review.id];
                                    const displayText = isExpanded ? review.text : (isLong ? review.text.slice(0, 80) + '...' : review.text);

                                    return (
                                        <>
                                            <p className={s.text}>{displayText}</p>
                                            {isLong && (
                                                <button className={s.readMoreBtn} onClick={() => toggleExpand(review.id)}>
                                                    {isExpanded ? dict.collapseText : dict.readMoreText}
                                                    <svg style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="m6 9 6 6 6-6" />
                                                    </svg>
                                                </button>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            <div className={s.cta}>
                <Button variant="outline-black">{dict.leaveReviewButton}</Button>
            </div>
        </section>
    );
}
