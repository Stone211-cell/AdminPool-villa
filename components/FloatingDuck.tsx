"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring, useTransform, useVelocity, useAnimationFrame } from "framer-motion";

export function FloatingDuck() {
  const { scrollY } = useScroll();
  
  // Smooth scroll position for delay effect
  const smoothScrollY = useSpring(scrollY, {
    damping: 15,
    stiffness: 40,
    mass: 1.5
  });

  // Calculate velocity for 3D rotation
  const scrollVelocity = useVelocity(smoothScrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 20,
    stiffness: 100,
    mass: 0.5
  });

  // Map velocity to 3D rotation (look down when scrolling down, look up when scrolling up)
  // And map velocity to rotationY for a turning effect
  const rotateX = useTransform(smoothVelocity, [-1000, 0, 1000], [-30, 0, 30]);
  const rotateY = useTransform(smoothVelocity, [-1000, 0, 1000], [-45, 0, 45]);
  const rotateZ = useTransform(smoothVelocity, [-1000, 0, 1000], [10, 0, -10]);

  // Map smooth scroll to Y position with a slight bobbing effect
  const [time, setTime] = useState(0);
  useAnimationFrame((t) => {
    setTime(t);
  });

  // Base bobbing up and down like floating in water
  const bobbing = Math.sin(time / 500) * 15;

  return (
    <motion.div 
      className="fixed -z-10 pointer-events-none" // -z-10 puts it in the background relative to content
      style={{
        bottom: '10%',
        right: '10%',
        y: useTransform(smoothScrollY, (y) => (y * 0.5) + bobbing), // Parallax effect
        rotateX,
        rotateY,
        rotateZ,
        perspective: 1000,
      }}
    >
      <div className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl opacity-60 mix-blend-multiply">
        {/* Yellow Rubber Duck SVG */}
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
          {/* Body */}
          <path d="M75 55C75 75 60 85 45 85C20 85 10 70 10 60C10 50 25 50 35 50C45 50 50 45 50 35C50 25 60 20 70 20C80 20 85 25 85 35C85 45 75 45 75 55Z" fill="#FFD700" stroke="#E6B800" strokeWidth="2" strokeLinejoin="round"/>
          {/* Wing */}
          <path d="M25 65C30 75 45 75 50 65C45 60 30 60 25 65Z" fill="#FFC000" />
          {/* Eye */}
          <circle cx="68" cy="30" r="4" fill="#000" />
          <circle cx="69" cy="29" r="1.5" fill="#FFF" />
          {/* Beak */}
          <path d="M82 32C90 32 95 35 95 38C95 41 85 42 78 40C78 35 80 32 82 32Z" fill="#FF6B00" stroke="#CC5500" strokeWidth="1" strokeLinejoin="round"/>
        </svg>
      </div>
    </motion.div>
  );
}
