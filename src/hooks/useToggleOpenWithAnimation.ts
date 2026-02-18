import { useRef, useEffect, useState } from "react";
import { animated, useSpring } from "@react-spring/web";

export function useToggleOpenWithAnimation() {
    const [isOpen, setIsOpen] = useState(false);
    const handleClick = () => {
        setIsOpen(!isOpen);
    }

    const ref = useRef<HTMLDivElement>(null);
    // Using api instead of just style to allow imperative animation
    const [style, api] = useSpring(() => ({
        height: "0px",
        overflow: "hidden", // Start hidden
        config: { tension: 120, friction: 24, clamp: true }
    }), []);

    useEffect(() => {
        if (ref.current !== null) {
            api.start({
                height: (isOpen ? ref.current.offsetHeight : 0) + "px", // Use offsetHeight for accurate content measurement
                overflow: isOpen ? "visible" : "hidden", // Toggle overflow
                onRest: () => {
                    if (isOpen) {
                        // Keep hidden when fully open per user request
                        api.start({ overflow: "hidden" });
                    } else {
                        // Keep hidden when closed
                        api.start({ overflow: "hidden" });
                    }
                }
            });
        }
    }, [api, ref, isOpen]);

    return {
        isOpen,
        setIsOpen, // Allow external control if needed (e.g. closing on link click)
        handleClick,
        animated,
        style,
        ref,
    };
}

export default useToggleOpenWithAnimation;
