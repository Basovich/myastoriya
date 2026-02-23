import { useRef, useEffect, useState } from "react";
import { animated, useSpring } from "@react-spring/web";

export function useToggleOpenWithAnimation() {
    const [isOpen, setIsOpen] = useState(false);
    const handleClick = () => {
        setIsOpen(!isOpen);
    }

    const ref = useRef<HTMLDivElement>(null);
    
    const [style, api] = useSpring(() => (
        {
            height: 0,
            opacity: 0,
            config: { tension: 170, friction: 26, clamp: false }
        }
    ), []);

    const AnimatedDiv = animated.div;

    useEffect(() => {
        if (ref.current) {
            const element = ref.current;
            const contentHeight = element.scrollHeight; // Use scrollHeight instead of offsetHeight
            
            if (isOpen) {
                api.start({
                    height: contentHeight,
                    opacity: 1,
                });
            } else {
                api.start({
                    height: 0,
                    opacity: 0,
                });
            }
        }
    }, [isOpen, api]);

    return {
        isOpen,
        setIsOpen,
        handleClick,
        animated: { div: AnimatedDiv },
        style: {
            height: style.height,
            overflow: "hidden" as const,
            opacity: style.opacity,
        },
        ref,
    };
}

export default useToggleOpenWithAnimation;
