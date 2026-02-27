import clsx from "clsx";
import s from "./HeroBanner.module.scss";
import Image from "next/image";
import React from "react";

interface HeroBannerProps {
    title?: string;
    prefix?: string;
    image?: string;
    className?: string;
    children?: React.ReactNode;
}

export default function HeroBanner({
    title,
    prefix,
    image = "/images/promotions/promotions-banner.png",
    className,
    children
}: HeroBannerProps) {
    return (
        <div className={clsx(s.bannerWrapper, className)}>
            <Image
                src={image}
                alt={title || "Banner"}
                fill
                priority
                style={{ objectFit: 'cover' }}
                className={s.bannerImg}
            />
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
                {!children && (
                    <div className={s.bannerDots}>
                        <span className={s.dot}></span>
                        <span className={s.dot}></span>
                        <span className={s.dot}></span>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
