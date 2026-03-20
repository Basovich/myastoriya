import clsx from "clsx";
import Button from "../Button/Button";
import s from "./Tabs.module.scss";

interface Tab {
    id: string;
    label: string;
    href?: string;
    active?: boolean;
}

interface TabsProps {
    tabs: Tab[];
    onChange?: (id: string) => void;
    variant?: "pills" | "underline";
    className?: string;
}

export default function Tabs({
    tabs,
    onChange,
    variant = "pills",
    className,
}: TabsProps) {
    return (
        <div className={clsx(s.tabsWrapper, s[variant], className)}>
            {tabs.map((tab) => {
                const isActive = tab.active;
                const buttonVariant = isActive ? "black" : "outline-black";

                if (tab.href) {
                    return (
                        <Button key={tab.id} href={tab.href} variant={buttonVariant} className={s.tab}>
                            {tab.label}
                        </Button>
                    );
                }

                return (
                    <Button
                        key={tab.id}
                        type="button"
                        variant={buttonVariant}
                        onClick={() => onChange?.(tab.id)}
                        className={s.tab}
                    >
                        {tab.label}
                    </Button>
                );
            })}
        </div>
    );
}
