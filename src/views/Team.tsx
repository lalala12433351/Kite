'use client';

import { useEffect } from 'react';
import { Link } from '@/lib/router';
import { useCmsContent, cmsAssetUrl } from '@/src/hooks/useCmsContent';
import teamFallback from '../../data/team.json';

function mapLeader(member) {
  return {
    name: member.name,
    position: member.role || member.position,
    bio: member.bio,
    email: member.email,
    image: member.photo || member.image,
    initial: member.name?.charAt(0) || '',
  };
}

function Team() {
  const { data: teamDoc } = useCmsContent('team', teamFallback);
  const hero = teamDoc?.hero || teamFallback.hero;
  const cta = teamDoc?.cta || teamFallback.cta;
  const level1Team = (teamDoc?.leadership || teamFallback.leadership).map(mapLeader);
  const level2Team = (teamDoc?.trainers || teamFallback.trainers).map(mapLeader);
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = document.querySelectorAll<HTMLElement>('.team-card');
    if (reduceMotion) {
      cards.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return undefined;
    }

    cards.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'scale(0.96)';
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    });

    const lazyLoadObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const card = entry.target as HTMLElement;
        const img = card.querySelector('img');

        if (entry.isIntersecting) {
          if (img && img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
          lazyLoadObserver.unobserve(card);
        }
      });
    }, {
      rootMargin: '50px',
      threshold: 0.01
    });

    // Observe all team cards
    cards.forEach((card) => {
      lazyLoadObserver.observe(card);
    });

    // Handle flip cards for leadership team
    const leadershipCards = document.querySelectorAll<HTMLElement>('.team-card-leadership');
    leadershipCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('flipped');
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('flipped');
      });
    });

    return () => {
      lazyLoadObserver.disconnect();
      leadershipCards.forEach((card) => {
        card.removeEventListener('mouseenter', () => {});
        card.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);

  return (
    <div className="content-box about team-modern">
      <div className="content-block">
        <div className="lt">
          <div className="our-team-modern">
            {/* Hero Section */}
            <div className="team-hero">
              <h1 className="team-hero-title" dangerouslySetInnerHTML={{ __html: hero.titleHtml }} />
              <p className="team-hero-subtitle">{hero.subtitle}</p>
              <p className="team-hero-description">{hero.description}</p>
            </div>

            {/* Level 1 - Leadership */}
            <div className="team-section">
              <div className="team-section-header">
                <h2 className="section-title">Leadership Team</h2>
                <div className="section-divider"></div>
              </div>
              <div className="team-grid team-grid-leadership">
                {level1Team.map((member, index) => (
                  <div key={index} className="team-card team-card-leadership">
                    <div className="team-card-inner">
                      <div className="team-card-front">
                        <div className="team-image-wrapper">
                          <img 
                            data-src={cmsAssetUrl(member.image)}
                            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3C/svg%3E"
                            alt={member.name}
                            className="team-image"
                          />
                          <div className="team-image-overlay"></div>
                        </div>
                        <div className="team-card-content">
                          <h3 className="team-name">{member.name}</h3>
                          <p className="team-position">{member.position}</p>
                        </div>
                      </div>
                      <div className="team-card-back">
                        <div className="team-card-back-content">
                          <h3 className="team-name">{member.name}</h3>
                          <p className="team-position">{member.position}</p>
                          <p className="team-bio">{member.bio}</p>
                          {member.email && (
                            <a 
                              href={`mailto:${member.email}`} 
                              className="team-email"
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                              </svg>
                              {member.email}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Level 2 - Staff */}
            <div className="team-section">
              <div className="team-grid team-grid-staff">
                {level2Team.map((member, index) => (
                  <div key={index} className="team-card team-card-staff">
                    <div className="team-image-wrapper">
                      <img 
                        data-src={cmsAssetUrl(member.image)}
                        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3C/svg%3E"
                        alt={member.name}
                        className="team-image"
                      />
                    </div>
                    <div className="team-card-content">
                      <div className="team-name-wrapper">
                        <h3 className="team-name">{member.name}</h3>
                      </div>
                      <p className="team-position">{member.position}</p>
                      <p className="team-bio">{member.bio}</p>
                      
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="team-cta">
              <Link to={cta.href} className="team-cta-button showloader">
                <span>{cta.label}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Team;
