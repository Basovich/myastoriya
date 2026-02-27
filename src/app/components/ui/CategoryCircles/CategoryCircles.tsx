import clsx from "clsx";
import s from "./CategoryCircles.module.scss";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export interface CategoryCircleItem {
    name: string;
    image: string;
    href: string;
}

interface CategoryCirclesProps {
    title?: string;
    items: CategoryCircleItem[];
    className?: string;
}

export default function CategoryCircles({
    title,
    items,
    className
}: CategoryCirclesProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className={clsx(s.wrapper, className)}>
            {title && <h2 className={s.title}>{title}</h2>}

            <div className={s.grid}>
                {items.map((item, index) => (
                    <Link key={index} href={item.href} className={s.item}>
                        <div className={s.circle}>
                            <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="(max-width: 768px) 100px, 178px"
                                className={s.circleImg}
                            />
                        </div>
                        <span className={s.name}>{item.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
