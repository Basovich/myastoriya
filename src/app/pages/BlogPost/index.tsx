"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import clsx from "clsx";

import s from "./BlogPost.module.scss";
import { type Locale } from "@/i18n/config";
import { type Dictionary } from "@/i18n/types";
import { getLocalizedHref } from "@/utils/i18n-helpers";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs/Breadcrumbs";
import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import Button from "@/app/components/ui/Button/Button";
import ProductCard from "@/app/components/ui/ProductCard/ProductCard";
import SliderArrow from "@/app/components/ui/SliderArrow/SliderArrow";
import SectionHeader from "@/app/components/ui/SectionHeader/SectionHeader";
import blogData from "@/content/blog.json";
import homeData from "@/content/pages/home.json";

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
        
        let pubItem = fallbacks.find((item: any) => item.id === safeBaseId);
        if (!pubItem && fallbacks.length > 0) {
            pubItem = fallbacks[0];
        }

        if (pubItem) {
            post = {
                ...genericPost,
                id: postId,
                title: { [lang]: pubItem.title } as any,
                featuredImage: pubItem.image,
                date: pubItem.dateRange || genericPost.date,
            };
        } else {
            post = { ...genericPost, id: postId };
        }
    }
    
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

    if (!post) {
        return (
            <>
                <Header lang={lang} />
                <main className={s.main}>
                    <div className={s.content}>
                        <h1>Post not found</h1>
                    </div>
                </main>
                <Footer lang={lang} />
            </>
        );
    }

    const breadcrumbs = [
        { label: t.breadcrumbs.home, href: getLocalizedHref("/", lang) },
        { label: t.breadcrumbs.blog, href: getLocalizedHref("/blog", lang) },
        { label: post.title[lang] },
    ];

    const recommendedProducts = homeData.products.items.filter(item => 
        post.recommendedProducts.includes(item.id)
    );

    return (
        <>
            <Header lang={lang} />
            <main className={s.main}>
                <div className={s.content}>
                    <Breadcrumbs items={breadcrumbs} className={s.breadcrumbs} />

                    <article className={s.postHeader}>
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
                                <span className={s.date}>{post.date}</span>
                                <span className={s.views}>{post.views.toLocaleString('uk-UA').replace(/,/g, ' ')}</span>
                                <button className={s.likeBtn}>
                                    <Image src="/icons/like.svg" alt="Like" width={20} height={20} />
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

                        <h1 className={s.postTitle}>{post.title[lang]}</h1>

                        <div className={s.postBody}>
                            {post.content[lang].map((section: any, idx: number) => {
                                if (section.type === "text") {
                                    return (
                                        <p 
                                            key={idx} 
                                            className={clsx(s.paragraph, section.bold && s.bold)}
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

                    {recommendedProducts.length > 0 && (
                        <section className={s.recommended}>
                            <div style={{ position: 'relative' }}>
                                <SectionHeader 
                                    title={t.recommendedProductsTitle} 
                                    classNameWrapper={s.recommendedTitle} 
                                />
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
                            </div>

                            <div className={s.sliderContainer}>
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
                                </Swiper>
                            </div>
                        </section>
                    )}
                </div>
            </main>
            <Footer lang={lang} />
        </>
    );
}
