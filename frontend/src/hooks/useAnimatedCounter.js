// ============================================================
// AgroConnect — useAnimatedCounter Hook
// src/hooks/useAnimatedCounter.js
// ============================================================
import { useState, useEffect, useRef } from 'react';

const useAnimatedCounter = (target, duration = 1000, start = 0) => {
  const [count, setCount]   = useState(start);
  const rafRef              = useRef(null);
  const startTimeRef        = useRef(null);
  const startValueRef       = useRef(start);

  useEffect(() => {
    if (target === count) return;

    startValueRef.current = count;
    startTimeRef.current  = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed  = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(
        startValueRef.current + (target - startValueRef.current) * eased
      );
      setCount(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return count;
};

export default useAnimatedCounter;