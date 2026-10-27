'use client';

import { useState, useEffect, useRef } from 'react';
import UsefulLinksSection from '../components/UsefulLinksSection';

const getAssetUrl = (path) => `${'/'}${path}`;

const placementVideos = [
  { id: 'placement-1', thumbnail: getAssetUrl('icons/nilani.jpg'), videoSrc: getAssetUrl('gallery/placement-video2.webm'), title: 'Nilani', company: 'IndiGo', airlineLogo: 'indigo' },
  { id: 'placement-2', thumbnail: getAssetUrl('icons/pumin.jpg'), videoSrc: getAssetUrl('gallery/placement-video1.webm'), title: 'Pumin', company: 'Air India', airlineLogo: 'airindia' },
  { id: 'placement-3', thumbnail: getAssetUrl('icons/noorjahan.jpg'), videoSrc: getAssetUrl('gallery/placement-video3.webm'), title: 'Noorjahan', company: 'Air India', airlineLogo: 'airindia' },
];

function Placement() {
  const [playingVideo, setPlayingVideo] = useState(null);
  const centerVideoRef = useRef(null);
  const currentVideo = playingVideo ? placementVideos.find((v) => v.id === playingVideo) : null;

  useEffect(() => {
    if (!playingVideo || !centerVideoRef.current || !currentVideo) return;
    centerVideoRef.current.src = currentVideo.videoSrc;
    centerVideoRef.current.play().catch(() => {});
    return () => {
      if (centerVideoRef.current) {
        centerVideoRef.current.pause();
        centerVideoRef.current.currentTime = 0;
      }
    };
  }, [playingVideo, currentVideo?.videoSrc]);

  const handleClosePlacementVideo = (e) => {
    e?.stopPropagation();
    if (centerVideoRef.current) {
      centerVideoRef.current.pause();
      centerVideoRef.current.currentTime = 0;
    }
    setPlayingVideo(null);
  };

  const openEnquiryForm = () => {
    window.dispatchEvent(new CustomEvent('openEnquiryForm', { detail: { title: 'Enquiry Form' } }));
  };

  useEffect(() => {
    // Set initial styles
    const items = document.querySelectorAll<HTMLElement>('.profile-list .item');
    items.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'scale(0)';
      el.style.transition = 'all 0.4s ease';
    });

    // Lazy loading with Intersection Observer
    const lazyLoadObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const item = entry.target as HTMLElement;
        const img = item.querySelector('img');
        
        if (entry.isIntersecting) {
          // Load image if it has data-src
          if (img && img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          // Show element with animation
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        } else {
          // Hide element when out of viewport
          item.style.opacity = '0';
          item.style.transform = 'scale(0)';
        }
      });
    }, {
      rootMargin: '50px', // Start loading 50px before entering viewport
      threshold: 0.01
    });

    // Observe all profile items
    items.forEach((item) => {
      lazyLoadObserver.observe(item);
    });

    return () => {
      lazyLoadObserver.disconnect();
    };
  }, []);

  const placements = [
    { name: 'Anuradha S', company: 'Adarsh Hamilton', image: 'images/placement-stories/anuradha.png' },
    { name: 'Nilani S R', company: 'Air India', image: 'images/placement-stories/nilani.png' },
    { name: 'Keerthana R', company: 'AirIndia Sats', image: 'images/placement-stories/keerthana.png' },
    { name: 'Pumin Konyak', company: 'IndiGo', image: 'images/placement-stories/pumin.png' },
    { name: 'Mahesh ', company: 'Adarsh Hamilton', image: 'images/placement-stories/mahesh.png' },
    { name: 'Noorjahan', company: 'AirIndia Sats', image: 'images/placement-stories/noorjahan.png' },
    { name: 'Vennila K', company: 'AirIndia Sats', image: 'images/placement-stories/vennila.png' },

    { name: 'Sharadhi M', company: 'AirIndia Sats', image: 'images/placement-stories/sharadhi.png' },
    { name: 'Sanggaiheung Chuilo', company: 'Indigo', image: 'images/placement-stories/sangee.png' },
    { name: 'Shashank', company: 'The Elanza', image: 'images/placement-stories/shashank.png' },
  ];

  const airlines = [
    { name: 'airindia', url: 'https://www.airindia.com/' },
    { name: 'emirates', url: 'https://www.emirates.com/ie/english/' },
    { name: 'etihad', url: 'https://www.etihad.com/' },
    { name: 'qatar', url: 'https://www.qatarairways.com/' },
    { name: 'kuwait', url: 'https://www.kuwaitairways.com/en' },
    { name: 'indigo', url: 'https://www.goindigo.in/' },
    { name: 'spice', url: 'https://www.spicejet.com/' },
    { name: 'airasia', url: 'https://www.airasia.com/' },
    { name: 'akasaair', url: 'https://www.akasaair.com/' },
    { name: 'starair', url: 'https://www.starair.in/' },
    { name: 'vistara', url: 'https://www.airvistara.com/' },
    { name: 'airindiaexpress', url: 'https://www.airindiaexpress.com/' },
    { name: 'celebi', url: 'https://www.celebiaviation.com/' },
    { name: 'airarabia', url: 'https://www.airarabia.com/' },
    { name: 'american', url: 'https://www.aa.com/homePage.do?locale=en_US' },
    { name: 'airindiasats', url: 'https://www.aisats.in/' },
    { name: 'bwfs', url: 'https://www.bird.in/businessverticals/aviation-services.html' },
    { name: 'gaar', url: 'https://www.gmrgroup.in/airports/' },
    { name: 'itc', url: 'https://www.itcportal.com/' },
    { name: 'harley', url: 'https://www.harley-davidson.com/', className: 'auto' },
    { name: 'easymytrip', url: 'https://www.easemytrip.ae/', className: 'travel' },
    { name: 'vfs', url: 'https://www.vfsglobal.com/en/individuals/index.html', className: 'travel' },
    { name: 'parkhyat', url: 'https://www.hyatt.com/', className: 'hotel' },
    { name: 'theleela', url: 'https://www.theleela.com/', className: 'hotel' },
    { name: 'obroi', url: 'https://www.oberoihotels.com/', className: 'hotel' },
    { name: 'taj', url: 'https://www.tajhotels.com/en-in', className: 'hotel' },
    { name: 'jw', url: 'https://www.jw-marriott.marriott.com/', className: 'hotel' },
    { name: 'radisson', url: 'https://www.radissonhotels.com/', className: 'hotel' },
    { name: 'westin', url: 'https://www.westin.marriott.com/', className: 'hotel' }
  ];

  return (
    <div className="content placement" id="placement">
      <div className="content-block">
        <div className="lt">
          <h1>Placement</h1>
          <div className="placement-page">
            <div className="text-box">
              <h3>Your Gateway to a Successful Career</h3>
              At Kite Institute of Aviation & Hospitality, we take immense pride in shaping the careers of our students by providing excellent training and placement assistance. Our strong industry connections and dedicated placement cell ensure that our graduates step into the professional world with confidence and expertise.
            </div>

            <div className="text-box placement-videos">
              <h3>Recent Placements</h3>
              {playingVideo && currentVideo && (
                <>
                  <div
                    className="video-testimonial-backdrop"
                    onClick={handleClosePlacementVideo}
                    aria-hidden
                  />
                  <div className="video-player-holder">
                    <button type="button" className="video-player-close" onClick={handleClosePlacementVideo} aria-label="Close">✕</button>
                    <video
                      ref={centerVideoRef}
                      src={currentVideo.videoSrc}
                      controls
                      onEnded={() => setPlayingVideo(null)}
                    />
                  </div>
                </>
              )}
              <div className="video-testimonial">
                <div className="carousel">
                  {placementVideos.map((video) => (
                    <div
                      key={video.id}
                      className="testi-card"
                      onClick={() => setPlayingVideo(video.id)}
                    >
                      <div className="testi-card-thumb">
                        <img src={video.thumbnail} alt={video.title} />
                        <div className="testi-card-content">
                          <span>Placement</span>
                          <h3>{video.title}</h3>
                        </div>
                      </div>
                      <div className="placement-video-details">
                        <span className="placement-video-company">{video.company}</span>
                        {video.airlineLogo && (
                          <div className={`placement-video-logo ${video.airlineLogo}`} title={video.company} aria-hidden />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-box profile">
              <h3>Placements</h3>
              <div className="profile-list">
                {placements.map((student, index) => (
                  <a key={index} className="item">
                    <img 
                      data-src={student.image}
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3C/svg%3E"
                      alt="Student Photo" 
                    />
                    <span className="name">
                      {student.name}
                      <span>{student.company}</span>
                    </span>
                  </a>
                ))}
                <div
                  className="item placement-cta-card"
                  onClick={openEnquiryForm}
                  onKeyDown={(e) => e.key === 'Enter' && openEnquiryForm()}
                  role="button"
                  tabIndex={0}
                  aria-label="Open enquiry form to enroll"
                >
                  <div className="placement-cta-card-thumb">
                    <div className="placement-cta-card-content">
                      <p className="placement-cta-card-text">You Could Be Next!</p>
                      <span className="placement-cta-card-action">Enroll now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-box">
              <h3>Placement Partners</h3>
              <span>We are associated with some of the most prestigious names in the aviation and hospitality sectors, including:</span>
              <div className="list-of-airlines">
                {airlines.map((airline, index) => (
                  <a
                    key={index}
                    href={airline.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`card tooltip-btn ${airline.name} ${airline.className || ''}`}
                  >
                    <span className="tooltip-txt">{airline.url}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rt">
          <div className="text-box">
            <h3>Why Choose Kite for Placements?</h3>
            <ul>
              <li><strong>100% Placement Assistance</strong> We guide and support students in securing job opportunities in leading airlines, hotels, travel & tourism companies, and customer service industries.</li>
              <li><strong>Industry Tie-ups</strong> Collaborations with top aviation, hospitality, and travel management companies.</li>
              <li><strong>Skill Development & Training</strong> Specialized workshops, mock interviews, soft skills enhancement, and resume-building sessions.</li>
              <li><strong>Internships & On-the-Job Training</strong> Practical exposure through internships with reputed brands to prepare students for real-world challenges.</li>
            </ul>
          </div>

          <div className="text-box">
            <h3>Success Stories</h3>
            Our alumni have successfully secured positions in renowned organizations worldwide. Their journeys inspire our current students to aim high and achieve their career aspirations.
            
            <h3>Join Us & Take Off to a Bright Future!</h3>
            Enroll at Kite Institute of Aviation & Hospitality and let us help you achieve your dream career. Contact our placement cell today to explore exciting career opportunities!
          </div>

          <UsefulLinksSection />
        </div>
      </div>
    </div>
  );
}

export default Placement;
