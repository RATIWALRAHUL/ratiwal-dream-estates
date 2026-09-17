"use client";
import { useEffect, useRef, useState } from "react";

export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null); 
  const [visible, setVisible] = useState(false);

  useEffect(() => { 
    const node = ref.current; 
    if (!node) return; 
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => { 
        if (entry.isIntersecting) { 
          setVisible(true); 
          observer.disconnect(); 
        } 
      }, 
      { threshold: 0.05, rootMargin: "0px 0px 50px 0px" }
    ); 
    observer.observe(node); 
    return () => observer.disconnect(); 
  }, []);

  return (
    <div 
      ref={ref} 
      className={`reveal ${visible ? "is-visible" : ""} ${className}`} 
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
