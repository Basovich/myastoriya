import Link from "next/link";
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
    className = "",
}: TabsProps) {
    return (
        <div className={`${s.tabsWrapper} ${s[variant]} ${className}`}>
            {tabs.map((tab) => {
                const isActive = tab.active;
                const classes = `${s.tab} ${isActive ? s.active : ""}`;

                if (tab.href) {
                    return (
                        <Link key={tab.id} href={tab.href} className={classes}>
                            {tab.label}
                        </Link>
                    );
                }

                return (
                    <button
                        key={tab.id}
                        type="button"
                        className={classes}
                        onClick={() => onChange?.(tab.id)}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
