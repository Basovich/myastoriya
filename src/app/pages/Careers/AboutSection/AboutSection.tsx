import s from "./AboutSection.module.scss";

interface AboutSectionProps {
    title: string;
    text: string;
}

export default function AboutSection({ title, text }: AboutSectionProps) {
    return (
        <section className={s.section}>
            <div className={s.container}>
                <div className={s.wrapper}>
                    <h2 className={s.title}>{title}</h2>
                    <p className={s.text}>{text}</p>
                </div>
            </div>
        </section>
    );
}
