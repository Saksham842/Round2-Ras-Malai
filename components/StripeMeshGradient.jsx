"use client";

import { useEffect, useRef } from "react";

export default function StripeMeshGradient({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Stripe signature color coordinates & oscillations
    // Blurple (#635bff), Magenta (#ff5b79), Cyan (#00d4b6), Orange (#ff805d), Indigo (#0a2540)
    let t = 0;

    const render = () => {
      t += 0.003;
      ctx.clearRect(0, 0, width, height);

      // Deep obsidian navy base
      ctx.fillStyle = "#070913";
      ctx.fillRect(0, 0, width, height);

      // We draw 4 large fluid radial color gradients that drift smoothly
      // 1. Stripe Blurple
      const x1 = width * (0.35 + 0.15 * Math.sin(t * 1.2));
      const y1 = height * (0.3 + 0.12 * Math.cos(t * 0.9));
      const r1 = Math.max(width, height) * 0.55;
      const grad1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, r1);
      grad1.addColorStop(0, "rgba(99, 91, 255, 0.45)");
      grad1.addColorStop(0.5, "rgba(99, 91, 255, 0.15)");
      grad1.addColorStop(1, "rgba(99, 91, 255, 0)");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // 2. Stripe Hot Magenta / Pink
      const x2 = width * (0.7 + 0.12 * Math.cos(t * 1.1));
      const y2 = height * (0.2 + 0.1 * Math.sin(t * 1.3));
      const r2 = Math.max(width, height) * 0.48;
      const grad2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, r2);
      grad2.addColorStop(0, "rgba(255, 91, 121, 0.4)");
      grad2.addColorStop(0.5, "rgba(255, 91, 121, 0.12)");
      grad2.addColorStop(1, "rgba(255, 91, 121, 0)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // 3. Stripe Turquoise Cyan
      const x3 = width * (0.15 + 0.1 * Math.sin(t * 0.8));
      const y3 = height * (0.55 + 0.14 * Math.cos(t * 1.4));
      const r3 = Math.max(width, height) * 0.5;
      const grad3 = ctx.createRadialGradient(x3, y3, 0, x3, y3, r3);
      grad3.addColorStop(0, "rgba(0, 212, 182, 0.35)");
      grad3.addColorStop(0.5, "rgba(0, 212, 182, 0.1)");
      grad3.addColorStop(1, "rgba(0, 212, 182, 0)");
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, width, height);

      // 4. Stripe Amber Orange
      const x4 = width * (0.6 + 0.14 * Math.cos(t * 0.7));
      const y4 = height * (0.7 + 0.12 * Math.sin(t * 1.0));
      const r4 = Math.max(width, height) * 0.45;
      const grad4 = ctx.createRadialGradient(x4, y4, 0, x4, y4, r4);
      grad4.addColorStop(0, "rgba(255, 128, 93, 0.35)");
      grad4.addColorStop(0.5, "rgba(255, 128, 93, 0.08)");
      grad4.addColorStop(1, "rgba(255, 128, 93, 0)");
      ctx.fillStyle = grad4;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ filter: "blur(40px)" }}
    />
  );
}
