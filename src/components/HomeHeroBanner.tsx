'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Link } from '@/lib/router';
import type { HeroSlide } from '@/lib/heroSlides';

const FALLBACK: HeroSlide = {
  id: 'hero-1',
  badge: 'Kite Institute of Aviation & Hospitality',
  title: "India's Most Trusted\nAviation Training Institute",
  subtitle:
    'Bangalore’s leading aviation and hospitality institute — industry-focused training, placement support, and globally recognized certifications.',
  imageUrl: '/images/himg-1.jpg',
  btn1Text: 'Explore Courses',
  btn1Url: '/courses',
  btn2Text: 'About Kite',
  btn2Url: '/about',
};

function resolveTitle(title: string) {
  return title.replace(/\\n/g, '\n');
}

function HeroLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  const target = href || '#';
  if (target.startsWith('#')) {
    return (
      <a
        href={target}
        className={className}
        onClick={(e) => {
          const id = target.slice(1);
          if (!id) return;
          e.preventDefault();
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        {children}
      </a>
    );
  }
  if (target.startsWith('http://') || target.startsWith('https://')) {
    return (
      <a href={target} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link to={target} className={className}>
      {children}
    </Link>
  );
}

export default function HomeHeroBanner() {
  const [slides, setSlides] = useState<HeroSlide[]>([FALLBACK]);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/hero-slides');
        const data = await res.json().catch(() => ({}));
        if (!cancelled && Array.isArray(data.slides) && data.slides.length > 0) {
          setSlides(data.slides);
        }
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setFade(false);
      window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % slides.length);
        setFade(true);
      }, 280);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides]);

  const slide = slides[index] || FALLBACK;

  return (
    <section className="kite-hero" id="hero" aria-label="Hero banner">
      <div className={`kite-hero__inner ${fade ? 'is-in' : 'is-out'}`}>
        <div className="kite-hero__copy">
          {slide.badge ? <span className="kite-hero__badge">{slide.badge}</span> : null}
          <h1 className="kite-hero__title">{resolveTitle(slide.title)}</h1>
          {slide.subtitle ? <p className="kite-hero__subtitle">{slide.subtitle}</p> : null}
          <div className="kite-hero__actions">
            {slide.btn1Text ? (
              <HeroLink href={slide.btn1Url || '#'} className="kite-hero__btn kite-hero__btn--primary">
                {slide.btn1Text}
              </HeroLink>
            ) : null}
            {slide.btn2Text ? (
              <HeroLink href={slide.btn2Url || '#'} className="kite-hero__btn kite-hero__btn--secondary">
                {slide.btn2Text}
              </HeroLink>
            ) : null}
          </div>
        </div>

        <div className="kite-hero__visual">
          <div className="kite-hero__frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.imageUrl || '/images/himg-1.jpg'} alt="" />
          </div>
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="kite-hero__dots" role="tablist" aria-label="Hero slides">
          {slides.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`kite-hero__dot ${i === index ? 'is-active' : ''}`}
              onClick={() => {
                setFade(false);
                window.setTimeout(() => {
                  setIndex(i);
                  setFade(true);
                }, 200);
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
