'use client';

import { Link } from '@/lib/router';

const getAssetUrl = (path) => `${'/'}${path}`;

function UsefulLinksSection() {
  const openCampusTour = () => {
    window.dispatchEvent(new CustomEvent('openCampusTour'));
  };

  const openVirtualAssistant = () => {
    window.dispatchEvent(new CustomEvent('openChatbot'));
  };

  return (
    <div className="text-box useful-links-section">
      <h3>Useful Links</h3>
      <div className="useful-links-grid">
        <Link to="/students/verify" className="cmall-link-card">
          <span className="cmall-link-card__icon" aria-hidden>
            <img src={getAssetUrl('icons/certificate-check.svg')} alt="" loading="lazy" />
          </span>
          <span className="cmall-link-card__text">
            <strong>Verify Certificate</strong>
            <small>Verify student certificates online</small>
          </span>
        </Link>

        <button type="button" onClick={openCampusTour} className="cmall-link-card">
          <span className="cmall-link-card__icon" aria-hidden>
            <img src={getAssetUrl('images/student-icon.svg')} alt="" loading="lazy" />
          </span>
          <span className="cmall-link-card__text">
            <strong>Virtual Tour</strong>
            <small>Explore our campus in 1 minute</small>
          </span>
        </button>

        <Link to="/student-hub" className="cmall-link-card showloader">
          <span className="cmall-link-card__icon" aria-hidden>
            <img src={getAssetUrl('images/play-icon.svg')} alt="" loading="lazy" />
          </span>
          <span className="cmall-link-card__text">
            <strong>Student Hub</strong>
            <small>Events, highlights &amp; activities</small>
          </span>
        </Link>

        <button type="button" onClick={openVirtualAssistant} className="cmall-link-card">
          <span className="cmall-link-card__icon" aria-hidden>
            <img src={getAssetUrl('images/talk-icon.svg')} alt="" loading="lazy" />
          </span>
          <span className="cmall-link-card__text">
            <strong>Virtual Assistant</strong>
            <small>Get instant answers</small>
          </span>
        </button>
      </div>
    </div>
  );
}

export default UsefulLinksSection;

