'use client';

import { useParams, Link } from '@/lib/router';
import { useEffect, useRef, useState } from 'react';
import { getCourseById } from '../data/coursesData';
import UsefulLinksSection from '../components/UsefulLinksSection';

const getAssetUrl = (path) => `${'/'}${path}`;

const placementVideos = [
  { id: 'placement-1', thumbnail: getAssetUrl('icons/nilani.jpg'), videoSrc: getAssetUrl('gallery/placement-video2.webm'), title: 'Nilani', company: 'IndiGo', airlineLogo: 'indigo' },
  { id: 'placement-2', thumbnail: getAssetUrl('icons/pumin.jpg'), videoSrc: getAssetUrl('gallery/placement-video1.webm'), title: 'Pumin', company: 'Air India', airlineLogo: 'airindia' }
];

function CourseDetail() {
  const { id } = useParams();
  const course = getCourseById(id);
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

  const handleEnrollClick = (e) => {
    e.preventDefault();
    const event = new CustomEvent('openEnquiryForm', { detail: { title: 'Course Enrollment' } });
    window.dispatchEvent(event);
  };

  if (!course) {
    return (
      <div className="content" id="course-detail">
        <div className="content-block">
          <p>Course not found.</p>
          <Link to="/courses" className="know-more">← Back to Courses</Link>
        </div>
      </div>
    );
  }

  const imageUrl = getAssetUrl(course.image);

  return (
    <div className="content course-detail-page" id="course-detail">
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
      <div className="content-block course-detail-layout">
        <p className="course-detail-back">
          <Link to="/courses" className="know-more">Back to Programs &amp; Courses</Link>
        </p>

        <div className="lt course-detail-lt">
          <div className="course-detail-content content-box">
            <h1 className="course-detail-title">
              {course.title}
              {(course as { subtitle?: string }).subtitle && <span className="course-detail-subtitle">{(course as { subtitle?: string }).subtitle}</span>}
              {course.duration && (
                <span className="course-duration-highlight">Duration: <strong>{course.duration}</strong></span>
              )}
            </h1>

            <img src={imageUrl} className="course-thumb course-detail-thumb" loading="lazy" alt="" />

            <div className="course-detail-info">
              <div className="course-eligibility-block course-eligibility-block--detail">
                <h4>Eligibility Criteria</h4>
                <ul className={course.eligibility.length > 2 ? 'clear' : ''}>
                  {course.eligibility.map((item, index) => (
                    <li
                      key={index}
                      className={typeof item === 'string' && item.trim().toLowerCase().startsWith('age') ? 'course-age-criteria' : ''}
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                </ul>
              </div>

              {course.modules && course.modules.length > 0 && (
                <>
                  <h2 className="course-detail-section-title">What you can learn</h2>
                  {course.modules.map((module, index) => (
                    <div key={index} className="course-detail-module">
                      <h4>{index + 1}. {module.title}</h4>
                      <span className="txt">{module.desc}</span>
                    </div>
                  ))}
                  <div className="note">Selection will depend on the outcome of personal interviews</div>
                </>
              )}

              <h4>Kite Strengths</h4>
              <div className="kpis">
                {course.kpis.map((kpi, index) => (
                  <div key={index} className="item">
                    <label>{kpi.label}</label>
                    {kpi.value}
                  </div>
                ))}
              </div>

              <div className="course-detail-certificates">
                <h4>Govt Recognized Certificate (AASSC)</h4>
                <div className="certificates">
                  {course.certificates.map((cert, index) => (
                    <a
                      key={index}
                      href={cert.url}
                      target={cert.isInternal ? '_self' : '_blank'}
                      rel={cert.isInternal ? '' : 'noopener noreferrer'}
                      className={`${cert.className} tooltip-btn`}
                    >
                      <span className="tooltip-txt">{cert.url}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="fix-btn course-detail-actions">
                <Link to="/courses" className="btn-back-courses">View all courses</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="rt course-detail-rt">
          <div className="text-box course-detail-sidebar">
            <div className="course-detail-sidebar-register">
              <h3 className="course-detail-sidebar-register-title">Ready to take off?</h3>
              <p className="course-detail-sidebar-register-text">
                Seats are limited and fill fast. Register now to secure your spot—our admissions team will reach out to guide you through the next steps.
              </p>
            </div>
            <div className="course-detail-rt-cta">
              <a className="apply-now" onClick={handleEnrollClick} href="#enquiry">Apply Now</a>
            </div>
          </div>

          <div className="text-box iata-certified-card course-detail-iata-card">
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

          <div className="course-detail-sidebar-section gallery-sidebar-section placement-videos-sidebar">
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
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
