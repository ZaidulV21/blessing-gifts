import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
// Register bundled Swiper with all modules pre-registered before loading React wrapper
import "swiper/bundle";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/bundle";
import slides from "../data/heroSlides";

export default function HeroSlider() {
  const navigate = useNavigate();
  const swiperRef = useRef(null);
  const fallbackAutoplayRef = useRef(null);

  // Start a JS fallback autoplay in case native/autoplay modules are blocked.
  useEffect(() => {
    // Respect reduced motion preference
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    function startFallback() {
      if (fallbackAutoplayRef.current) return;
      fallbackAutoplayRef.current = setInterval(() => {
        if (swiperRef.current && !swiperRef.current.destroyed) {
          try { swiperRef.current.slideNext(); } catch (e) { /* ignore */ }
        }
      }, 5000);
      // console.debug('HeroSlider: fallback autoplay started');
    }

    function stopFallback() {
      if (fallbackAutoplayRef.current) { clearInterval(fallbackAutoplayRef.current); fallbackAutoplayRef.current = null; }
    }

    // Start after mount; Swiper instance may attach later but slideNext will noop until ready
    startFallback();
    return () => stopFallback();
  }, []);

  // GSAP animations: animate active slide image scale and CTA entrance
  useEffect(() => {
    function animateActiveSlide(swiperInstance) {
      try {
        const activeEl = document.querySelector('.swiper-slide-active');
        if (!activeEl) return;
        const img = activeEl.querySelector('img');
        const cta = activeEl.querySelector('button');
        // reset
        if (img) gsap.set(img, { scale: 1.04 });
        if (cta) gsap.set(cta, { autoAlpha: 0, y: 20 });

        // image subtle zoom out
        if (img) gsap.to(img, { scale: 1, duration: 1.4, ease: 'power2.out' });
        // cta fade/slide
        if (cta) gsap.to(cta, { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.25, ease: 'power2.out' });
      } catch (e) { /* ignore */ }
    }

    // animate on initial load
    if (swiperRef.current) animateActiveSlide(swiperRef.current);

    // attach listener for later slide changes
    const onSlide = () => animateActiveSlide(swiperRef.current);
    document.addEventListener('slideChange', onSlide);
    return () => document.removeEventListener('slideChange', onSlide);
  }, []);

  return (
    <section style={{ padding: "2rem 0 1rem", background: "transparent" }}>
      <div
        onMouseEnter={() => {
          if (fallbackAutoplayRef.current) { clearInterval(fallbackAutoplayRef.current); fallbackAutoplayRef.current = null; }
        }}
        onMouseLeave={() => {
          // restart fallback autoplay when leaving hover
          const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (prefersReduced) return;
          if (!fallbackAutoplayRef.current) {
            fallbackAutoplayRef.current = setInterval(() => {
              if (swiperRef.current && !swiperRef.current.destroyed) {
                try { swiperRef.current.slideNext(); } catch (e) { }
              }
            }, 5000);
          }
        }}
      >
      <Swiper
        onSwiper={(sw) => { swiperRef.current = sw; /* animate first slide */ setTimeout(() => { try { const el = document.querySelector('.swiper-slide-active'); if (el) { const img = el.querySelector('img'); const btn = el.querySelector('button'); if (img) gsap.set(img, { scale: 1.04 }); if (btn) gsap.set(btn, { autoAlpha: 0, y: 20 }); if (img) gsap.to(img, { scale: 1, duration: 1.4, ease: 'power2.out' }); if (btn) gsap.to(btn, { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.25 }); } } catch(e){} }, 80); }}
        onSlideChange={() => {
          // animate active slide on change
          try {
            const activeEl = document.querySelector('.swiper-slide-active');
            if (!activeEl) return;
            const img = activeEl.querySelector('img');
            const btn = activeEl.querySelector('button');
            if (img) { gsap.killTweensOf(img); gsap.set(img, { scale: 1.04 }); gsap.to(img, { scale: 1, duration: 1.4, ease: 'power2.out' }); }
            if (btn) { gsap.killTweensOf(btn); gsap.set(btn, { autoAlpha: 0, y: 20 }); gsap.to(btn, { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.2 }); }
          } catch (e) { /* ignore */ }
        }}
        loop={true}
        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true }}
        keyboard={{ enabled: true }}
        slidesPerView={1}
        style={{ width: "100%" }}
      >
        {slides.map((s) => (
          <SwiperSlide key={s.id}>
            <div style={{ position: "relative", width: "100%", height: "auto", minHeight: "72vh" }}>
              <img
                src={s.image}
                alt={s.alt}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={(e) => { console.error("Hero image failed to load:", s.image); }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 60%)" }} />
              <button
                onClick={() => navigate(s.cta)}
                style={{
                  position: "absolute",
                  bottom: "3rem",
                  left: "2rem",
                  background: "var(--gold)",
                  color: "white",
                  border: "none",
                  padding: "14px 32px",
                  fontFamily: "'Open Sans', sans-serif",
                  fontSize: "0.85rem",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.2s",
                  zIndex: 10,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gold-light)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--gold)"; e.currentTarget.style.transform = "none"; }}
                aria-label={`Shop now - slide ${s.id}`}
              >
                Shop Now
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      </div>
    </section>
  );
}
