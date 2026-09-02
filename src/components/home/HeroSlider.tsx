"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  MapPin,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { MagneticButton } from "./MagneticButton";

export interface HeroSlide {
  id: number;
  image: string;
  alt: string;
  title: string;
  location: string;
  headlineHighlight: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    image: "/images/hero/slide-1.jpg",
    alt: "Masterplanned luxury township with wide roads and palm tree boulevards at golden hour",
    title: "Masterplanned Townships",
    location: "Ajmer Road SEZ Corridor, Jaipur",
    headlineHighlight: "future begins.",
  },
  {
    id: 2,
    image: "/images/hero/slide-2.jpg",
    alt: "Exclusive modern luxury hillside villa enclave at twilight with infinity pools",
    title: "Luxury Villa Communities",
    location: "Navi Mumbai Coastal Outskirts",
    headlineHighlight: "legacy grows.",
  },
  {
    id: 3,
    image: "/images/hero/slide-3.jpg",
    alt: "JDA approved demarcated residential plotted layout with clubhouse and lush central park",
    title: "Approved Plotted Layouts",
    location: "Jaipur Ring Road Expressway",
    headlineHighlight: "dreams settle.",
  },
  {
    id: 4,
    image: "/images/hero/slide-4.jpg",
    alt: "Architectural luxury villa estate with twilight ambient pool lighting and mountain backdrop",
    title: "Signature Estates",
    location: "High-Growth Investment Corridors",
    headlineHighlight: "wealth compounds.",
  },
];

const AUTO_PLAY_INTERVAL = 6000;

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const changeSlide = useCallback((newIndex: number) => {
    setCurrentIndex((current) => {
      setPrevIndex(current);
      return newIndex;
    });
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((current) => {
      setPrevIndex(current);
      return (current + 1) % HERO_SLIDES.length;
    });
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((current) => {
      setPrevIndex(current);
      return (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
    });
  }, []);

  const goToSlide = (index: number) => {
    if (index !== currentIndex) {
      changeSlide(index);
    }
  };

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, AUTO_PLAY_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStartX(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const currentSlide = HERO_SLIDES[currentIndex];

  return (
    <section
      className="hero-slider-section"
      aria-label="Featured Properties Showcase"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image Carousel Layers with Continuous Drone View Camera Paths */}
      <div className="hero-backdrop-container" aria-hidden="true">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;
          const isExiting = index === prevIndex && !isActive;
          return (
            <div
              key={slide.id}
              className={`hero-slide-item slide-drone-${index + 1} ${
                isActive ? "active" : isExiting ? "exiting" : ""
              }`}
            >
              <div className="hero-drone-zoom-layer">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                  sizes="100vw"
                  quality={75}
                  className="hero-slide-image"
                />
              </div>
            </div>
          );
        })}

        {/* Directional Cinematic Vignette & Readability Gradient */}
        <div className="hero-overlay-scrim" />
        <div className="hero-overlay-top" />
        <div className="hero-overlay-bottom" />
      </div>

      {/* Main Foreground Container */}
      <div className="hero-foreground-shell">
        <div className="hero-grid-layout">
          {/* Left Column: Editorial Hero Copy */}
          <div className="hero-left-content">
            {/* Top Eyebrow Badge */}
            <div className="hero-eyebrow-pill">
              <Sparkles size={13} className="text-[#38bdf8] shrink-0" />
              <span>Verified Land &amp; Luxury Estates</span>
              <span className="opacity-40 hidden sm:inline">•</span>
              <span className="text-[#a5f3fc] font-normal hidden sm:inline">Jaipur &amp; Navi Mumbai</span>
            </div>

            {/* Main Headline */}
            <h1 id="home-hero-title" className="hero-main-title">
              Where Vision Meets Value,
              <br className="hidden md:inline" />{" "}
              and Every Plot Builds a{" "}
              <span className="hero-gradient-text">
                Better Tomorrow.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="hero-main-desc">
              Discover JDA &amp; RERA-approved plotted developments, luxury villa communities,
              and high-growth investment land with complete legal title clarity.
            </p>

            {/* Action Buttons */}
            <div className="hero-cta-group">
              <MagneticButton strength={8}>
                <Link href="/properties" className="button-primary hero-btn-main">
                  Explore properties <ArrowRight size={17} />
                </Link>
              </MagneticButton>
              <MagneticButton strength={8}>
                <Link href="/contact" className="button-ghost hero-btn-secondary">
                  Talk to an expert <ArrowRight size={17} />
                </Link>
              </MagneticButton>
            </div>

            {/* Trust Checklist Row */}
            <div className="hero-trust-row">
              <div className="hero-trust-item">
                <ShieldCheck size={16} className="text-[#38bdf8]" />
                <span>Verified Land</span>
              </div>
              <span className="hero-trust-sep" />
              <div className="hero-trust-item">
                <FileCheck2 size={16} className="text-[#38bdf8]" />
                <span>Clear Documentation</span>
              </div>
              <span className="hero-trust-sep" />
              <div className="hero-trust-item">
                <MapPin size={16} className="text-[#38bdf8]" />
                <span>Local Expertise</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Carousel Navigation Bar */}
        <div className="hero-bottom-bar">
          {/* Slide Indicator Tabs with Titles */}
          <div className="hero-tabs-track" role="tablist" aria-label="Select slide">
            {HERO_SLIDES.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(idx)}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Slide ${idx + 1}: ${slide.title}`}
                  className={`hero-tab-btn ${isActive ? "active" : ""}`}
                >
                  <div className="hero-tab-meta">
                    <span className="hero-tab-num">0{idx + 1}</span>
                    <span className="hero-tab-title">{slide.title}</span>
                  </div>
                  <div className="hero-tab-bar">
                    {isActive ? (
                      <div
                        key={`progress-${idx}-${currentIndex}`}
                        className="hero-tab-progress animating"
                      />
                    ) : (
                      <div className="hero-tab-progress" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Controls: Arrows + Pause */}
          <div className="hero-arrows-group">
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="hero-arrow-pill"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="hero-arrow-pill"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause auto-slide" : "Play auto-slide"}
              className="hero-pause-pill"
              title={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
