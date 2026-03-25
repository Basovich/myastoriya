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
    classNameBtn?: string;
}

export default function Tabs({
    tabs,
    onChange,
    variant = "pills",
    className,
    classNameBtn
}: TabsProps) {
    return (
        <div className={clsx(s.tabsWrapper, s[variant], className)}>
            {tabs.map((tab) => {
                const isActive = tab.active;
                const buttonVariant = isActive ? "black" : "outline-black";

                if (tab.href) {
                    return (
                        <Button key={tab.id} href={tab.href} variant={buttonVariant} className={clsx(s.tab, classNameBtn)}>
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
                        className={clsx(s.tab, classNameBtn)}
                    >
                        {tab.label}
                    </Button>
                );
            })}
        </div>
    );
}
