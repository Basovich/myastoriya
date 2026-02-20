"use client";

import { useState } from "react";
import s from "./SeoText.module.scss";

export default function SeoText({ dict }: { dict: any }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <section className={s.section}>
            <h2 className={s.title}>{dict.title}</h2>

            <div className={`${s.textContainer} ${isExpanded ? s.expanded : ""}`}>
                <p className={s.text}>{dict.text}</p>
            </div>

            <button className={s.toggleBtn} onClick={() => setIsExpanded(!isExpanded)}>
                <span className={s.btnText}>{isExpanded ? dict.hideBtn : dict.showBtn}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="8" viewBox="0 0 14 8" fill="none"
                     style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
                >
                    <path d="M7.74891 7.37079L13.6491 1.71079C13.747 1.61783 13.8247 1.50723 13.8777 1.38537C13.9307 1.26351 13.958 1.1328 13.958 1.00079C13.958 0.868781 13.9307 0.738075 13.8777 0.616216C13.8247 0.494356 13.747 0.383755 13.6491 0.290792C13.4535 0.104542 13.1888 0 12.9129 0C12.637 0 12.3723 0.104542 12.1767 0.290792L6.95525 5.24079L1.78605 0.290792C1.59039 0.104542 1.32572 0 1.04983 0C0.773947 0 0.509272 0.104542 0.313612 0.290792C0.21494 0.383407 0.13644 0.493852 0.0826635 0.615727C0.0288868 0.737603 0.000901222 0.868485 0.000328064 1.00079C0.000901222 1.1331 0.0288868 1.26398 0.0826635 1.38586C0.13644 1.50773 0.21494 1.61818 0.313612 1.71079L6.21381 7.37079C6.3116 7.4723 6.43029 7.55331 6.56239 7.60871C6.69449 7.66412 6.83714 7.69273 6.98136 7.69273C7.12558 7.69273 7.26823 7.66412 7.40033 7.60871C7.53244 7.55331 7.65112 7.4723 7.74891 7.37079Z" fill="black"/>
                </svg>
            </button>
        </section>
    );
}
