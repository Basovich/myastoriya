import clsx from "clsx";
import s from "./Container.module.scss";

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    as?: React.ElementType;
}

export default function Container({
    children,
    className,
    as: Component = "div"
}: ContainerProps) {
    return (
        <Component className={clsx(s.container, className)}>
            {children}
        </Component>
    );
}
