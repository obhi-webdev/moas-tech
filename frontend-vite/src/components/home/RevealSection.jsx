"use client";
import {
  useEffect,
  useRef,
  useState
} from "react";
function RevealSection({
  children,
  delay = 0
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px"
      }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div
    ref={ref}
    style={{
      transitionDelay: `${delay}ms`
    }}
    className={`transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
  >
      {children}
    </div>;
}
export {
  RevealSection as default
};
