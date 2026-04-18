"use client";

import { useState } from "react";
import s from "./Reviews.module.scss";
import Image from "next/image";
import SectionHeader from "../../../components/ui/SectionHeader/SectionHeader";
import Button from "../../../components/ui/Button/Button";
import SliderArrow from "../../../components/ui/SliderArrow/SliderArrow";
import ReviewModal from "../../../components/ReviewModal";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import type { Review } from "@/i18n/types";
import type { HomeReview } from "@/lib/graphql";
import { format } from "date-fns";
import clsx from "clsx";

interface ReviewsProps {
    dict: {
        sectionTitle: string;
        leaveReviewButton: string;
        readMoreText: string;
        collapseText: string;
        items: Review[];
    };
    reviews: HomeReview[];
}

export default function Reviews({ dict, reviews }: ReviewsProps) {
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const toggleExpand = (id: number) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <section className={s.section} id="reviews">
            <div className={s.headerWrap}>
                <SectionHeader title={dict.sectionTitle} />
                <div className={s.sliderNav}>
                    <SliderArrow
                        direction="left"
                        ref={setPrevEl}
                        className={s.navArrowComp}
                    />
                    <SliderArrow
                        direction="right"
                        ref={setNextEl}
                        className={s.navArrowComp}
                    />
                </div>
            </div>
            <Swiper
                modules={[Navigation]}
                navigation={{
                    prevEl,
                    nextEl,
                }}
                spaceBetween={16}
                grabCursor={true}
                slidesPerView={"auto"}
                className={s.reviewsSlider}
                breakpoints={{
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 24,
                    },
                    1280: {
                        slidesPerView: 3,
                        spaceBetween: 24,
                        centeredSlides: true,
                        loop: true,
                    },
                }}
            >
                {reviews.map((review) => {
                    const fullName = `${review.user?.name ?? ""} ${review.user?.surname ?? ""}`.trim() || "Anonymous";
                    const avatar = review.user?.avatar?.size1x || "/images/reviews/avatar-1.png";
                    const date = format(new Date(review.created_at), "dd.MM.yyyy");

                    return (
                        <SwiperSlide key={review.id} style={{ height: "auto" }}>
                            <div className={s.card}>
                                <div className={s.avatar}>
                                    <Image src={avatar} alt={fullName} className={s.avatarImg} width={56} height={56} loading='lazy' />
                                </div>
                                <div className={s.author}>
                                    <div className={s.nameRow}>
                                        <span className={s.name}>{fullName}</span>
                                        <div className={s.stars}>
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <svg key={i} className={clsx(s.star, i < review.rating ? s.starFilled : s.starEmpty)} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M10 1.66667L12.575 6.89167L18.3333 7.73333L14.1667 11.7917L15.15 17.5333L10 14.825L4.85 17.5333L5.83333 11.7917L1.66667 7.73333L7.425 6.89167L10 1.66667Z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                    <span className={s.date}>{date}</span>
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
                                                        <svg style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }} xmlns="http://www.w3.org/2000/svg" width="14" height="8" viewBox="0 0 14 8" fill="none">
                                                            <path d="M0.799805 0.799805L6.7998 6.7998L12.7998 0.799805" stroke="#E3051B" strokeWidth="1.6" strokeLinecap="round" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
            <div className={s.cta}>
                <Button variant="outline-black" className={s.button} onClick={() => setIsReviewModalOpen(true)}>
                    <span className={s.buttonInner}>{dict.leaveReviewButton}</span>
                </Button>
            </div>

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
            />
        </section>
    );
}
