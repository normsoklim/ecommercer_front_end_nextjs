"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useLocale, useTranslations } from "next-intl";

import { fetchHeroSlides, type HeroSlide } from "./hero.data";
import "./hero.css";

export default function HeroSection() {
  const t = useTranslations("Hero");
  const locale = useLocale();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const reduceMotion = useReducedMotion();

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  const previousSlide = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    fetchHeroSlides(locale).then((fetched) => {
      setSlides(fetched);
      setLoaded(true);
    });
  }, [locale]);

  useEffect(() => {
    if (paused || reduceMotion) return;

    const interval = window.setInterval(nextSlide, 6000);

    return () => window.clearInterval(interval);
  }, [paused, reduceMotion, slides.length]);

  if (!loaded || slides.length === 0) {
    return null;
  }

  const activeSlide = slides[activeIndex];

  const duration = reduceMotion ? 0 : 0.7;

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label={t("slide1.title")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={activeSlide.id}
          className="hero-background"
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
        >
          <Image
            src={activeSlide.image}
            alt=""
            fill
            priority={activeIndex === 0}
            sizes="100vw"
            className="hero-image"
          />
        </motion.div>
      </AnimatePresence>

      <div className="hero-overlay" />

      <div className="hero-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -15 }}
            transition={{ duration }}
            className="hero-text"
          >
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.15 }}
              className="hero-eyebrow"
            >
              {activeSlide.eyebrow}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: reduceMotion ? 0 : 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.25 }}
            >
              {activeSlide.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.4 }}
            >
              {activeSlide.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: reduceMotion ? 0 : 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.55 }}
            >
              <Link
                href={activeSlide.buttonLink}
                className="hero-button"
              >
                {activeSlide.buttonText}
                <span aria-hidden="true"> →</span>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="hero-controls">
        <button
          type="button"
          onClick={previousSlide}
          aria-label="Previous slide"
        >
          ←
        </button>

        <span aria-live="off">
          {String(activeIndex + 1).padStart(2, "0")}
          {" / "}
          {String(slides.length).padStart(2, "0")}
        </span>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          →
        </button>
      </div>
    </section>
  );
}
