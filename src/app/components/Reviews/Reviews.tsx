"use client";

import s from "./Reviews.module.scss";
import SectionHeader from "../ui/SectionHeader/SectionHeader";
import Button from "../ui/Button/Button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";

export default function Reviews({ dict }: { dict: any }) {
    return (
        <section className={s.section} id="reviews">
            <div className={s.headerWrap}>
                <SectionHeader title={dict.sectionTitle} align="left" />
                <div className={s.sliderNav}>
                    <button className={`${s.navBtn} reviews-prev`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>
                    <button className={`${s.navBtn} reviews-next`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6" />
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
                                        <span className={s.name}>{review.name}</span>
                                        <span className={s.date}>{review.date}</span>
                                    </div>
                                    <div className={s.stars}>
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <svg key={i} className={i < review.rating ? s.starFilled : s.starEmpty} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10 1.66667L12.575 6.89167L18.3333 7.73333L14.1667 11.7917L15.15 17.5333L10 14.825L4.85 17.5333L5.83333 11.7917L1.66667 7.73333L7.425 6.89167L10 1.66667Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                <p className={s.text}>{review.text}</p>
                                {review.text.endsWith("...") && (
                                    <button className={s.readMoreBtn}>Читати більше</button>
                                )}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            <div className={s.cta}>
                <Button variant="outline">{dict.leaveReviewButton}</Button>
            </div>
        </section>
    );
}
