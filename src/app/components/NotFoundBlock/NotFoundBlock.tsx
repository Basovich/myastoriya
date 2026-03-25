import React from "react";
import Image from "next/image";
import s from "./NotFoundBlock.module.scss";
import Breadcrumbs from "../ui/Breadcrumbs/Breadcrumbs";
import Button from "../ui/Button/Button";
import { type Dictionary } from "@/i18n/types";

interface NotFoundBlockProps {
    dict: Dictionary;
}

export default function NotFoundBlock({ dict }: NotFoundBlockProps) {
    const { notFoundPage } = dict.home;

    const breadcrumbItems = [
        { label: notFoundPage.breadcrumbs.home, href: "/" },
        { label: notFoundPage.breadcrumbs.notFound }
    ];

    return (
        <section className={s.section}>
            <div className={s.breadcrumbsWrapper}>
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className={s.content}>
                <div className={s.imageWrapper}>
                    <Image
                        src="/images/404.webp"
                        alt="404"
                        width={544}
                        height={348}
                        className={s.image}
                        priority
                    />
                </div>

                <h1 className={s.title}>{notFoundPage.title}</h1>

                <p className={s.text}>
                    {notFoundPage.text}
                </p>
                <p className={s.text}>
                    {notFoundPage.subtext}
                </p>

                <Button href="/" variant="red" className={s.button}>
                    {notFoundPage.button}
                </Button>
            </div>
        </section>
    );
}
