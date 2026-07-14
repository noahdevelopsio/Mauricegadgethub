"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import dynamic from "next/dynamic";

// Lazy-load the React Three Fiber 3D Canvas client-side only (disables SSR to prevent canvas node rendering errors)
const HeroCanvas = dynamic(() => import("./hero-canvas"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full aspect-[4/3] bg-paper/5 border border-white/5 rounded-3xl p-6 shadow-2xl flex items-center justify-center overflow-hidden">
      <div className="absolute w-44 h-44 bg-accent/20 rounded-full blur-[60px]" />
      <span className="text-xs text-gray-500 font-sans">Loading 3D showcase...</span>
    </div>
  ),
});

export default function Hero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  // Parallax tilt coordinates
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for reduced motion preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // 2.5s Auto-sliding carousel interval logic
  useEffect(() => {
    if (isPaused || reducedMotion) return;

    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % 3); // 3 slides total
    }, 2500);

    return () => clearInterval(interval);
  }, [isPaused, reducedMotion]);

  // Mouse tilt tracking (desktop only, skipped on reduced motion)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate tilt offset angles (max 10 degrees)
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 10;
    const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * 10;
    
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    setTilt({ x: 0, y: 0 }); // reset rotation
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      className="bg-canvas-dark text-white min-h-[85vh] lg:min-h-[90vh] py-16 px-6 md:px-12 flex flex-col justify-center relative overflow-hidden select-none"
    >
      
      {/* 1. MASKED GRID BACKGROUND PATTERN */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none select-none" />
      
      {/* 2. BACKDROP RADIAL GLOW */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none select-none" />

      {/* Dynamic CSS styles injection */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .bg-grid-pattern {
              background-image: 
                linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px);
              background-size: 50px 50px;
              mask-image: radial-gradient(circle at 60% 50%, black 20%, transparent 80%);
              -webkit-mask-image: radial-gradient(circle at 60% 50%, black 20%, transparent 80%);
            }
            .bg-radial-glow {
              background-image: radial-gradient(circle at 60% 50%, rgba(255, 75, 47, 0.1) 0%, transparent 55%);
            }
            @keyframes fill-bar {
              from { width: 0%; }
              to { width: 100%; }
            }
            .animate-progress-fill {
              animation: fill-bar 2.5s linear forwards;
            }
            .animate-progress-fill-paused {
              animation-play-state: paused;
            }
          `
        }}
      />

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        
        {/* LEFT COLUMN: COPY AND CALLS TO ACTION */}
        <div className="lg:col-span-6 flex flex-col items-start text-left gap-6">
          
          {/* Eyebrow badge */}
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] uppercase font-bold tracking-widest text-[#FF8A70] font-sans">
              Ikeja, Lagos
            </span>
          </div>

          {/* Headline (Static: shopping/buying-focused as per updated spec) */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-sans font-semibold tracking-tight leading-[1.08] text-[#F5F5F7]">
            Genuine tech,
            <span className="block text-accent mt-1">delivered fast.</span>
          </h1>

          {/* Subcopy details */}
          <p className="text-[#98989D] text-sm md:text-base leading-relaxed max-w-[440px] font-sans font-medium">
            Phones, gaming consoles, audio and accessories — genuine products, secure checkout, fast delivery across Lagos.
          </p>

          {/* Call to Actions CTA */}
          <div className="flex flex-wrap gap-4 mt-2">
            <Link
              href="/products"
              className="btn-primary py-3 px-8 text-xs font-bold uppercase tracking-wider bg-accent hover:bg-accent-dark text-white rounded-full flex items-center gap-1.5 transition-transform active:scale-95 duration-200"
            >
              <span>Explore catalog</span>
              <MoveRight className="w-3.5 h-3.5" />
            </Link>
            
            <Link
              href="/orders/track"
              className="py-3 px-8 text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 rounded-full transition-transform active:scale-95 duration-200 inline-block text-center"
            >
              Track an order
            </Link>
          </div>

          {/* HORIZONTAL PROGRESS TIMERS INDICATOR BARS */}
          <div className="flex gap-2.5 mt-8 w-full max-w-[200px]">
            {[0, 1, 2].map((idx) => {
              const isPast = idx < activeIdx;
              const isActive = idx === activeIdx;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveIdx(idx);
                    setIsPaused(true);
                  }}
                  className="flex-grow h-1 bg-white/20 rounded-full overflow-hidden focus:outline-none"
                  title={`Navigate to slide ${idx + 1}`}
                >
                  <div
                    className={`h-full bg-accent rounded-full ${
                      isPast 
                        ? "w-full" 
                        : isActive 
                        ? reducedMotion 
                          ? "w-full" 
                          : "animate-progress-fill" 
                        : "w-0"
                    } ${isPaused ? "animate-progress-fill-paused" : ""}`}
                  />
                </button>
              );
            })}
          </div>

        </div>

        {/* RIGHT COLUMN: SHOWCASE ROTATING 3D CANVAS */}
        <div className="lg:col-span-6 flex justify-center items-center relative aspect-square max-w-lg mx-auto w-full">
          <div className="w-full h-full min-h-[350px] lg:min-h-[450px]">
            <HeroCanvas activeIdx={activeIdx} tilt={tilt} />
          </div>
        </div>

      </div>
    </section>
  );
}
