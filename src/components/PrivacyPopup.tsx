'use client';

import { useEffect, useState } from 'react';
import { privacyPolicyMeta, privacyPolicySections } from '../data/privacyPolicy';

function PrivacyPopup({ isOpen, onClose }) {
  const [activeId, setActiveId] = useState(privacyPolicySections[0]?.id ?? 'overview');

  const activeSection =
    privacyPolicySections.find((section) => section.id === activeId) ??
    privacyPolicySections[0];

  useEffect(() => {
    if (!isOpen) return undefined;

    document.body.classList.add('popup-opened');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.classList.remove('popup-opened');
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setActiveId(privacyPolicySections[0]?.id ?? 'overview');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="privacy-popup-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-popup-title"
      onClick={onClose}
    >
      <div className="privacy-popup" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="privacy-popup__close"
          onClick={onClose}
          aria-label="Close privacy policy"
        />

        <header className="privacy-popup__header">
          <p className="privacy-popup__eyebrow">Legal &amp; privacy</p>
          <h2 id="privacy-popup-title">{privacyPolicyMeta.title}</h2>
          <p className="privacy-popup__updated">Last updated: {privacyPolicyMeta.lastUpdated}</p>
          <p className="privacy-popup__intro">
            Select a topic below to read how Kite Institute collects, uses, and protects your
            personal information.
          </p>
        </header>

        <div className="privacy-popup__body">
          <nav className="privacy-popup__nav" aria-label="Privacy policy sections">
            {privacyPolicySections.map((section) => {
              const isActive = section.id === activeId;
              return (
                <button
                  key={section.id}
                  id={`privacy-nav-${section.id}`}
                  type="button"
                  className={`privacy-popup__nav-btn${isActive ? ' is-active' : ''}`}
                  aria-expanded={isActive}
                  aria-controls={`privacy-panel-${section.id}`}
                  onClick={() => setActiveId(section.id)}
                >
                  <span className="privacy-popup__nav-title">{section.title}</span>
                  <span className="privacy-popup__nav-summary">{section.summary}</span>
                </button>
              );
            })}
          </nav>

          <div
            className="privacy-popup__panel"
            id={`privacy-panel-${activeSection.id}`}
            role="region"
            aria-labelledby={`privacy-nav-${activeSection.id}`}
          >
            <h3 className="privacy-popup__panel-title">{activeSection.title}</h3>
            {activeSection.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <footer className="privacy-popup__footer">
          <p>
            Questions? Email{' '}
            <a href="mailto:enquiry@kiteaviation.in">enquiry@kiteaviation.in</a> or call{' '}
            <a href="tel:+917022833935">+91 70228 33935</a>.
          </p>
          <button type="button" className="privacy-popup__accept" onClick={onClose}>
            I understand
          </button>
        </footer>
      </div>
    </div>
  );
}

export default PrivacyPopup;
