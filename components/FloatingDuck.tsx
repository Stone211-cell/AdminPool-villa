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
      className="fixed inset-0 pointer-events-none -z-10" // Container spans screen, behind everything
    >
      {/* Massive duck 1 in the background (bottom right) */}
      <motion.div
        className="absolute w-[300px] h-[300px] md:w-[600px] md:h-[600px] drop-shadow-2xl opacity-40 mix-blend-multiply"
        style={{
          bottom: '5%',
          right: '5%',
          y: useTransform(smoothScrollY, (y) => (y * 0.5) + bobbing),
          rotateX,
          rotateY,
          rotateZ,
          perspective: 1000,
        }}
      >
        {/* Yellow Rubber Duck SVG */}
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
          {/* Body */}
          <path d="M 20 60 C 20 80, 80 80, 80 60 C 80 50, 70 45, 60 45 L 40 45 C 30 45, 20 50, 20 60 Z" fill="#FFE066" />
          {/* Head */}
          <circle cx="70" cy="35" r="15" fill="#FFE066" />
          {/* Eye */}
          <circle cx="75" cy="30" r="3" fill="#333" />
          <circle cx="76" cy="29" r="1" fill="#FFF" />
          {/* Beak */}
          <path d="M 82 35 C 90 35, 95 38, 95 40 C 95 42, 90 45, 82 45 C 80 45, 80 35, 82 35 Z" fill="#FF9F1C" />
          {/* Wing */}
          <path d="M 35 60 C 35 70, 55 70, 55 60 C 55 55, 45 55, 35 60 Z" fill="#FFD13B" />
        </svg>
      </motion.div>

      {/* Massive duck 2 in the background (top left, rotated 65 deg) */}
      <motion.div
        className="absolute w-[250px] h-[250px] md:w-[500px] md:h-[500px] drop-shadow-2xl opacity-30 mix-blend-multiply"
        style={{
          top: '10%',
          left: '2%',
          y: useTransform(smoothScrollY, (y) => (y * -0.3) + bobbing), // moves up when scrolling down
          rotate: -65, // Rotated upside down / 65 degrees
          rotateX,
          rotateY,
          perspective: 1000,
        }}
      >
        {/* Yellow Rubber Duck SVG */}
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
          {/* Body */}
          <path d="M 20 60 C 20 80, 80 80, 80 60 C 80 50, 70 45, 60 45 L 40 45 C 30 45, 20 50, 20 60 Z" fill="#FFE066" />
          {/* Head */}
          <circle cx="70" cy="35" r="15" fill="#FFE066" />
          {/* Eye */}
          <circle cx="75" cy="30" r="3" fill="#333" />
          <circle cx="76" cy="29" r="1" fill="#FFF" />
          {/* Beak */}
          <path d="M 82 35 C 90 35, 95 38, 95 40 C 95 42, 90 45, 82 45 C 80 45, 80 35, 82 35 Z" fill="#FF9F1C" />
          {/* Wing */}
          <path d="M 35 60 C 35 70, 55 70, 55 60 C 55 55, 45 55, 35 60 Z" fill="#FFD13B" />
        </svg>
      </motion.div>

    </motion.div>  );
}
