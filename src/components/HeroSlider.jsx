import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import defaultSlides from "../data/heroSlides";

export default function HeroSlider({ slides = defaultSlides }) {
  const safeSlides = slides && slides.length ? slides : defaultSlides;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (safeSlides.length <= 1) {
      return undefined;
    }

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % safeSlides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [safeSlides.length]);

  return (
    <section className="relative w-full overflow-hidden min-h-[60vh] md:h-screen">
      {safeSlides.map((slide, index) => (
        <div
          key={slide.id || index}
          className="absolute inset-0"
          style={{ display: index === activeIndex ? "block" : "none" }}
        >
          <img
            src={slide.image}
            alt={slide.title || "Hero banner"}
            className="h-full w-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
          />
          <div className="absolute bottom-10 left-6 md:bottom-16 md:left-12">
            <Link
              to="/shop"
              className="inline-block rounded-lg bg-[#1A1208] px-6 py-3 text-sm font-semibold text-white md:text-base"
            >
              Shop Now
            </Link>
          </div>
        </div>
      ))}

      {safeSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {safeSlides.map((slide, index) => (
            <button
              key={`dot-${slide.id || index}`}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full ${index === activeIndex ? "bg-white" : "bg-gray-300"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
