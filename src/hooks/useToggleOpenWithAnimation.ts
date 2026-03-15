import { useRef, useState, useEffect } from "react";
import { animated, useSpring } from "@react-spring/web";

export function useToggleOpenWithAnimation(initialOpen = false) {
    const [isOpen, setIsOpen] = useState(initialOpen);

    const ref = useRef<HTMLDivElement>(null);

    const [style, api] = useSpring(() => ({
        from: { 
            maxHeight: initialOpen ? "2000px" : "0px", 
            opacity: initialOpen ? 1 : 0 
        },
        config: { tension: 170, friction: 26, clamp: true },
    }), [initialOpen]);

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
