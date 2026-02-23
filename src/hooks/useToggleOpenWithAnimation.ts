import { useRef, useState, useEffect } from "react";
import { animated, useSpring } from "@react-spring/web";

export function useToggleOpenWithAnimation() {
    const [isOpen, setIsOpen] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    const [style, api] = useSpring(() => ({
        from: { maxHeight: "0px", opacity: 0 },
        config: { tension: 170, friction: 26, clamp: true },
    }), []);

    const AnimatedDiv = animated.div;

    // Drive the spring from state — no stale closure possible
    useEffect(() => {
        if (isOpen) {
            api.start({ maxHeight: "2000px", opacity: 1 });
        } else {
            api.start({ maxHeight: "0px", opacity: 0 });
        }
    }, [isOpen, api]);

    const handleClick = () => {
        setIsOpen((prev) => !prev);
    };

    return {
        isOpen,
        setIsOpen,
        handleClick,
        animated: { div: AnimatedDiv },
        style: {
            maxHeight: style.maxHeight,
            overflow: "hidden" as const,
            opacity: style.opacity,
        },
        ref,
    };
}

export default useToggleOpenWithAnimation;
