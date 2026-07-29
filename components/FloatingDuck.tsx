"use client";

import { useEffect, useState } from "react";

export function FloatingDuck() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      className="fixed z-50 pointer-events-none transition-transform duration-1000 ease-out"
      style={{
        bottom: '20px',
        right: '20px',
        transform: `translateY(${Math.sin(scrollY * 0.01) * 15}px) rotate(${Math.sin(scrollY * 0.005) * 10}deg)`
      }}
    >
      <div className="w-16 h-16 md:w-20 md:h-20 drop-shadow-xl animate-bounce">
        <span className="text-5xl md:text-6xl">🦆</span>
      </div>
    </div>
  );
}
