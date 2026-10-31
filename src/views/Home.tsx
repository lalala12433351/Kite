'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import CourseSection from '../components/CourseSection';
import RecentNewsSection from '../components/RecentNewsSection';
import VideoGallery from '../components/VideoGallery';
import UsefulLinksSection from '../components/UsefulLinksSection';
import StudentSuccessStoriesSection from '../components/StudentSuccessStoriesSection';
import HomeFaqCtaSection from '../components/HomeFaqCtaSection';
import { useCmsContent, cmsAssetUrl } from '@/src/hooks/useCmsContent';
import homeFallback from '../../data/home.json';

function dispatchTileAction(action) {
  if (action === 'openChatbot') {
    window.dispatchEvent(new CustomEvent('openChatbot'));
  } else if (action === 'openCampusTour') {
    window.dispatchEvent(new CustomEvent('openCampusTour'));
  }
}

function AboutBlurbText({ blurb }) {
  if (!blurb) return null;
  const { instituteName, highlightWord, paragraph } = blurb;
  if (!paragraph || !highlightWord || !paragraph.includes(highlightWord)) {
    return (
      <>
        <span className="sml">{instituteName}</span> {paragraph}
      </>
    );
  }
  const idx = paragraph.indexOf(highlightWord);
  return (
    <>
      <span className="sml">{instituteName}</span>{' '}
      {paragraph.slice(0, idx)}
      <span className="marking">{highlightWord}</span>
      {paragraph.slice(idx + highlightWord.length)}
    </>
  );
}

