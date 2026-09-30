"use client";

import { useEffect, useRef } from "react";

export default function SmoothCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;

    if (!dot || !ring) return;

    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    if (!canHover) return;

    let mouseX = -100;
    let mouseY = -100;

    let ringX = -100;
    let ringY = -100;

    let frame = 0;

    const moveCursor = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      dot.style.transform = `translate3d(
        ${mouseX}px,
        ${mouseY}px,
        0
      ) translate(-50%, -50%)`;
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.09;
      ringY += (mouseY - ringY) * 0.09;

      ring.style.transform = `translate3d(
        ${ringX}px,
        ${ringY}px,
        0
      ) translate(-50%, -50%)`;

      frame = requestAnimationFrame(animateRing);
    };

    const handleOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        target.closest(
          "a, button, input, select, textarea, [role='button']",
        )
      ) {
        ring.classList.add("cursor-active");
        dot.classList.add("cursor-dot-active");
      }
    };

    const handleOut = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        target.closest(
          "a, button, input, select, textarea, [role='button']",
        )
      ) {
        ring.classList.remove("cursor-active");
        dot.classList.remove("cursor-dot-active");
      }
    };

    const handleDown = () => {
      ring.classList.add("cursor-click");
    };

    const handleUp = () => {
      ring.classList.remove("cursor-click");
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    frame = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);

      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        className="smooth-cursor-ring"
      />

      <div
        ref={dotRef}
        className="smooth-cursor-dot"
      />
    </>
  );
}
