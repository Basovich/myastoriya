"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import s from "./BlogPost.module.scss";
import { type Locale } from "@/i18n/config";
import { type Dictionary } from "@/i18n/types";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs/Breadcrumbs";
import Button from "@/app/components/ui/Button/Button";
import ProductCard from "@/app/components/ui/ProductCard/ProductCard";
import SliderArrow from "@/app/components/ui/SliderArrow/SliderArrow";
import SectionHeader from "@/app/components/ui/SectionHeader/SectionHeader";
import type { BlogPost } from "@/lib/graphql";

interface BlogPostPageProps {
    dict: Dictionary;
    lang: Locale;
    post: BlogPost;
}

export default function BlogPostPage({ dict, lang, post }: BlogPostPageProps) {
    const t = dict.home.blogPostPage;

    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

    const breadcrumbs = [
        { label: t.breadcrumbs.home, href: "/" },
        { label: t.breadcrumbs.blog, href: "/blog" },
        { label: post.name },
    ];

    const formatDate = (iso: string | null) => {
        if (!iso) return "";
        return new Date(iso).toLocaleDateString("uk-UA", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const recommendedProducts = post.products ?? [];

    return (
        <>
            <main className={s.main}>
                <div className={s.content}>
                    <Breadcrumbs items={breadcrumbs} className={s.breadcrumbs} />

                    <article>
                        {post.image?.url?.size2x && (
                            <div className={s.featuredImage}>
                                <Image
                                    src={post.image.url.size2x}
                                    alt={post.name}
                                    fill
                                    priority
                                />
                            </div>
                        )}

                        <div className={s.meta}>
                            <div className={s.metaLeft}>
                                <span className={s.date}>{formatDate(post.publishedAt)}</span>
                                <span className={s.views}>
                                    {post.likesCount.toLocaleString("uk-UA").replace(/,/g, " ")}
                                </span>
                                <button className={s.likeBtn} aria-label="Вподобати">
                                    <svg className={s.likeBtnIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18">
                                        <path d="M7.28906 0.5H7.29004C7.73738 0.497777 8.18038 0.611928 8.58105 0.833984C8.98198 1.05623 9.33082 1.38065 9.59375 1.7832C9.85674 2.18589 10.0253 2.65353 10.084 3.14551C10.1423 3.63475 10.0898 4.13158 9.93066 4.59277L9.48242 5.81641L9.23633 6.48828H13.5986C13.8712 6.48878 14.1421 6.55343 14.3916 6.67871C14.5788 6.77272 14.7516 6.89938 14.9023 7.05469L15.0459 7.21973C15.2271 7.45152 15.3602 7.72563 15.4336 8.02246C15.5069 8.31924 15.5181 8.63015 15.4668 8.93262L14.4512 14.9209C14.3684 15.4042 14.1304 15.8345 13.7871 16.1406C13.4446 16.446 13.0188 16.6092 12.584 16.6094H2.40039C1.90785 16.6094 1.42763 16.4006 1.06836 16.0166C0.707996 15.6313 0.5 15.1014 0.5 14.543V8.55469C0.500005 7.99624 0.708 7.4664 1.06836 7.08105C1.42763 6.69706 1.90786 6.48828 2.40039 6.48828H4.61328L4.74121 6.18066L7.02051 0.698242C7.04817 0.632498 7.09161 0.582133 7.13965 0.548828C7.18724 0.515869 7.23891 0.500119 7.28906 0.5Z" stroke="black" />
                                    </svg>
                                </button>
                            </div>
                            <div className={s.shareSection}>
                                <span className={s.shareLabel}>{t.shareText}</span>
                                <Button
                                    variant="black"
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={s.facebookBtn}
                                >
                                    Facebook
                                </Button>
                            </div>
                        </div>

                        <div className={s.postBody}>
                            <h1 className={s.postTitle}>{post.h1 || post.name}</h1>
                            {post.text && (
                                <div
                                    className={s.paragraph}
                                    dangerouslySetInnerHTML={{ __html: post.text }}
                                />
                            )}
                        </div>
                    </article>
                </div>

                {recommendedProducts.length > 0 && (
                    <section className={s.recommended}>
                        <SectionHeader title={t.recommendedProductsTitle} />

                        <div className={s.swiperWrapper}>
                            <Swiper
                                modules={[Navigation]}
                                navigation={{ prevEl, nextEl }}
                                spaceBetween={16}
                                className={s.swiperContainer}
                                breakpoints={{
                                    0: { slidesPerView: 1.5 },
                                    480: { slidesPerView: 2.5 },
                                    768: { slidesPerView: 3 },
                                    1024: { slidesPerView: 4 },
                                }}
                            >
                                {recommendedProducts.map((product) => (
                                    <SwiperSlide key={product.id}>
                                        <ProductCard
                                            id={Number(product.id)}
                                            title={product.name}
                                            weight={product.unit ?? ""}
                                            price={product.cost}
                                            unit={product.unit ?? ""}
                                            badge={product.is_new ? "NEW" : null}
                                            image=""
                                        lang="ua" />
                                    </SwiperSlide>
                                ))}
                                <div className={s.sliderNav}>
                                    <SliderArrow
                                        direction="left"
                                        onClick={() => {}}
                                        ref={setPrevEl}
                                    />
                                    <SliderArrow
                                        direction="right"
                                        onClick={() => {}}
                                        ref={setNextEl}
                                    />
                                </div>
                            </Swiper>
                        </div>

                        <div className={s.recommendedGrid}>
                            {recommendedProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={Number(product.id)}
                                    title={product.name}
                                    weight={product.unit ?? ""}
                                    price={product.cost}
                                    unit={product.unit ?? ""}
                                    badge={product.is_new ? "NEW" : null}
                                    image=""
                                lang="ua" />
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </>
    );
}