function Home() {
  const { data: home } = useCmsContent('home', homeFallback);
  const heroTypingTexts = home?.heroTypingTexts?.length
    ? home.heroTypingTexts
    : homeFallback.heroTypingTexts;
  const circleTiles = home?.circleTiles?.length ? home.circleTiles : homeFallback.circleTiles;
  const airlines = home?.airlines?.length ? home.airlines : homeFallback.airlines;
  const courses = home?.courseTeaser?.length ? home.courseTeaser : homeFallback.courseTeaser;
  const whyChooseCards = home?.whyChooseCards?.length ? home.whyChooseCards : homeFallback.whyChooseCards;
  const whyChooseSection = home?.whyChooseSection || homeFallback.whyChooseSection;
  const googleReviews = home?.googleReviews || homeFallback.googleReviews;
  const aboutBlurb = home?.aboutBlurb || homeFallback.aboutBlurb;
  const courseRecommendation = home?.courseRecommendation || homeFallback.courseRecommendation;
  const airlinesHeading = home?.airlinesHeading || homeFallback.airlinesHeading;
  const closingText = home?.closingText || homeFallback.closingText;
  const [typing1Text, setTyping1Text] = useState('');
  const [typing2Text, setTyping2Text] = useState('');
  const [circlesVisible, setCirclesVisible] = useState(false);
  const [visibleCircles, setVisibleCircles] = useState([]);
  const [showGoogleReviews, setShowGoogleReviews] = useState(false);
  const [activeWhyChooseCard, setActiveWhyChooseCard] = useState(null);

  useEffect(() => {
    const text1 = heroTypingTexts[0] || "India's Most Trusted";
    const text2 = heroTypingTexts[1] || 'Aviation Training Institute';
    let i = 0;
    const typeInterval1 = setInterval(() => {
      if (i <= text1.length) {
        setTyping1Text(text1.substring(0, i));
        i++;
      } else {
        clearInterval(typeInterval1);
        let j = 0;
        const typeInterval2 = setInterval(() => {
          if (j <= text2.length) {
            setTyping2Text(text2.substring(0, j));
            j++;
          } else {
            clearInterval(typeInterval2);
            // Show circles immediately without delay
            setCirclesVisible(true);
            // Staggered appearance of circles
            const lastIndex = Math.max(0, circleTiles.length - 1);
            circleTiles.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCircles(prev => [...prev, index]);
                if (index === lastIndex) {
                  setTimeout(() => {
                    setShowGoogleReviews(true);
                  }, 200); // 200ms delay after last circle
                }
              }, index * 150);
            });
          }
        }, 35);
      }
    }, 35);

    return () => {
      clearInterval(typeInterval1);
    };
  }, [heroTypingTexts, circleTiles.length]);

  useEffect(() => {
    if (!activeWhyChooseCard) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActiveWhyChooseCard(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeWhyChooseCard]);

  const renderCircleTile = (tile, index) => {
    const classNames = [
      'circle',
      'tooltip-btn',
      visibleCircles.includes(index) ? 'zoom-in' : '',
      tile.action === 'openChatbot' ? 'virtual-agent-btn' : '',
      tile.action === 'openCampusTour' ? 'campus-tour-btn' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const inner = (
      <>
        {tile.badge ? <span className="new-ribbon">{tile.badge}</span> : null}
        <span className="for-hover">
          <span className="desc-tbl">
            <span className="ico">
              <img src={cmsAssetUrl(tile.icon)} alt={tile.label} />
            </span>
            <small>{tile.hoverText}</small>
          </span>
        </span>
        <img
          src={cmsAssetUrl(tile.image)}
          alt={tile.label}
          loading="eager"
          key={`${tile.label}-${index}`}
        />
        <span className="tooltip-txt">{tile.label}</span>
      </>
    );

    if (tile.link) {
      return (
        <Link key={`${tile.label}-${index}`} to={tile.link} className={classNames}>
          {inner}
        </Link>
      );
    }

    return (
      <a
        key={`${tile.label}-${index}`}
        className={classNames}
        href="#"
        onClick={(e) => {
          e.preventDefault();
          dispatchTileAction(tile.action);
        }}
        style={{ cursor: 'pointer' }}
      >
        {inner}
      </a>
    );
  };

  return (
    <>
      <div className="content-panel home-page" id="home">
        <div className="homepage-head-banner">
          <h1>
            <div className="typing-container" id="typing1" dangerouslySetInnerHTML={{ __html: typing1Text }}></div>
            <br />
            <div className="typing-container" id="typing2">{typing2Text}</div>
          </h1>

          <div className="circle-container">
            {circleTiles.map((tile, index) => renderCircleTile(tile, index))}
          </div>

          {/* Google Reviews Section */}
          <div className={`google-reviews-section ${showGoogleReviews ? 'show' : ''}`}>
            <div className="google-reviews-container">
              <h2>{googleReviews.heading}</h2>
              <span>{googleReviews.subtext}</span>
              <a
                href={googleReviews.url}
                target="_blank"
                rel="noopener noreferrer"
                className="google-review-button"
              >
                <img src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" alt="Google" className="google-logo" />
                {googleReviews.buttonLabel}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="content-box about">
        <div className="content-block">
          <div className="lt">
            <span className="lrg">
              <AboutBlurbText blurb={aboutBlurb} />
              <span className="sml">
                <Link to="/about" className="know-more showloader">Know More</Link>
              </span>
            </span>

            <h3>Courses We Offer</h3>
            
            <div className="course-cards">
              {courses.map((course, index) => (
                <a key={index}>
                  {course.title}
                  <span>Duration: <strong>{course.duration}</strong></span>
                </a>
              ))}
            </div>

            <div className="course-recommendation-card home-page">
              <div className="recommendation-card-content">
                <div className="recommendation-text">
                  <h4>{courseRecommendation.heading}</h4>
                  <p>{courseRecommendation.text}</p>
                </div>
                <Link
                  to={courseRecommendation.href || '/courses?openRecommendation=1'}
                  className="recommendation-btn showloader"
                >
                  {courseRecommendation.buttonLabel}
                </Link>
              </div>
            </div>

            <h3>{airlinesHeading}</h3>
            <div className="list-of-airlines">
              {airlines.map((airline, index) => (
                <a
                  key={index}
                  href={airline.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`card tooltip-btn ${airline.name || airline.logo} ${airline.className || ''}`}
                >
                  <span className="tooltip-txt">{airline.url}</span>
                </a>
              ))}
            </div>

            <div className="text">
              {closingText.split('\n').map((line, idx, arr) => (
                <span key={idx}>
                  {line}
                  {idx < arr.length - 1 ? (
                    <>
                      <br />
                    </>
                  ) : null}
                </span>
              ))}
              <br /><br />
              <Link to="/contact" className="showloader">Contact us</Link> and turn your passion into profession!
            </div>
          </div>

          <div className="rt">
            <div className="ceo-speaks">
              <h3>MD's Message</h3>
              <div className="message-block">
                <div className="ceo-photo"></div>
                <div className="message">
                  <strong>At Kite Aviation, we are committed to shaping confident, industry-ready professionals in the fields of aviation and hospitality.</strong> Our goal is to provide not just training, but a transformative learning experience that prepares students to thrive in global careers. With expert faculty, practical exposure, and a focus on personality development, we empower every student to rise with excellence and professionalism.
                  <br /><br />Your journey to the skies and beyond starts here.
                  <br /><br />
                  <strong className="sign">Jyothish Ramachandran</strong>
                  <span>Managing Director (MD)</span>
                </div>
              </div>
            </div>

            <div className="text-box iata-certified-card">
              <div className="iata-certified-card-inner">
                <div className="iata-certified-logo" aria-hidden />
                <div className="iata-certified-text">
                  <h4>IATA Certified Partner</h4>
                  <p>Kite Institute is an IATA certified training partner, delivering globally recognized aviation and hospitality programs.</p>
                </div>
              </div>
              <div className="verify-certificate-card-inner">
                <div className="verify-certificate-logo" aria-hidden />
                <div className="iata-certified-text">
                  <h4>Verify Student Certificate</h4>
                  <p>Verify Kite Institute student course certificates instantly through our secure online portal.</p>
                  <a
                    href="https://kiteaviation.in/students/verify"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="verify-certificate-link"
                  >
                    Verify Certificate
                  </a>
                </div>
              </div>
            </div>

            <UsefulLinksSection />

            <h3>Our Vision</h3>
            <div className="text">
              <strong>Pioneering the Future of Aviation <br />Training Excellence in India</strong>
              <br /><br />
              At Kite Institute of Aviation & Hospitality, we are committed to providing top-notch education and hands-on training that align with global industry standards. Our curriculum blends theoretical knowledge with real-world application, ensuring students are equipped with the skills and expertise required to excel in the aviation and hospitality sectors.
            </div>

            <h3>Our Mission</h3>
            <div className="text">
              At Kite Institute of Aviation & Hospitality, our mission is to empower aspiring professionals with world-class education, hands-on training, and industry exposure, preparing them for successful careers in aviation and hospitality.
            </div>
          </div>
        </div>
      </div>

      {/* Course Offerings Section */}
      {/* <CourseSection /> */}

      {/* Why Choose Kite Aviation */}
      <section className="content-box why-choose-kite">
        <div className="content-block">
          <div className="why-choose-kite-head">
            <span className="eyebrow">{whyChooseSection.eyebrow}</span>
            <h3>{whyChooseSection.heading}</h3>
            <p>
              {whyChooseSection.intro}
            </p>
          </div>

          <div className="why-choose-kite-grid">
            {whyChooseCards.map((card) => (
              <button
                key={card.id}
                type="button"
                className="why-choose-kite-card"
                onClick={() => setActiveWhyChooseCard(card)}
              >
                <span className="why-choose-kite-card-index">{String(card.id).padStart(2, '0')}</span>
                <h4>{card.title}</h4>
                <p>{card.shortText}</p>
                <span className="why-choose-kite-card-cta">Click to know more</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <StudentSuccessStoriesSection />

      {activeWhyChooseCard && (
        <div
          className="why-choose-kite-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={activeWhyChooseCard.title}
          onClick={() => setActiveWhyChooseCard(null)}
        >
          <div className="why-choose-kite-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="why-choose-kite-modal-close"
              onClick={() => setActiveWhyChooseCard(null)}
              aria-label="Close details"
            >
              ×
            </button>

            <div className="why-choose-kite-modal-photo">
              <img src={cmsAssetUrl(activeWhyChooseCard.image)} alt={activeWhyChooseCard.title} />
            </div>

            <div className="why-choose-kite-modal-content">
              <h4>{activeWhyChooseCard.title}</h4>
              <p>{activeWhyChooseCard.shortText}</p>
              <ul>
                {activeWhyChooseCard.details.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Latest News Section */}
      <RecentNewsSection limit={4} layout="full" />

      <HomeFaqCtaSection />

      {/* Video Gallery Section */}
      <VideoGallery />
    </>
  );
}

export default Home;
