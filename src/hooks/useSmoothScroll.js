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
