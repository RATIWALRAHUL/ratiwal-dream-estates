"use client";
import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/types/common";

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [active, setActive] = useState(0); const [paused, setPaused] = useState(false);
  useEffect(() => { if (paused || testimonials.length < 2) return; const timer = window.setInterval(() => setActive((i) => (i + 1) % testimonials.length), 5000); return () => clearInterval(timer); }, [paused, testimonials.length]);
  return <div className="carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} aria-roledescription="carousel" aria-label="Client testimonials">
    <div className="testimonial-track" style={{ "--active-slide": active } as React.CSSProperties}>
      {testimonials.map((item) => {
        const displayName = item.clientDisplayName;
        const displayLocation = [item.city, item.state].filter(Boolean).join(", ");
        const displayRole = item.clientType || displayLocation;
        const displayQuote = item.quote;
        const rating = item.rating || 5;

        return (
          <article className="testimonial-card" aria-hidden={active !== testimonials.indexOf(item)} key={item.id}>
            <div className="stars" aria-label={`${rating} out of 5 stars`}>
              {Array.from({ length: rating }, (_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <Quote className="quote" aria-hidden="true" />
            <p>{displayQuote}</p>
            <div className="testimonial-person">
              <span aria-hidden="true">{displayName.charAt(0) || "R"}</span>
              <div>
                <strong>{displayName}</strong>
                <small>{displayRole}</small>
              </div>
            </div>
          </article>
        );
      })}
    </div>
    <div className="carousel-dots" aria-label="Choose testimonial">{testimonials.map((item, i) => <button type="button" key={item.id} className={i === active ? "active" : ""} onClick={() => setActive(i)} aria-label={`Show testimonial ${i + 1}`} aria-current={i === active ? "true" : undefined}/>)}</div>
    {testimonials.length > 1 && <div className={`testimonial-progress ${paused ? "is-paused" : ""}`} aria-hidden="true">{testimonials.map((item, i) => <span key={item.id} className={`progress-seg ${i === active ? "active" : ""}`}><span className="progress-fill"/></span>)}</div>}
  </div>;
}
