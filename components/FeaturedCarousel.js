"use client";

import { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";

function shuffleProducts(items) {
  return [...items].sort((a, b) => {
    const score = (item) => ((Number(item.id) * 9301 + 49297) % 233280);
    return score(a) - score(b);
  });
}

export default function FeaturedCarousel({ products = [] }) {
  const total = products.length;

  const [shuffledProducts] = useState(() => shuffleProducts(products));
  const [index, setIndex] = useState(total);
  const [visibleCount, setVisibleCount] = useState(3);
  const [paused, setPaused] = useState(false);
  const [animate, setAnimate] = useState(true);

  const trackRef = useRef(null);
  const resettingRef = useRef(false);

  // Responsive carousel
  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(window.innerWidth <= 768 ? 1 : 3);
    };

    updateVisibleCount();

    window.addEventListener("resize", updateVisibleCount);

    return () => {
      window.removeEventListener("resize", updateVisibleCount);
    };
  }, []);

  // Automatic sliding
  useEffect(() => {
    if (paused || total <= visibleCount) return;

    const timer = setInterval(() => {
      if (!resettingRef.current) {
        setIndex((prev) => prev + 1);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [paused, total, visibleCount]);

  // Repeat products for infinite scrolling
  const repeatedProducts = [
    ...shuffledProducts,
    ...shuffledProducts,
    ...shuffledProducts,
  ];

  // Handle infinite loop
  const handleTransitionEnd = (event) => {
    if (event.target !== trackRef.current) return;

    if (index >= total * 2 || index < total) {
      resettingRef.current = true;
      setAnimate(false);

      setIndex((prev) => {
        if (prev >= total * 2) {
          return prev - total;
        }

        return prev + total;
      });
    }
  };

  // Restore animation after resetting
  useEffect(() => {
    if (!animate) {
      let secondFrame;

      const firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          setAnimate(true);
          resettingRef.current = false;
        });
      });

      return () => {
        cancelAnimationFrame(firstFrame);
        if (secondFrame) cancelAnimationFrame(secondFrame);
      };
    }
  }, [animate]);

  const next = () => {
    if (total <= visibleCount || resettingRef.current) return;
    setIndex((prev) => prev + 1);
  };

  const previous = () => {
    if (total <= visibleCount || resettingRef.current) return;
    setIndex((prev) => prev - 1);
  };

  if (total === 0) return null;

  return (
    <div
      className="featured-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="carousel-wrapper">

        {/* LEFT ARROW */}
        <button
          type="button"
          className="carousel-arrow carousel-arrow-left"
          onClick={previous}
          disabled={total <= visibleCount}
          aria-label="Previous product"
        >
          ←
        </button>

        {/* PRODUCTS */}
        <div className="carousel-viewport">
          <div
            ref={trackRef}
            className="carousel-track"
            onTransitionEnd={handleTransitionEnd}
            style={{
              "--visible-count": visibleCount,
              transform: `translateX(calc(-${index} * (100% + 24px) / ${visibleCount}))`,
              transition: animate
                ? "transform 2000ms ease-in-out"
                : "none",
            }}
          >
            {repeatedProducts.map((product, i) => (
              <div
                className="carousel-item"
                key={`${product.id}-${i}`}
              >
                <ProductCard
                  product={product}
                  showAddToCart={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT ARROW */}
        <button
          type="button"
          className="carousel-arrow carousel-arrow-right"
          onClick={next}
          disabled={total <= visibleCount}
          aria-label="Next product"
        >
          →
        </button>

      </div>
    </div>
  );
}