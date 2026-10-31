'use client';

import { useEffect } from 'react';
import { useCmsContent } from '@/src/hooks/useCmsContent';
import itDepartmentFallback from '../../data/it-department.json';
import siteSettingsFallback from '../../data/site-settings.json';

function KiteItDepartment() {
  const { data: itDoc } = useCmsContent('it-department', itDepartmentFallback);
  const { data: settings } = useCmsContent('site-settings', siteSettingsFallback);
  const meta = itDoc?.meta || itDepartmentFallback.meta;
  const process = itDoc?.process?.length ? itDoc.process : itDepartmentFallback.process;
  const enquiryEmail = settings?.emails?.enquiry || siteSettingsFallback.emails.enquiry;
  const phone = settings?.phone || siteSettingsFallback.phone;
  const phoneTel = phone.replace(/\s+/g, '');

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
              <h1>{meta.title}</h1>
              <p className="kite-it-hero__tagline">{meta.tagline}</p>
              <p className="kite-it-hero__subtitle">{meta.subtitle}</p>
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
            {process.map((item) => (
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
            <a href={`mailto:${enquiryEmail}`} className="kite-it-btn kite-it-btn--primary">
              {enquiryEmail}
            </a>
            <a href={`tel:${phoneTel}`} className="kite-it-btn kite-it-btn--ghost">
              {phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default KiteItDepartment;
