'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import CourseSection from '../components/CourseSection';
import RecentNewsSection from '../components/RecentNewsSection';
import VideoGallery from '../components/VideoGallery';
import UsefulLinksSection from '../components/UsefulLinksSection';
import StudentSuccessStoriesSection from '../components/StudentSuccessStoriesSection';
import HomeFaqCtaSection from '../components/HomeFaqCtaSection';
import AirlinesList from '../components/AirlinesList';

// Get base URL for assets
const getAssetUrl = (path) => `${'/'}${path}`;

function Home() {
  const [typing1Text, setTyping1Text] = useState('');
  const [typing2Text, setTyping2Text] = useState('');
  const [circlesVisible, setCirclesVisible] = useState(false);
  const [visibleCircles, setVisibleCircles] = useState([]);
  const [showGoogleReviews, setShowGoogleReviews] = useState(false);
  const [activeWhyChooseCard, setActiveWhyChooseCard] = useState(null);

  const courses = [
    { title: 'Kite Diploma Course in Aviation, Hospitality and Travel Management', duration: '12 Months, 5 days/week (Mon- Fri) 2 hours' },
    { title: 'Airport Operations Fundamentals', duration: '6 Months, 5 days/week (Mon-Fri) 2 hours' },
    { title: 'Passenger Ground Services Course', duration: '6 Months, 5 days/week (Mon-Fri) 2 hours' },
    { title: 'Airport Ramp Services Training', duration: '6 Months, 5 days/week (Mon-Fri) 2 hours' },
    { title: 'Foundation in Travel & Tourism with Amadeus', duration: '8 Months, 5 days/week (Mon-Fri) 2 hours' },
    { title: 'Cargo Introductory Course', duration: '6 Months, 5 days/week (Mon-Fri) 2 hours' }
  ];

  const whyChooseCards = [
    {
      id: 1,
      title: 'Placement-First Learning',
      shortText: 'Focused preparation aligned to airline, airport, and hospitality hiring requirements.',
      image: 'images/himg-1.jpg',
      details: [
        'Structured preparation for real interview rounds and group discussions.',
        'Industry expectation mapping for airport, airline, and hospitality roles.',
        'Resume support and career guidance from our placement-oriented mentors.'
      ]
    },
    {
      id: 2,
      title: 'Interview & Grooming Mastery',
      shortText: 'Mock interviews, communication drills, and professional grooming for real-world success.',
      image: 'images/himg-2.jpg',
      details: [
        'Personal grooming sessions aligned with airline and hospitality standards.',
        'Confidence-building mock interviews with practical feedback.',
        'Body language, communication, and etiquette training for career readiness.'
      ]
    },
    {
      id: 3,
      title: 'Mentors from the Industry',
      shortText: 'Learn from trainers with practical aviation and hospitality operations experience.',
      image: 'images/himg-3.jpg',
      details: [
        'Sessions led by professionals with hands-on operational exposure.',
        'Real case studies from aviation, airport, and hospitality workflows.',
        'Guidance on role expectations, work culture, and growth pathways.'
      ]
    },
    {
      id: 4,
      title: 'Practical Exposure',
      shortText: 'Hands-on modules and scenario-based training designed around actual workplace workflows.',
      image: 'images/himg-5.jpg',
      details: [
        'Practice-oriented modules that simulate real service environments.',
        'Operational scenarios to build problem-solving and teamwork.',
        'Job-readiness focus to help students transition confidently into industry roles.'
      ]
    }
  ];

  useEffect(() => {
    // Typing effect for first line - faster and smoother
    const text1 = "India's Most Trusted";
    let i = 0;
    const typeInterval1 = setInterval(() => {
      if (i <= text1.length) {
        setTyping1Text(text1.substring(0, i));
        i++;
      } else {
        clearInterval(typeInterval1);
        // Start second typing effect
        const text2 = "Aviation Training Institute";
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
            const circleIndices = [0, 1, 2, 3, 4];
            circleIndices.forEach((index, idx) => {
              setTimeout(() => {
                setVisibleCircles((prev) => [...prev, index]);
                // Show google reviews after last circle
                if (index === 4) {
                  setTimeout(() => {
                    setShowGoogleReviews(true);
                  }, 200); // 200ms delay after last circle
                }
              }, idx * 150); // 150ms delay between each circle
            });
          }
        }, 35); // Faster: 30ms per character (was 45ms)
      }
    }, 35); // Faster: 20ms per character (was 35ms)

    return () => {
      clearInterval(typeInterval1);
    };
  }, []);

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

  const handleOpenCampusTour = () => {
    const event = new CustomEvent('openCampusTour');
    window.dispatchEvent(event);
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
            <Link to="/about" className={`circle tooltip-btn ${visibleCircles.includes(0) ? 'zoom-in' : ''}`}>
              <span className="for-hover">
                <span className="desc-tbl">
                  <span className="ico"><img src={getAssetUrl("images/about-icon.svg")} alt="About" /></span>
                  <small>Discover our journey, values, and milestones that shape who we are today.</small>
                </span>
              </span>
              <img src={getAssetUrl("images/himg-1.jpg")} alt="Our Story" loading="eager" key="himg-1" />
              <span className="tooltip-txt">Our Story</span>
            </Link>

            <Link to="/student-hub" className={`circle tooltip-btn ${visibleCircles.includes(1) ? 'zoom-in' : ''}`}>
              <span className="new-ribbon">NEW</span>
              <span className="for-hover">
                <span className="desc-tbl">
                  <span className="ico"><img src={getAssetUrl("images/play-icon.svg")} alt="Student Hub" /></span>
                  <small>Discover exciting activities and events designed for future aviation achievers.</small>
                </span>
              </span>
              <img src={getAssetUrl("images/himg-2.jpg")} alt="Student Hub" loading="eager" key="himg-2" />
              <span className="tooltip-txt">Student Hub</span>
            </Link>

            <Link to="/gallery" className={`circle tooltip-btn ${visibleCircles.includes(2) ? 'zoom-in' : ''}`}>
              <span className="for-hover">
                <span className="desc-tbl">
                  <span className="ico"><img src={getAssetUrl("images/gallery-icon.svg")} alt="Gallery" /></span>
                  <small>Explore photos and videos capturing our journey and moments.</small>
                </span>
              </span>
              <img src={getAssetUrl("images/himg-3.jpg")} alt="Life at Kite" loading="eager" key="himg-3" />
              <span className="tooltip-txt">Life at Kite</span>
            </Link>

            <a 
              className={`circle tooltip-btn virtual-agent-btn ${visibleCircles.includes(3) ? 'zoom-in' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                const event = new CustomEvent('openChatbot');
                window.dispatchEvent(event);
              }}
              style={{ cursor: 'pointer' }}
            >
              <span className="for-hover">
                <span className="desc-tbl">
                  <span className="ico"><img src={getAssetUrl("images/talk-icon.svg")} alt="Virtual Agent" /></span>
                  <small>Get instant answers and guidance from our virtual assistant.</small>
                </span>
              </span>
              <img src={getAssetUrl("images/himg-4.jpg")} alt="Virtual Agent" loading="eager" key="himg-4" />
              <span className="tooltip-txt">Talk to Virtual Agent</span>
            </a>

            <a 
              className={`circle tooltip-btn campus-tour-btn ${visibleCircles.includes(4) ? 'zoom-in' : ''}`}
              onClick={handleOpenCampusTour}
              style={{ cursor: 'pointer' }}
            >
              <span className="for-hover">
                <span className="desc-tbl">
                  <span className="ico"><img src={getAssetUrl("images/student-icon.svg")} alt="Campus" /></span>
                  <small>Take a quick tour and explore our vibrant campus in action.</small>
                </span>
              </span>
              <img src={getAssetUrl("images/himg-5.jpg")} alt="Campus Tour" loading="eager" key="himg-5" />
              <span className="tooltip-txt">Campus Tour</span>
            </a>
          </div>

          {/* Google Reviews Section */}
          <div className={`google-reviews-section ${showGoogleReviews ? 'show' : ''}`}>
            <div className="google-reviews-container">
              <h2>Google’s 5-Star Excellence!</h2>
              <span>Don't just take our word for it - see what our students & parents have to say about their experience at Kite.</span>
              <a 
                href="https://share.google/MKrE5AOIGlQr0vC6l" 
                target="_blank" 
                rel="noopener noreferrer"
                className="google-review-button"
              >
                <img src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" alt="Google" className="google-logo" />
                View All Reviews on Google
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
              <span className="sml">Kite Institute of Aviation & Hospitality</span> India's <span className="marking">prestigious</span> aviation training institute based in Bangalore, dedicated to providing world-class programs that equip aspiring professionals for successful careers in airlines, airports, and the hospitality industry.
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
                  <h4>Can I suggest a course for you?</h4>
                  <p>Answer a few quick questions and we'll recommend the perfect course based on your interests and qualifications.</p>
                </div>
                <Link 
                  to="/courses?openRecommendation=1" 
                  className="recommendation-btn showloader"
                >
                  Find My Course
                </Link>
              </div>
            </div>

            <h3>Careers Take Off with Top Airlines</h3>
            <AirlinesList />

            <div className="text">
              At Kite Institute of Aviation & Hospitality, we believe that the sky is not the limit—it's just the beginning.
              <br />
              Join us and take your first step toward a successful and rewarding career in the aviation and hospitality industry.
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
                  <Link to="/students/verify" className="verify-certificate-link">
                    Verify Certificate
                  </Link>
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
            <span className="eyebrow">Kite Advantage</span>
            <h3>Why Choose Kite Aviation</h3>
            <p>
              We blend industry-focused training, personal mentorship, and practical exposure so students become
              confident professionals from day one.
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
              <img src={getAssetUrl(activeWhyChooseCard.image)} alt={activeWhyChooseCard.title} />
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
