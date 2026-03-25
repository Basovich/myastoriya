"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import s from "./BlogPost.module.scss";
import { type Locale } from "@/i18n/config";
import { type Dictionary, type Publication } from "@/i18n/types";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs/Breadcrumbs";
import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import Button from "@/app/components/ui/Button/Button";
import ProductCard from "@/app/components/ui/ProductCard/ProductCard";
import SliderArrow from "@/app/components/ui/SliderArrow/SliderArrow";
import SectionHeader from "@/app/components/ui/SectionHeader/SectionHeader";
import blogData from "@/content/blog.json";
import homeData from "@/content/pages/home.json";

type BlogPost = (typeof blogData.posts)[number];

interface ContentSection {
    type: string;
    value: string;
    bold?: boolean;
}

interface BlogPostPageProps {
    dict: Dictionary;
    lang: Locale;
    postId: string;
}

export default function BlogPostPage({ dict, lang, postId }: BlogPostPageProps) {
    const t = dict.home.blogPostPage;
    let post = blogData.posts.find(p => String(p.id) === postId || String(p.slug) === postId);
    
    // Fallback logic for unmatched blog posts to use generic content
    if (!post) {
        const genericPost = blogData.posts[0];
        const fallbacks = dict.home.publications?.items || [];
        const parsedId = Number(postId);
        // BlogGrid generates mock IDs matching initialItems matching pattern baseId + i * 1000
        const baseId = isNaN(parsedId) ? 1 : (parsedId > 1000 ? parsedId % 1000 : parsedId);
        
        // Sometimes id might be 0 after modulo if the id is exactly 1000
        const safeBaseId = baseId === 0 ? 1 : baseId;
        
        let pubItem = fallbacks.find((item: Publication) => item.id === safeBaseId);
        if (!pubItem && fallbacks.length > 0) {
            pubItem = fallbacks[0];
        }

        if (pubItem) {
            post = {
                ...genericPost,
                id: postId,
                title: { [lang]: pubItem.title } as BlogPost["title"],
                featuredImage: pubItem.image,
                date: pubItem.dateRange || genericPost.date,
            };
        } else {
            post = { ...genericPost, id: postId };
        }
    }
    
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

    const breadcrumbs = [
        { label: t.breadcrumbs.home, href: "/" },
        { label: t.breadcrumbs.blog, href: "/blog" },
        { label: post.title[lang] },
    ];

    const recommendedProducts = [
        ...homeData.products.items.filter(item => post.recommendedProducts.includes(item.id)),
        ...homeData.products.items.filter(item => !post.recommendedProducts.includes(item.id))
    ].slice(0, 8);

    return (
        <>
            <Header lang={lang} />
            <main className={s.main}>
                <div className={s.content}>
                    <Breadcrumbs items={breadcrumbs} className={s.breadcrumbs} />

                    <article>
                        <div className={s.featuredImage}>
                            <Image
                                src={post.featuredImage}
                                alt={post.title[lang]}
                                fill
                                priority
                            />
                        </div>

                        <div className={s.meta}>
                            <div className={s.metaLeft}>
                                <span className={s.date}>10.01.2025</span>
                                <span className={s.views}>{post.views.toLocaleString('uk-UA').replace(/,/g, ' ')}</span>
                                <button className={s.likeBtn}>
                                    <svg className={s.likeBtnIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18">
                                        <path d="M7.28906 0.5H7.29004C7.73738 0.497777 8.18038 0.611928 8.58105 0.833984C8.98198 1.05623 9.33082 1.38065 9.59375 1.7832C9.85674 2.18589 10.0253 2.65353 10.084 3.14551C10.1423 3.63475 10.0898 4.13158 9.93066 4.59277L9.48242 5.81641L9.23633 6.48828H13.5986C13.8712 6.48878 14.1421 6.55343 14.3916 6.67871C14.5788 6.77272 14.7516 6.89938 14.9023 7.05469L15.0459 7.21973C15.2271 7.45152 15.3602 7.72563 15.4336 8.02246C15.5069 8.31924 15.5181 8.63015 15.4668 8.93262L14.4512 14.9209C14.3684 15.4042 14.1304 15.8345 13.7871 16.1406C13.4446 16.446 13.0188 16.6092 12.584 16.6094H2.40039C1.90785 16.6094 1.42763 16.4006 1.06836 16.0166C0.707996 15.6313 0.5 15.1014 0.5 14.543V8.55469C0.500005 7.99624 0.708 7.4664 1.06836 7.08105C1.42763 6.69706 1.90786 6.48828 2.40039 6.48828H4.61328L4.74121 6.18066L7.02051 0.698242C7.04817 0.632498 7.09161 0.582133 7.13965 0.548828C7.18724 0.515869 7.23891 0.500119 7.28906 0.5ZM2.40039 7.19922C2.04438 7.19922 1.70956 7.35089 1.46875 7.6084C1.22915 7.86474 1.09961 8.20572 1.09961 8.55469V14.543C1.09961 14.8919 1.22915 15.2329 1.46875 15.4893C1.70956 15.7468 2.04438 15.8984 2.40039 15.8984H4.5V7.19922H2.40039ZM7.31445 1.5957L5.13867 6.83105L5.09961 6.92383V15.8984H12.584V15.8975C12.8984 15.9008 13.1987 15.786 13.4336 15.5801C13.6698 15.373 13.8243 15.089 13.877 14.7812V14.7803L14.8926 8.79199L14.8936 8.78613C14.9237 8.59403 14.9146 8.39712 14.8652 8.20898C14.8159 8.0208 14.7272 7.84403 14.6045 7.69238H14.6035C14.4849 7.5425 14.3359 7.41899 14.1641 7.33301C13.989 7.24548 13.7959 7.19896 13.5996 7.19922H9.95312C9.78185 7.1989 9.61127 7.15446 9.45605 7.06738C9.30056 6.9801 9.16386 6.85143 9.05957 6.69043C8.95526 6.52938 8.88656 6.34166 8.86328 6.14258C8.84006 5.94345 8.86262 5.7412 8.92773 5.55469L8.92871 5.55273L9.35156 4.3291C9.45568 4.03611 9.50309 3.72465 9.48926 3.41309C9.4753 3.09955 9.40011 2.7912 9.26855 2.50781C9.13698 2.22443 8.95154 1.97026 8.7207 1.76367C8.48973 1.55696 8.21875 1.40218 7.9248 1.31055L7.48926 1.1748L7.31445 1.5957Z" stroke="black"/>
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
                            <h1 className={s.postTitle}>{post.title[lang]}</h1>
                            {post.content[lang].map((section: ContentSection, idx: number) => {
                                if (section.type === "text") {
                                    return (
                                        <p 
                                            key={idx} 
                                            className={s.paragraph}
                                        >
                                            {section.value}
                                        </p>
                                    );
                                }
                                if (section.type === "image") {
                                    return (
                                        <div key={idx} className={s.bodyImage}>
                                            <Image 
                                                src={section.value} 
                                                alt="" 
                                                fill 
                                            />
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </article>
                </div>
                {recommendedProducts.length > 0 && (
                    <section className={s.recommended}>
                        <SectionHeader
                            title={t.recommendedProductsTitle}
                        />

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
                                        <ProductCard {...product} />
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
                                <ProductCard key={product.id} {...product} />
                            ))}
                        </div>
                    </section>
                )}
            </main>
            <Footer lang={lang} />
        </>
    );
}
