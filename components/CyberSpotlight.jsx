"use client";

import { useEffect, useRef } from "react";

export default function CyberSpotlight() {
  const spotlightRef = useRef(null);
  const posRef = useRef({ x: -500, y: -500, targetX: -500, targetY: -500 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      posRef.current.targetX = e.clientX;
      posRef.current.targetY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let animationFrameId;
    const animate = () => {
      // Smooth lerp interpolation for fluid motion
      const current = posRef.current;
      current.x += (current.targetX - current.x) * 0.12;
      current.y += (current.targetY - current.y) * 0.12;

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${current.x - 300}px, ${current.y - 300}px, 0)`;
      }

      // Also set CSS variables on root for card-level spotlight borders
      document.documentElement.style.setProperty("--mouse-x", `${current.x}px`);
      document.documentElement.style.setProperty("--mouse-y", `${current.y}px`);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={spotlightRef}
      className="pointer-events-none fixed top-0 left-0 w-[600px] h-[600px] rounded-full z-30 transition-opacity duration-300 opacity-60 mix-blend-screen"
      style={{
        background: "radial-gradient(circle, rgba(0, 229, 255, 0.08) 0%, rgba(99, 102, 241, 0.04) 40%, transparent 70%)",
        willChange: "transform",
      }}
    />
  );
}
