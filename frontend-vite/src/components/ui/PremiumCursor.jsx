import { useEffect, useRef } from "react";

export default function PremiumCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;

    if (!dot || !ring) return;

    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (!finePointer.matches || reducedMotion.matches) {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let frame = 0;

    const interactiveSelector =
      "a, button, [role='button'], select, summary, " +
      "input[type='submit'], input[type='button'], " +
      "[data-cursor-hover]";

    function onMove(event) {
      mouseX = event.clientX;
      mouseY = event.clientY;

      dot.style.transform =
        `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

      dot.style.opacity = "1";
      ring.style.opacity = "1";

      const target = event.target;

      const interactive =
        target instanceof Element &&
        Boolean(target.closest(interactiveSelector));

      const textInput =
        target instanceof Element &&
        Boolean(
          target.closest(
            "input:not([type='button']):not([type='submit']):not([type='checkbox']):not([type='radio']), textarea, [contenteditable='true']"
          )
        );

      ring.classList.toggle("vc-cursor-hover", interactive);
      ring.classList.toggle("vc-cursor-text", textInput);
      dot.classList.toggle("vc-cursor-text", textInput);
    }

    function onDown() {
      ring.classList.add("vc-cursor-click");
    }

    function onUp() {
      ring.classList.remove("vc-cursor-click");
    }

    function onLeave() {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    }

    function animate() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      ring.style.transform =
        `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      frame = requestAnimationFrame(animate);
    }

    const onVisibility = () => {
      if (document.hidden) onLeave();
    };

    document.addEventListener("pointermove", onMove, {
      passive: true,
    });

    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="vc-cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="vc-cursor-ring" aria-hidden="true" />
    </>
  );
}
