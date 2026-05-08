import { gsap } from 'gsap';

export function initAnimateSections(options = {}) {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return () => {};

  const defaults = {
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.08,
    duration: 0.6,
    y: 20,
    opacity: 0,
    stagger: 0.08,
  };
  const cfg = { ...defaults, ...(options || {}) };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      // animate children marked with .animate-item or the element itself
      const items = el.querySelectorAll('.animate-item');
      if (items && items.length > 0) {
        gsap.fromTo(items, { y: cfg.y, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: cfg.duration, stagger: cfg.stagger, ease: 'power2.out' });
      } else {
        gsap.fromTo(el, { y: cfg.y, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: cfg.duration, ease: 'power2.out' });
      }
      observer.unobserve(el);
    });
  }, { root: null, rootMargin: cfg.rootMargin, threshold: cfg.threshold });

  // attach to all sections
  const sections = document.querySelectorAll('.animate-section');
  sections.forEach((s) => {
    // set initial hidden state
    const items = s.querySelectorAll('.animate-item');
    if (items && items.length > 0) {
      gsap.set(items, { autoAlpha: 0, y: cfg.y });
    } else {
      gsap.set(s, { autoAlpha: 0, y: cfg.y });
    }
    observer.observe(s);
  });

  return () => {
    observer.disconnect();
  };
}
