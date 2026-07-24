import { useState, useEffect, useRef } from "react";

/**
 * useCountUp — animates a number from 0 to `target`.
 * @param {number} target   — final value
 * @param {number} duration — ms, default 1200
 * @param {number} decimals — decimal places, default 0
 * @param {number} delay    — ms before starting, default 0
 */
export function useCountUp(target, duration = 1200, decimals = 0, delay = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const num = parseFloat(target) || 0;
    if (num === 0) { setValue(0); return; }

    let startTime = null;
    let timeoutId = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * num).toFixed(decimals)));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    timeoutId = setTimeout(() => {
      rafRef.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, decimals, delay]);

  return value;
}

/**
 * useInView — returns true once the ref'd element enters the viewport.
 * Use this to trigger bar/chart animations only when scrolled into view.
 * @param {object} options — IntersectionObserver options
 */
export function useInView(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect(); // fire once
      }
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return [ref, inView];
}
