import clsx from "clsx";
import s from "./HeroBanner.module.scss";
import Image from "next/image";
import React from "react";

interface HeroBannerProps {
    title?: string;
    subtitle?: string;
    prefix?: string;
    image?: string | null;
    /** Зображення для мобільних пристроїв (≤ 767px). Якщо не передано — використовується `image`. */
    mobileImage?: string | null;
    className?: string;
    children?: React.ReactNode;
}

export default function HeroBanner({
    title,
    subtitle,
    prefix,
    image = "/images/promotions/promotions-banner.png",
    mobileImage,
    className,
    children
}: HeroBannerProps) {
    const hasMobileVariant = mobileImage && image && mobileImage !== image;

    return (
        <section className={clsx(s.bannerWrapper, className)}>
            {image && (
                hasMobileVariant ? (
                    <picture className={s.bannerPicture}>
                        <source media="(max-width: 767px)" srcSet={mobileImage!} />
                        <source media="(min-width: 768px)" srcSet={image} />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={image}
                            alt={title || "Banner"}
                            className={s.bannerImg}
                            fetchPriority="high"
                        />
                    </picture>
                ) : (
                    <Image
                        src={image}
                        alt={title || "Banner"}
                        fill
                        priority
                        style={{ objectFit: 'cover' }}
                        className={s.bannerImg}
                    />
                )
            )}

            <div className={s.bannerContent}>
                {title && (
                    <h1 className={s.bannerTitle}>
                        {prefix &&
                            <>
                                {prefix}
                                {' '}
                            </>
                        }
                        {title}
                    </h1>
                )}
                {subtitle && <p className={s.bannerSubtitle}>{subtitle}</p>}
                {!children && !subtitle && (
                    <div className={s.bannerDots}>
                        <span className={s.dot}></span>
                        <span className={s.dot}></span>
                        <span className={s.dot}></span>
                    </div>
                )}
                {children}
            </div>
        </section>
    );
}
