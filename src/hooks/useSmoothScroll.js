import { useEffect, useRef } from "react";
import Lenis from "lenis";

const useSmoothScroll = () => {
  const lenisRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,

      // Prevent Lenis from intercepting scroll on elements that manage
      // their own overflow — identified by the data-lenis-prevent attribute.
      // Without this, mouse wheel events inside notification lists or
      // appointment lists scroll the page instead of the element itself.
      prevent: (node) => node.hasAttribute("data-lenis-prevent"),
    });

    lenisRef.current = lenis;

    const raf = (time) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };

    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lenis.destroy();
    };
  }, []);

  return lenisRef;
};

export default useSmoothScroll;
