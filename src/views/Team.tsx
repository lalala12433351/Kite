'use client';

import { useEffect } from 'react';
import { Link } from '@/lib/router';

function Team() {
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

  const level1Team = [
    {
      name: 'Jyothish Ramachandran',
      initial: 'J',
      position: 'Managing Director (MD)',
      bio: 'Leads Kite with vision, expertise, and a passion for shaping future aviation and hospitality leaders.',
      email: 'md@kiteaviation.in',
      image: 'images/jyothish_ramachandran.png'
    },
    {
      name: 'Jabir C',
      initial: 'J',
      position: 'Chief Executive Officer (CEO)',
      bio: 'Leads Kite with vision and a passion for excellence.',
      email: 'ceo@kiteaviation.in',
      image: 'images/jabir-c.png'
    },
    {
      name: 'Faisal C',
      initial: 'F',
      position: 'Chief Operating Officer (COO)',
      bio: 'Transforms vision into action, ensuring every department operates with precision and purpose.',
      email: 'coo@kiteaviation.in',
      image: 'images/fisal.png'
    },
    {
      name: 'Sugesh Raghavan',
      initial: 'S',
      position: 'Chief Technology Officer (CTO)',
      bio: 'Leads Kite\'s technology innovations to enhance training and operational excellence.',
      email: 'cto@kiteaviation.in',
      image: 'images/sugesh.png'
    }
  ];

  const level2Team = [
    {
      name: 'Rajesh Manuel',
      initial: 'R',
      position: 'Director of Sales',
      bio: 'Drives Kite\'s growth by building strong partnerships and expanding market reach.',
      email: 'rajesh@kiteaviation.in',
      image: 'images/rajesh.png'
    },
    {
      name: 'Syeda Samrin Shams',
      initial: 'S',
      position: 'Head of Department (HOD)',
      bio: 'Leads the department with expertise, ensuring excellence in training and student success.',
      email: 'hod@kiteaviation.in',
      image: 'images/shamrin.png'
    },
    {
      name: 'Anasuya Menon',
      initial: 'A',
      position: 'Trainer',
      bio: 'With 10+ years of expertise, I build confidence, communication, and grooming skills that prepare learners for professional success.',
      image: 'images/anasuya.png'
    },
    {
      name: 'Debashrita Das',
      initial: 'A',
      position: 'Trainer',
      bio: 'Ex-Cabin Crew turned Trainer, bringing global service excellence, grooming expertise, and soft skills mastery into the classroom.',
      image: 'images/debashritadas.png'
    },
    {
      name: 'Arun Kurumbaya',
      initial: 'A',
      position: 'Trainer',
      bio: 'Brings extensive experience to training, combining real-world insights, interactive methods, and mentorship to build student confidence and career readiness.',
      image: 'images/arun.png'
    },
    {
      name: 'Leo Lawrence',
      initial: 'L',
      position: 'Trainer',
      bio: 'Passionate English teacher in language, literature, and ESL, advocating "Language Acquisition over Language Learning." Skilled in TESOL, literary analysis, and tech-based teaching to engage students.',
      image: 'images/leo.png'
    }
  ];

  return (
    <div className="content-box about team-modern">
      <div className="content-block">
        <div className="lt">
          <div className="our-team-modern">
            {/* Hero Section */}
            <div className="team-hero">
              <h1 className="team-hero-title">
                <span className="gradient-text">The Crew</span> Behind Kite
              </h1>
              <p className="team-hero-subtitle">
                At Kite, our team is a blend of seasoned aviation professionals, skilled trainers, and passionate mentors who share one mission – to shape the next generation of aviation and hospitality leaders.
              </p>
              <p className="team-hero-description">
                With years of industry experience and a commitment to excellence, our faculty brings real-world insights into every training session, ensuring our students gain not just knowledge, but the confidence and skills to excel.
              </p>
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
                            data-src={member.image}
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
                        data-src={member.image}
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
              <Link to="/gallery" className="team-cta-button showloader">
                <span>Meet More of Our Crowd</span>
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
