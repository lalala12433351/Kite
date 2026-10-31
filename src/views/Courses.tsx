'use client';

import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from '@/lib/router';
import CourseSection from '../components/CourseSection';
import CourseRecommendation from '../components/CourseRecommendation';
import UsefulLinksSection from '../components/UsefulLinksSection';
import { getAssetUrl } from '../utils/galleryData';

const placementVideos = [
  { id: 'placement-1', thumbnail: getAssetUrl('icons/nilani.jpg'), videoSrc: getAssetUrl('gallery/placement-video2.webm'), title: 'Nilani', company: 'IndiGo', airlineLogo: 'indigo' },
  { id: 'placement-2', thumbnail: getAssetUrl('icons/pumin.jpg'), videoSrc: getAssetUrl('gallery/placement-video1.webm'), title: 'Pumin', company: 'Air India', airlineLogo: 'airindia' }
];

function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [playingPlacementVideo, setPlayingPlacementVideo] = useState(null);
  const centerPlacementVideoRef = useRef(null);
  const currentPlacementVideo = playingPlacementVideo ? placementVideos.find((v) => v.id === playingPlacementVideo) : null;

  useEffect(() => {
    if (!playingPlacementVideo || !centerPlacementVideoRef.current || !currentPlacementVideo) return;
    centerPlacementVideoRef.current.src = currentPlacementVideo.videoSrc;
    centerPlacementVideoRef.current.play().catch(() => {});
    return () => {
      if (centerPlacementVideoRef.current) {
        centerPlacementVideoRef.current.pause();
        centerPlacementVideoRef.current.currentTime = 0;
      }
    };
  }, [playingPlacementVideo, currentPlacementVideo?.videoSrc]);

  const handleClosePlacementVideo = (e) => {
    e?.stopPropagation();
    if (centerPlacementVideoRef.current) {
      centerPlacementVideoRef.current.pause();
      centerPlacementVideoRef.current.currentTime = 0;
    }
    setPlayingPlacementVideo(null);
  };

  useEffect(() => {
    if (searchParams.get('openRecommendation') === '1') {
      setShowRecommendationModal(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    if (showRecommendationModal) {
      document.body.classList.add('popup-opened');
    } else {
      document.body.classList.remove('popup-opened');
    }
    return () => document.body.classList.remove('popup-opened');
  }, [showRecommendationModal]);

  const closeRecommendationModal = () => setShowRecommendationModal(false);

  return (
    <div className="content courses" id="courses">
      {playingPlacementVideo && currentPlacementVideo && (
        <>
          <div className="video-testimonial-backdrop" onClick={handleClosePlacementVideo} aria-hidden />
          <div className="video-player-holder">
            <button type="button" className="video-player-close" onClick={handleClosePlacementVideo} aria-label="Close">✕</button>
            <video
              ref={centerPlacementVideoRef}
              src={currentPlacementVideo.videoSrc}
              controls
              onEnded={() => setPlayingPlacementVideo(null)}
            />
          </div>
        </>
      )}

      <div className="content-block courses-content-block">
        <div className="lt courses">
          <CourseSection />
        </div>
        <div className="rt gallery-rt">
          <div className="course-recommendation-card recommendation-cta-card">
            <div className="recommendation-card-content">
              <div className="recommendation-text">
                <h4 className="recommendation-cta-card__title">Can I suggest a course for you?</h4>
                <p className="recommendation-cta-card__description">
                Answer a few quick questions and we'll recommend the perfect course based on your interests and qualifications.
                </p>
              </div>
              <button
                type="button"
                className="recommendation-btn recommendation-popup-btn"
                onClick={() => setShowRecommendationModal(true)}
              >
                Get Course Recommendation
              </button>
            </div>
          </div>
          <div className="text-box gallery-sidebar-section placement-videos-sidebar">
            <h3>Recent Placements</h3>
            <div className="placement-videos-list">
              {placementVideos.map((video) => (
                <div
                  key={video.id}
                  className="testi-card placement-video-card-sidebar"
                  onClick={() => setPlayingPlacementVideo(video.id)}
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
          <div className="text-box iata-certified-card gallery-iata-card">
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
          
        </div>
      </div>

      {/* Course Recommendation form popup */}
      {showRecommendationModal && (
        <div
          className="articles-page modal-backdrop recommendation-modal-backdrop"
          style={{ display: 'flex' }}
          onClick={closeRecommendationModal}
          role="dialog"
          aria-modal="true"
          aria-label="Get course recommendation"
        >
          <div
            className="modal recommendation-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="recommendation-modal-close"
              onClick={closeRecommendationModal}
              aria-label="Close"
            >
              <i className='fa fa-times'></i>
            </button>
            <div className="recommendation-modal-content">
              <CourseRecommendation />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
