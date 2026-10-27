'use client';

import { useState } from 'react';
import { Link } from '@/lib/router';
import homeFaqItems from '../data/homeFaqItems';

function openCareerGuidanceForm() {
  window.dispatchEvent(
    new CustomEvent('openEnquiryForm', {
      detail: { title: 'Book a Free Career Guidance Session' },
    })
  );
}

function HomeFaqCtaSection() {
  const [openFaqId, setOpenFaqId] = useState(null);

  const toggleFaq = (id) => {
    setOpenFaqId((current) => (current === id ? null : id));
  };

  return (
    <section className="content-box home-faq-cta" aria-label="Frequently asked questions and career guidance">
      <div className="content-block home-faq-cta__top">
        <div className="home-faq-cta__faq">
          <h3 className="home-faq-cta__faq-title">Frequently Asked Questions</h3>
          <ul className="home-faq-cta__list">
            {homeFaqItems.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <li key={item.id} className={`home-faq-cta__item${isOpen ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="home-faq-cta__question"
                    onClick={() => toggleFaq(item.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="home-faq-cta__marker" aria-hidden />
                    <span className="home-faq-cta__question-text">{item.question}</span>
                  </button>
                  {isOpen && (
                    <div className="home-faq-cta__answer">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="home-faq-cta__see-more">
            <Link to="/contact" className="showloader">
              See More
            </Link>
          </div>
        </div>

        <div className="home-faq-cta__banner">
          <h3 className="home-faq-cta__banner-title">Book a Free Career Guidance Session</h3>
          <p className="home-faq-cta__banner-text">
            Speak with our aviation experts and get personalized guidance on choosing the right course for your career
            goals.
          </p>
          <button type="button" className="home-faq-cta__book-btn" onClick={openCareerGuidanceForm}>
            Book Now →
          </button>
        </div>
      </div>

      <div className="home-faq-cta__intro">
        <h3 className="home-faq-cta__intro-title">Leading Aviation Training Institute in Bangalore</h3>
        <p className="home-faq-cta__intro-text">
          Kite Aviation is a leading aviation training institute in Bangalore, offering industry-focused programs in air
          hostess training, cabin crew preparation, and hospitality management. With a strong focus on practical
          learning, communication skills, and personality development, we prepare students to meet real airline industry
          standards.
        </p>
        <div className="home-faq-cta__read-more">
          <Link to="/about" className="showloader">
            Read More
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HomeFaqCtaSection;
