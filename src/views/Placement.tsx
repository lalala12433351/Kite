'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import UsefulLinksSection from '../components/UsefulLinksSection';
import { useCmsContent, cmsAssetUrl } from '@/src/hooks/useCmsContent';
import placementFallback from '../../data/placement.json';

function Placement() {
  const { data: placement } = useCmsContent('placement', placementFallback);
  const hero = placement?.hero || placementFallback.hero;
  const videosHeading = placement?.videosHeading || placementFallback.videosHeading;
  const stories = placement?.stories?.length ? placement.stories : placementFallback.stories;
  const ctaCard = placement?.ctaCard || placementFallback.ctaCard;
  const partnersHeading = placement?.partnersHeading || placementFallback.partnersHeading;
  const partnersIntro = placement?.partnersIntro || placementFallback.partnersIntro;
  const airlines = placement?.airlines?.length ? placement.airlines : placementFallback.airlines;
  const whyChoose = placement?.whyChoose || placementFallback.whyChoose;
  const successStories = placement?.successStories || placementFallback.successStories;

  const placementVideos = useMemo(() => {
    const source = placement?.videos?.length ? placement.videos : placementFallback.videos;
    return source.map((video) => ({
      id: video.id,
      thumbnail: cmsAssetUrl(video.thumb),
      videoSrc: cmsAssetUrl(video.src),
      title: video.title,
      company: video.company,
      airlineLogo: video.airlineLogo,
    }));
  }, [placement?.videos]);
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

  const placements = stories;

  return (
    <div className="content placement" id="placement">
      <div className="content-block">
        <div className="lt">
          <h1>{hero.title}</h1>
          <div className="placement-page">
            <div className="text-box">
              <h3>{hero.introHeading}</h3>
              {hero.intro}
            </div>

            <div className="text-box placement-videos">
              <h3>{videosHeading}</h3>
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
                      data-src={cmsAssetUrl(student.image)}
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
                      <p className="placement-cta-card-text">{ctaCard.text}</p>
                      <span className="placement-cta-card-action">{ctaCard.actionLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-box">
              <h3>{partnersHeading}</h3>
              <span>{partnersIntro}</span>
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
            </div>
          </div>
        </div>

        <div className="rt">
          <div className="text-box">
            <h3>{whyChoose.heading}</h3>
            <ul>
              {whyChoose.items.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong> {item.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-box">
            <h3>{successStories.heading}</h3>
            {successStories.body}

            <h3>{successStories.closingHeading}</h3>
            {successStories.closingBody}
          </div>

          <UsefulLinksSection />
        </div>
      </div>
    </div>
  );
}

export default Placement;
