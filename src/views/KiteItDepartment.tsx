'use client';

import { useEffect } from 'react';
import {
  kiteItMeta,
  kiteItProcess,
} from '../data/kiteItDepartment';

function KiteItDepartment() {
  useEffect(() => {
    document.body.classList.add('kite-it-page-active');
    return () => document.body.classList.remove('kite-it-page-active');
  }, []);

  return (
    <div className="kite-it-page">
      <section className="kite-it-hero">
        <div className="kite-it-hero__grid" aria-hidden="true" />
        <div className="kite-it-hero__glow kite-it-hero__glow--left" aria-hidden="true" />
        <div className="kite-it-hero__glow kite-it-hero__glow--right" aria-hidden="true" />
        <div className="kite-it-hero__inner">
          <div className="kite-it-hero__layout kite-it-hero__layout--center">
            <div className="kite-it-hero__copy">
              <p className="kite-it-hero__eyebrow">Innovation · Engineering · Excellence</p>
              <h1>{kiteItMeta.title}</h1>
              <p className="kite-it-hero__tagline">{kiteItMeta.tagline}</p>
              <p className="kite-it-hero__subtitle">{kiteItMeta.subtitle}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="kite-it-section kite-it-section--alt">
        <div className="kite-it-section__inner">
          <header className="kite-it-section__head">
            <p className="kite-it-section__eyebrow">How we work</p>
            <h2>From idea to production</h2>
          </header>
          <div className="kite-it-process">
            {kiteItProcess.map((item) => (
              <article key={item.step} className="kite-it-process-card">
                <span className="kite-it-process-card__step">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="kite-it-cta">
        <div className="kite-it-cta__inner">
          <h2>Get in touch</h2>
          <p>
            Reach the Kite IT team by email or phone.<br/> We&apos;re happy to answer questions and discuss
            how we can help.
          </p>
          <div className="kite-it-cta__actions">
            <a href="mailto:enquiry@kiteaviation.in" className="kite-it-btn kite-it-btn--primary">
              enquiry@kiteaviation.in
            </a>
            <a href="tel:+917022833935" className="kite-it-btn kite-it-btn--ghost">
              +91 70228 33935
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default KiteItDepartment;
